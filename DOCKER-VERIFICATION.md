✅ CHECKLIST DE VÉRIFICATION - Images et Configuration Docker

## 📋 Avant d'utiliser les images Docker

### Étape 1: Vérifications Pré-Build ✅

- [ ] Docker Desktop installé (`docker --version`)
- [ ] Docker Compose disponible (`docker compose --version`)
- [ ] Au minimum 4 GB de RAM disponible
- [ ] Espace disque: 2+ GB disponible
- [ ] Sur macOS: Docker Desktop daemon running
- [ ] Sur Linux: Docker daemon running (`sudo systemctl status docker`)

### Étape 2: Fichiers Essentiels Présents ✅

- [ ] `docker-compose.yml` - Orchestration
- [ ] `backend/Dockerfile` - Image Backend
- [ ] `frontend/Dockerfile` - Image Frontend
- [ ] `nginx/default.conf` - Configuration Nginx
- [ ] `backend/.dockerignore` - Exclusions backend
- [ ] `frontend/.dockerignore` - Exclusions frontend
- [ ] `.env.docker.example` - Template variables

### Étape 3: Configuration Initiale ✅

```bash
# Copier et adapter le fichier .env
cp .env.docker.example .env.docker
```

**Checklist contenu .env.docker**:
- [ ] DB_USER défini
- [ ] DB_PASSWORD défini (non "password", min 8 chars)
- [ ] DB_NAME = emploi_plus_db_cg
- [ ] JWT_SECRET défini (min 32 chars)
- [ ] CORS_ORIGIN = http://localhost
- [ ] GEMINI_API_KEY défini

---

## 🚀 Démarrage Rapide

```bash
# 1. Configuration
cp .env.docker.example .env.docker

# 2. Démarrer les services
docker compose up -d --build

# 3. Vérifier l'état
docker compose ps
# Tous les services doivent être "Up (healthy)"

# 4. Accéder à l'application
# Frontend:  http://localhost
# Backend:   http://localhost:5000
# Database:  localhost:5432
```

---

## ✅ Vérifications Principales

```bash
# Tester Frontend
curl http://localhost/health

# Tester Backend API
curl http://localhost:5000/api/health

# Tester Database depuis Backend
docker compose exec backend psql $DATABASE_URL -c "SELECT 1"

# Voir les logs
docker compose logs -f

# Arrêter proprement
docker compose down
```

---

**Statut**: ✅ Ready for Use
**Dernière mise à jour**: Mars 8, 2026
