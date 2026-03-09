# 🚀 Docker Quickstart - Emploi Connect

**Bienvenue!** Ce guide vous permet de démarrer rapidement avec Docker.

---

## ⚡ Démarrage en 2 minutes

### Prérequis
- Docker Desktop installé ([télécharger ici](https://www.docker.com/products/docker-desktop))
- Terminal / Command Line
- Fichier `.env.docker` (voir plus bas)

### Démarrage Simple

```bash
cd ~/public_html/emploi-connect-

# 1️⃣ Créer le fichier des variables si absent
cp .env.docker.example .env.docker  # (ou voir section ci-dessous)

# 2️⃣ Lancer les conteneurs
docker compose up -d --build

# 3️⃣ Vérifier que tout fonctionne
docker compose ps

# 4️⃣ Accéder à l'app
# Frontend:  http://localhost
# Backend:   http://localhost:5000
# DB:        localhost:5432
```

### Ou avec le script automatisé

```bash
chmod +x docker-start.sh
./docker-start.sh
```

---

## 📝 Configuration Initiale

### 1. Créer `.env.docker`

Créez ce fichier à la racine (copie de `DOCKER-COMMANDS.md` - section `.env.docker`):

```bash
# Pour development - Ces valeurs par défaut conviennent pour local
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emploi_plus_db_cg
NODE_ENV=development
JWT_SECRET=dev_secret_key_for_testing_only
CORS_ORIGIN=http://localhost
GEMINI_API_KEY=AIzaSyDSAj76TtI_KjzrEZi-hSMji-WqH2GOXnQ
```

**⚠️ Important** : 
- Ne **JAMAIS** commiter `.env.docker` (il est dans `.gitignore`)
- Pour production: générer des secrets forts (`openssl rand -hex 32`)

---

## 📁 Structure des Fichiers Docker

Après lancement, vous aurez cette structure:

```
emploi-connect-/
├── docker-compose.yml          ← Orchestration
├── DOCKER.md                   ← Documentation complète
├── DOCKER-COMMANDS.md          ← Commandes utiles
├── DOCKER-SECURITY.md          ← Sécurité
├── DOCKER-FAQ.md               ← Questions/Problèmes
├── docker-start.sh             ← Script de démarrage
├── .env.docker                 ← Variables (config locale)
├── nginx/
│   └── default.conf            ← Config Nginx (proxy)
├── backend/
│   ├── Dockerfile              ← Image backend
│   └── .dockerignore           ← Fichiers à exclure
└── frontend/
    ├── Dockerfile              ← Image frontend
    └── .dockerignore           ← Fichiers à exclure
```

---

## 🎯 Le Modèle de Conteneurs

```
VOTRE NAVIGATEUR
        ↓
   [Nginx - Port 80]
   ├── Sert le frontend (React)
   ├── Route /api → Backend
   └── Route /uploads → Backend
        ↓                    ↓
   [Frontend Vite]    [Backend Node.js]
   (port 5173)         (port 5000)
                           ↓
                    [PostgreSQL]
                     (port 5432)
                        ↓
                    📊 Données
```

---

## 🔧 Commandes Essentielles

| Commande | Effet |
|----------|--------|
| `docker compose up -d` | Démarrer en background |
| `docker compose down` | Arrêter complètement |
| `docker compose logs -f backend` | Voir les logs |
| `docker compose ps` | État des conteneurs |
| `docker compose exec backend sh` | Terminal dans le conteneur |

**👉 Voir `DOCKER-COMMANDS.md` pour la liste complète**

---

## 🌐 Accès à l'Application

| Service | URL | Login |
|---------|-----|-------|
| Frontend (Vitrine) | `http://localhost` | Browser |
| Backend (API) | `http://localhost:5000` | Header `Authorization: Bearer JWT` |
| Database | `localhost:5432` | User: `postgres` |

### Tester l'API

```bash
# Health check
curl http://localhost/health

# Lister les emplois (sans JWT)
curl http://localhost/api/jobs

# Avec authentification (ajouter le token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost/api/jobs
```

---

## 🐛 Debugging Rapide

### "Connection refused" (Backend)

```bash
# Vérifier que la DB est prête
docker compose logs db | grep "SELECT 1"

# Vérifier que le backend démarre sans erreur
docker compose logs backend | grep -i "error"
```

### "502 Bad Gateway" (Nginx)

```bash
# Vérifier la config Nginx
docker compose exec frontend curl http://backend:5000/api/health
```

### Aucune des données visibles

```bash
# Vérifier la connexion DB
docker compose exec backend sh
# Puis:
psql $DATABASE_URL -c "SELECT COUNT(*) FROM jobs;"
```

**👉 Voir `DOCKER-FAQ.md` pour plus de problèmes**

---

## 📦 Mise à jour du Code

### Mettre à jour le Frontend

```bash
# Votre code a changé (fichiers React, CSS, etc.)
git add .
git commit -m "feat: update UI"
git push origin main

# Sur le serveur:
git pull origin main
docker compose build frontend
docker compose up -d frontend
```

### Mettre à jour le Backend

```bash
# Votre code backend a changé
git add .
git commit -m "feat: new API endpoint"
git push origin main

# Sur le serveur:
git pull origin main
docker compose build backend
docker compose up -d backend
```

---

## 🔒 Sécurité de Base

✅ **À faire**:
- Génerer des secrets forts: `openssl rand -hex 32`
- Utiliser `.env.docker` pour les secrets (jamais en dur)
- Changer les credentials PostgreSQL en production

❌ **À ne JAMAIS faire**:
- Commiter `.env.docker` (ou `.env`)
- Exposer les secrets dans les logs
- Utiliser `admin`/`password` en production

**👉 Voir `DOCKER-SECURITY.md` pour les détails**

---

## 📚 Documentation Complète

| Document | Sujet |
|----------|--------|
| `DOCKER.md` | 📋 Guide complet (stack, architecture, Dockerfiles) |
| `DOCKER-COMMANDS.md` | 🔧 Toutes les commandes Docker |
| `DOCKER-SECURITY.md` | 🔒 Sécurité et bonnes pratiques |
| `DOCKER-FAQ.md` | ❓ Q&A et troubleshooting |

---

## 🚀 Prochaines Étapes

### Phase 1: Développement Local
1. ✅ Docker fonctionne sur votre machine
2. ✅ Vous modifiez le code localement
3. ✅ Les changements se reflètent dans les conteneurs

### Phase 2: Déploiement sur VPS
1. Générer des secrets forts
2. Configurer `.env.docker` en production
3. Activer SSL/TLS (Lets Encrypt)
4. Monitorer les ressources

### Phase 3: CI/CD
1. Pipeline GitHub Actions
2. Tests automatiques dans Docker
3. Push automatique vers registry privé
4. Auto-deploy sur VPS

**👉 Voir `DOCKER.md` section "CI/CD" pour l'implémentation**

---

## 💡 Astuces

### Accélérer les builds
```bash
docker compose build --no-cache  # Ignorer le cache
docker builder prune              # Nettoyer les layers inutilisés
```

### Voir la taille des images
```bash
docker images --format "table {{.Repository}}\t{{.Size}}"
```

### Logs avec horodatage
```bash
docker compose logs --timestamps
```

### Plan de récupération rapide
```bash
# En cas de problème:
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## ❓ Aide & Support

Si vous êtes bloqué:

1. **Vérifier les logs**:
```bash
docker compose logs -f
```

2. **Lire la FAQ**: `DOCKER-FAQ.md`

3. **Vérifier l'état**: `docker compose ps`

4. **Restart complet**:
```bash
docker compose down -v && docker compose up -d --build
```

---

## 🎉 Félicitations!

Vous avez maintenant Docker prêt pour Emploi Connect. 

**Bienvenue dans l'ère du déploiement containerisé!** 🐳

---

**Version**: 1.0  
**Date**: Mars 8, 2026  
**Projet**: Emploi Connect  
**Repository**: https://github.com/francklinetoka/emploiplus.git
