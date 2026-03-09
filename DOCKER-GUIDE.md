# 🚀 Guide de Démarrage Docker - Emploi Connect

## ✅ Configuration Corrigée

Votre configuration Docker a été analysée et corrigée. Voici ce qui a été fait :

### 🔧 Corrections Appliquées

1. **docker-compose.yml** :
   - ✅ Ajout de `version: '3.9'`
   - ✅ Correction du healthcheck PostgreSQL
   - ✅ Variables d'environnement complètes
   - ✅ Volumes correctement configurés
   - ✅ Healthchecks et limits de ressources ajoutés

2. **Optimisations** :
   - ✅ BuildKit activé pour builds parallèles
   - ✅ Cache Docker optimisé
   - ✅ npm ci pour installations plus rapides

3. **Sécurité** :
   - ✅ Utilisateurs non-root
   - ✅ Healthchecks configurés
   - ✅ Headers de sécurité Nginx

## 🚀 Démarrage Rapide

### 1. Vérifier la Configuration
```bash
# Test rapide de la configuration
docker compose --env-file .env.docker config --quiet && echo "✅ OK" || echo "❌ Erreur"
```

### 2. Premier Démarrage (avec build)
```bash
# Activer BuildKit pour builds plus rapides
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Démarrer tout (build + run)
docker compose --env-file .env.docker up -d --build
```

### 3. Démarrages Suivants (plus rapide)
```bash
# Si les images existent déjà
docker compose --env-file .env.docker up -d
```

## 📊 Vérification du Fonctionnement

### État des Services
```bash
docker compose --env-file .env.docker ps
```

### Logs en Temps Réel
```bash
# Tous les services
docker compose --env-file .env.docker logs -f

# Service spécifique
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f db
docker compose --env-file .env.docker logs -f frontend
```

### Tests de Santé
```bash
# Base de données
docker compose --env-file .env.docker exec db pg_isready -U postgres

# Backend API
curl http://localhost:5000/api/health

# Frontend
curl http://localhost/
```

## 🌐 URLs d'Accès

- **Frontend** : http://localhost
- **Backend API** : http://localhost:5000
- **Base de données** : localhost:5432 (PostgreSQL)

## 🛑 Arrêt et Nettoyage

```bash
# Arrêt gracieux
docker compose --env-file .env.docker stop

# Arrêt complet
docker compose --env-file .env.docker down

# Arrêt + suppression des volumes (⚠️ perte de données DB)
docker compose --env-file .env.docker down -v

# Nettoyage complet
docker system prune -f
```

## 🔧 Dépannage

### Problème : "Configuration invalide"
```bash
# Voir les détails de l'erreur
docker compose --env-file .env.docker config
```

### Problème : Service ne démarre pas
```bash
# Logs détaillés
docker compose --env-file .env.docker logs [nom_du_service]

# Redémarrer un service
docker compose --env-file .env.docker restart [nom_du_service]
```

### Problème : Port déjà utilisé
```bash
# Voir qui utilise le port
lsof -i :5000
lsof -i :80
lsof -i :5432

# Changer les ports dans .env.docker si nécessaire
```

### Problème : Base de données
```bash
# Accès direct à PostgreSQL
docker compose --env-file .env.docker exec db psql -U postgres -d emploi_plus_db_cg

# Restaurer un backup
docker compose --env-file .env.docker exec -T db psql -U postgres -d emploi_plus_db_cg < backup.sql
```

## 📁 Structure des Fichiers

```
/project/
├── docker-compose.yml          # Orchestration principale
├── .env.docker                 # Variables d'environnement
├── backend/
│   ├── Dockerfile             # Build backend Node.js
│   └── ... (code source)
├── frontend/
│   ├── Dockerfile             # Build frontend React
│   └── ... (code source)
├── nginx/
│   └── default.conf           # Configuration Nginx
└── logs/
    └── backend/               # Logs backend
```

## ⚡ Optimisations de Performance

- **BuildKit** : Builds parallèles et cache intelligent
- **Multi-stage builds** : Images plus légères
- **Healthchecks** : Démarrage ordonné des services
- **Volumes optimisés** : Évite les conflits node_modules
- **Cache npm** : Installation plus rapide des dépendances

## 🔒 Sécurité

- Utilisateurs non-root dans les conteneurs
- Headers de sécurité HTTP
- Variables d'environnement pour les secrets
- Réseau isolé entre services
- Healthchecks pour monitoring

## 🚀 Déploiement Automatique avec GitHub Actions

Pour automatiser les déploiements sans intervention manuelle :

### Configuration GitHub Actions

1. **Workflow automatique** : Le fichier `.github/workflows/deploy.yml` se déclenche à chaque push sur `main`
2. **Déploiement VPS** : Via SSH, mise à jour du code, installation des dépendances et redémarrage avec PM2

### Secrets à Configurer dans GitHub

Allez dans Settings > Secrets and variables > Actions de votre repo :

- `SSH_HOST` : IP ou domaine de votre VPS
- `SSH_USER` : Utilisateur SSH (ex: root ou ubuntu)
- `SSH_PRIVATE_KEY` : Clé privée SSH (générée avec `ssh-keygen`)
- `SSH_PORT` : Port SSH (22 par défaut)

### Configuration du Serveur

1. **Installer Node.js et PM2** sur votre VPS
2. **Cloner le repo** dans `~/public_html`
3. **Première installation** :
   ```bash
   cd ~/public_html
   cd backend && npm install --production
   cd ../frontend && npm install && npm run build
   pm2 start backend/server.js --name "emploiplus-api"
   ```

### Avantages

- ✅ Déploiements automatiques à chaque push
- ✅ Installation automatique des dépendances
- ✅ Redémarrage automatique du serveur
- ✅ Logs et monitoring avec PM2

---

**🎯 Prêt à démarrer ?** Poussez sur `main` pour déclencher le déploiement !