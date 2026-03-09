# 🔒 Guide de Sécurité Docker - Emploi Connect

## Table des Matières
1. [Principes de Sécurité](#principes-de-sécurité)
2. [Secrets et Credentials](#secrets-et-credentials)
3. [Image Layers & Scanning](#image-layers--scanning)
4. [Runtime Security](#runtime-security)
5. [Checklist Pré-Production](#checklist-pré-production)

---

## Principes de Sécurité

### 1️⃣ Toujours exécuter en tant que non-root

❌ **MAUVAIS** - Processus en tant que root:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

✅ **BON** - Utilisateur dédié:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

CMD ["node", "server.js"]
```

**Pourquoi?** Si un attaquant obtient accès au conteneur, il n'aura pas les permissions root.

---

### 2️⃣ Utiliser des images de base sécurisées

| Base Image | Taille | Vulnérabilités | Recommandation |
|----------|--------|---|---|
| `node:20` | 500MB | Hautes | ❌ Trop grande pour prod |
| `node:20-alpine` | 150MB | Très faibles | ✅ Recommandé |
| `node:20-slim` | 280MB | Faibles | ✅ Bon compromis |

**Commande pour scanner les vulnérabilités**:
```bash
docker scan node:20-alpine
```

---

### 3️⃣ Minimiser les couches et la surface d'attaque

❌ **MAUVAIS** - Beaucoup de couches:
```dockerfile
RUN apk add curl
RUN apk add openssh
RUN apk add vim
```

Résultat: 3 couches inutiles, chacune augmentant les vulnérabilités.

✅ **BON** - Regrouper les RUN:
```dockerfile
RUN apk add --no-cache curl openssh vim && \
    apk cache clean --force
```

Résultat: 1 couche, cache nettoyé, surface minimale.

---

### 4️⃣ Supprimer les fichiers sensibles

```dockerfile
# Nettoyer le cache NPM après installation
RUN npm ci --only=production && npm cache clean --force

# Supprimer les fichiers temporaires
RUN rm -rf \
    /tmp/* \
    /var/tmp/* \
    /var/cache/apk/*
```

---

### 5️⃣ Utiliser des images multi-stage

Réduit la taille finale en excluant les dev tools.

✅ **Frontend - Exemple bon**:
```dockerfile
# Stage 1: Build avec Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Stage 2: Serveur Nginx (sans Node!)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Taille finale: 50MB au lieu de 500MB
```

---

## Secrets et Credentials

### ❌ JAMAIS faire cela:

```dockerfile
# ❌ DANGER: Secret en dur dans l'image
ENV JWT_SECRET="aZ9jF3xK2pQ8vL1mN6rT"

# ❌ DANGER: Secret dans l'historique Git
RUN echo "GEMINI_API_KEY=AIzaSy..." > /app/.env
```

**Raison**: Les images Docker sont des fichiers, accessibles à qui peut les extraire.

---

### ✅ Solutions recommandées:

#### 1. Build Arguments (pour non-secret uniquement)

```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
```

Utilisation:
```bash
docker build --build-arg NODE_ENV=production .
```

#### 2. Secrets Docker en build time

```dockerfile
# Dockerfile
RUN --mount=type=secret,id=jwt_secret \
    cat /run/secrets/jwt_secret > /app/config/.env
```

Utilisation:
```bash
docker build \
  --secret id=jwt_secret,src=./jwt.secret \
  -t myapp .
```

#### 3. Environment File en Runtime

✅ **RECOMMANDÉ** - Charger depuis un fichier:
```bash
docker compose --env-file .env.production up -d
```

#### 4. Docker Secrets (Swarm mode)

```bash
# Créer un secret
echo "your_secret_value" | docker secret create jwt_secret -

# Utiliser dans docker-compose.yml
environment:
  JWT_SECRET_FILE: /run/secrets/jwt_secret
```

#### 5. Volume Montés en Runtime

```yaml
volumes:
  - /secure/location/secrets:/app/secrets:ro
```

#### 6. Services Externes (Vault, AWS Secrets Manager)

```javascript
// backend/config/secrets.js
import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager();

async function getSecret(name) {
  try {
    const secret = await secretsManager.getSecretValue({ 
      SecretId: name 
    }).promise();
    return JSON.parse(secret.SecretString);
  } catch (err) {
    console.error('Failed to retrieve secret:', err);
    throw err;
  }
}
```

---

## Image Layers & Scanning

### Analyser une image pour vulnérabilités

```bash
# Avec trivy (https://github.com/aquasecurity/trivy)
trivy image emploi_backend:latest

# Avec Grype (https://github.com/anchore/grype)
grype ghcr.io/emploiplus/backend:latest

# Avec docker scout (docker répertoire)
docker scout cves emploi_backend:latest
```

### Historique des couches d'une image

```bash
docker history emploi_backend:latest

# Résultat:
# IMAGE          CREATED       SIZE      COMMAND
# abc123...      2 hours ago   15MB      RUN npm ci
# def456...      3 hours ago   80MB      COPY . .
# ghi789...      3 hours ago   56MB      RUN apk add curl
```

### Vérifier la taille des images

```bash
docker images --format "table {{.Repository}}\t{{.Size}}" | sort -k3 -h
```

---

## Runtime Security

### 1️⃣ Limiter les ressources

```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
    reservations:
      memory: 512M
```

**Prévient**:
- Denial of Service (DoS) accidentel
- Fuite mémoire non détectée

---

### 2️⃣ Isolation du Filesystem

```yaml
# Rendre le filesystem en lecture seule (sauf /tmp)
security_opt:
  - no-new-privileges:true
```

```dockerfile
# Dans Dockerfile - réduire les permissions
RUN chmod 755 /app
RUN chmod 755 /app/uploads
```

---

### 3️⃣ Réseau isolé

```yaml
networks:
  emploi-network:
    driver: bridge
```

Au lieu d'exposer tous les services sur l'host:
- ✅ `backend` accessible à `frontend` via `http://backend:5000`
- ❌ `backend` n'est pas exposé à Internet (port pas publié)
- ❌ `db` n'est pas accessible de l'extérieur

---

### 4️⃣ Vérifier les processus en cours d'exécution

```bash
# Voir les processus du backend
docker compose exec backend ps aux

# Résultat attendu (sans processus suspect):
# UID    PID  COMMAND
# nodejs   1   node server.js
```

---

### 5️⃣ Health Checks robustes

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 15s
```

Le backend doit répondre avec un endpoint `/api/health` sûr:

```javascript
// backend/server.js
app.get('/api/health', (req, res) => {
  // Ne pas exposer les secrets ici!
  res.json({ 
    status: 'ok',
    uptime: process.uptime()
    // pas de: SECRET, DATABASE_URL, etc.
  });
});
```

---

## Checklist Pré-Production

### ✅ Images de base

- [ ] Images à jour (`docker pull node:20-alpine`)
- [ ] Versions spécifiées (PAS de `latest`)
- [ ] Scan des vulnérabilités effectué
- [ ] Tailles acceptables (<200MB pour backend Alpine)

### ✅ Dockerfile

- [ ] Non-root user configuré
- [ ] Cache NPM nettoyé
- [ ] Fichiers temporaires supprimés
- [ ] Multi-stage pour production
- [ ] `.dockerignore` complète
- [ ] Health checks définis

### ✅ Secrets

- [ ] Aucun secret en dur dans Dockerfile
- [ ] Aucun secret en dur dans .env git
- [ ] Secrets générés avec cryptographie forte (32 chars min)
- [ ] Secrets stockés en externe (vault, AWS Secrets)
- [ ] Rotation des secrets planifiée

### ✅ Runtime

- [ ] Ressources limitées (CPU, RAM)
- [ ] Réseau isolé (non-root network)
- [ ] Logs centralisés
- [ ] Monitoring/alerting actif
- [ ] Backups testés régulièrement

### ✅ Déploiement

- [ ] SSL/TLS configuré (Lets Encrypt)
- [ ] Reverse proxy (Nginx) devant Services
- [ ] Rate limiting activé
- [ ] CORS restrictif (pas d'`*`)
- [ ] Headers de sécurité (HSTS, CSP, etc.)

---

## 🚨 Pires Pratiques à Éviter

| Pratique | Risque | Solution |
|----------|--------|----------|
| `docker run -it --privileged` | Root complet + capacités Linux | Utiliser `--cap-drop=ALL` |
| `docker run --net=host` | Aucune isolation réseau | Utiliser un réseau bridge |
| `docker run -v /:/host` | Accès complet au host! | Limiter les volumes montés |
| `FROM node:latest` | Version inconnue, mises à jour non contrôlées | Spécifier la version: `node:20-alpine` |
| Copier `node_modules` du host | Binaires incompatibles | Installer dans le Dockerfile |
| Utiliser `sudo` dans conteneur | Augmente les permissions | Pas de besoin du tout |

---

## 🔍 Audit de Sécurité

Script pour vérifier votre setup Docker:

```bash
#!/bin/bash

echo "🔍 Audit de Sécurité Docker"
echo ""

# 1. Vérifier les utilisateurs
echo "1️⃣  Utilisateurs dans les images:"
docker compose exec backend id
docker compose exec frontend id
# Résultat attendu: uid=1001(nodejs), pid=1001(nodejs) (PAS 0=root)

# 2. Vérifier les resources
echo ""
echo "2️⃣  Limites de ressources:"
docker inspect emploi_backend | jq '.HostConfig | {CpuQuota, Memory, MemorySwap}'

# 3. Vérifier les mounts
echo ""
echo "3️⃣  Volumes montés:"
docker inspect emploi_backend | jq '.Mounts'

# 4. Vérifier les ports exposés
echo ""
echo "4️⃣  Ports exposés:"
docker port emploi_backend

# 5. Scan des images
echo ""
echo "5️⃣  Scan des vulnérabilités (si trivy installé):"
which trivy && trivy image emploi_backend:latest || echo "Trivy non installé"
```

---

## 📚 Ressources Externes

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [OWASP Docker Security](https://owasp.org/www-project-infrastructure-as-code-security/)
- [Synk Container Vulnerabilities](https://snyk.io/blog/10-docker-image-security-best-practices/)
- [Aqua Security Trivy](https://github.com/aquasecurity/trivy)

---

**Version**: 1.0  
**Dernière mise à jour**: Mars 8, 2026  
**Responsable**: Équipe DevOps Emploi Connect
