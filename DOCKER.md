# 📦 Guide Docker - Emploi Connect Architecture

## Table des matières
1. [Analyse de la Stack](#analyse-de-la-stack)
2. [Architecture Docker](#architecture-docker)
3. [Détails des Dockerfiles](#détails-des-dockerfiles)
4. [Gestion de l'Environnement](#gestion-de-lenvironnement)
5. [Guide d'Utilisation](#guide-dutilisation)
6. [Dépannage](#dépannage)

---

## 1. Analyse de la Stack

### 📋 Composition Technologique

Votre application **Emploi Connect** repose sur une architecture **microservices conteneurisée** composée de trois couches principales :

#### **Frontend - Vitrine Web**
- **Framework**: Vite 7.3 + React 18
- **Langage**: TypeScript
- **Styling**: Tailwind CSS 3.4 + ShadCN/UI
- **Port**: 5173 (développement) / 80 (production)
- **Sorties**: Build statique (dossier `dist/`)
- **Optimisations**: 
  - Compression gzip (vite-plugin-compression)
  - Code splitting automatique avec Vite
  - Minification avec Terser

#### **Backend - API REST**
- **Runtime**: Node.js 20+ (ESM modules)
- **Framework**: Express 5.2
- **Langage**: TypeScript/JavaScript
- **Port**: 5000
- **Dépendances Clés**:
  - **JWT**: Authentication stateless
  - **Multer**: Upload de fichiers/CV
  - **Nodemailer**: Envoi d'emails
  - **Sharp**: Traitement d'images (CV en PDF)
  - **node-cron**: Tâches planifiées (sitemap)
  - **@google/generative-ai**: IA Gemini pour candidatures intelligentes
  - **Helmet**: Headers de sécurité
  - **CORS**: Gestion des domaines autorisés
  - **express-rate-limit**: Protection contre les abus

#### **Base de Données - PostgreSQL**
- **Type**: Relationnel
- **Version**: 15+
- **Driver**: pg (PostgreSQL Native)
- **Port**: 5432
- **Base**: `emploi_plus_db_cg`
- **Utilisateur**: `postgres`
- **Schéma**:
  - Tables: users, jobs, applications, formations, notifications, audit_logs, etc.
  - Migrations: Scripts versionnés dans `backend/migrations/`

#### **Reverse Proxy optionnel**
- **Service**: Nginx
- **Rôle**: Routage HTTP/HTTPS, gestion des certificats SSL, cache statique
- **Configuration**: Fournie dans `nginx.conf.example`

---

## 2. Architecture Docker

### 🏗️ Topologie des Services

```
┌─────────────────────────────────────────────────────┐
│                    NGINX (Port 80/443)              │
│              Reverse Proxy + Load Balancer           │
└──────────────┬────────────────────────┬──────────────┘
               │                        │
        ┌──────▼──────┐        ┌────────▼─────┐
        │  Frontend    │        │   Backend     │
        │  (Vite+React)│        │  (Express)    │
        │  Port 5173   │        │  Port 5000    │
        │ Container    │        │  Container    │
        └──────┬───────┘        └────────┬──────┘
               │                         │
               │    Requêtes API         │
               └────────────────────────►
                    /api/* routes
               ◄────────────────────────
               
               └────────────────────────┐
                    Partage: /uploads    │
                                         │
                                    ┌────▼────────────┐
                                    │   PostgreSQL    │
                                    │   Port 5432     │
                                    │   Container     │
                                    └─────────────────┘
```

### 📁 Structure du Project vs Containers

```
Projet Local                    Docker Volumes/Mounts
├── frontend/                   → /app/frontend
│   ├── src/                   → /app/frontend/src
│   ├── dist/                  → /app/frontend/dist (copié)
│   └── node_modules/          → Isolé dans container
├── backend/                    → /app/backend
│   ├── routes/                → /app/backend/routes
│   ├── controllers/           → /app/backend/controllers
│   ├── migrations/            → /app/backend/migrations
│   ├── config/                → /app/backend/config
│   └── node_modules/          → Isolé dans container
├── .env                        → ${PWD}/.env → /app/.env
└── docker-compose.yml         → Orchestration
```

### 🔌 Communication Inter-Conteneurs

| Service | Endpoint Interne | Endpoint Externe |
|---------|------------------|------------------|
| **Frontend** | N/A | `http://localhost` |
| **Backend** | `http://backend:5000` | `http://localhost:5000` |
| **PostgreSQL** | `postgresql://postgres:password@db:5432/emploi_plus_db_cg` | `postgresql://postgres:password@localhost:5432` |
| **Nginx** | N/A | Port 80 (HTTP), 443 (HTTPS) |

**Point important**: À l'intérieur des conteneurs, utilisez les noms des services Docker (`backend`, `db`) et non `localhost`.

---

## 3. Détails des Dockerfiles

### 📄 Dockerfile - Backend (Node.js + Express)

**Chemin**: `backend/Dockerfile`

```dockerfile
# Stage 1: Builder - Compilation et installation des dépendances
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration npm
COPY backend/package*.json ./

# Installer les dépendances (incluant dev pour les types TypeScript)
RUN npm ci --include=dev

# Copier tout le code source
COPY backend/ .

# Compiler TypeScript (si nécessaire - sinon JSX/TS sont gérés en runtime)
# RUN npm run build  # Décommenter si vous avez une étape de build

# ---

# Stage 2: Runtime - Image minimale pour production
FROM node:20-alpine

WORKDIR /app

# Installer dumb-init pour gérer les signaux Unix correctement
RUN apk add --no-cache dumb-init curl

# Copier package.json du builder
COPY --from=builder /app/package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier le code du builder
COPY --from=builder /app/ .

# Créer les répertoires nécessaires
RUN mkdir -p uploads tmp logs

# Définir l'utilisateur non-root (sécurité)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Utiliser dumb-init pour gérer correctement les signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "server.js"]
```

**Justifications des choix**:
- **Alpine Linux**: Image ultra-légère (150 MB vs 900 MB), réduit les vulnérabilités
- **Multi-stage**: Réduit la taille finale en excluant les dev dependencies
- **node:20-alpine**: LTS stable, support à long terme
- **dumb-init**: Gère correctement l'arrêt gracieux (SIGTERM/SIGKILL)
- **User nodejs**: Isolation de sécurité, pas d'accès root
- **Health check**: Monitore l'état de l'API

---

### 📄 Dockerfile - Frontend (Vite + React)

**Chemin**: `frontend/Dockerfile`

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers npm
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm ci --include=dev

# Copier le code source
COPY frontend/ .

# Build Vite (génère dist/)
RUN npm run build

# ---

# Stage 2: Serveur Web Nginx
FROM nginx:alpine

# Copier la configuration Nginx customisée
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copier les assets construits du stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Créer un utilisateur non-root (optionnel pour Alpine Nginx)
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx

# Exposer le port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Justifications des choix**:
- **Build vs Runtime sépare**: Frontend n'a pas besoin de Node.js en production
- **Nginx Alpine**: Serveur web performant et léger (50 MB)
- **Static assets**: Servis directement par Nginx (performance)
- **Health check**: Vérifie la disponibilité du serveur web

---

### 📄 Configuration Nginx

**Chemin**: `nginx/default.conf`

```nginx
server {
    listen 80;
    server_name _;

    # Racine des fichiers statiques
    root /usr/share/nginx/html;
    index index.html;

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Sécurité - Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Proxy vers le Backend API
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Servir les uploads
    location /uploads/ {
        proxy_pass http://backend:5000/uploads/;
        proxy_cache_valid 200 1h;
        expires 1h;
    }

    # SPA React - Fallback sur index.html pour les routes non-trouvées
    location / {
        try_files $uri $uri/ /index.html;
        # Cache busting pour assets vite
        expires -1;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # Cache les assets statiques (hash dans le nom)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Désactiver l'accès aux fichiers sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

### 📄 Docker Compose - Orchestration Complète

**Chemin**: `docker-compose.yml`

```yaml
version: '3.9'

services:
  # ============================================
  # PostgreSQL - Base de Données
  # ============================================
  db:
    image: postgres:15-alpine
    container_name: emploi_db
    restart: unless-stopped
    
    # Variables d'environnement (depuis fichier ou en dur)
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-emploi_plus_db_cg}
      PGDATA: /var/lib/postgresql/data/pgdata
    
    # Ports
    ports:
      - "${DB_PORT:-5432}:5432"
    
    # Volumes
    volumes:
      # Persistance des données
      - postgres_data:/var/lib/postgresql/data
      # Scripts d'initialisation optionnels
      - ./backend/migrations:/docker-entrypoint-initdb.d:ro
    
    # Health check PostgreSQL
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    
    networks:
      - emploi-network
    
    # Limites de ressources
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M

  # ============================================
  # Backend API - Node.js + Express
  # ============================================
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: emploi_backend
    restart: unless-stopped
    
    # Dépendance: attendre que DB soit prête
    depends_on:
      db:
        condition: service_healthy
    
    # Variables d'environnement
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 5000
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/${DB_NAME:-emploi_plus_db_cg}
      JWT_SECRET: ${JWT_SECRET:-your_jwt_secret_key_change_this_in_production}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
      SITEMAP_TOKEN: ${SITEMAP_TOKEN}
    
    # Ports
    ports:
      - "5000:5000"
    
    # Volumes
    volumes:
      # Code source (dev mode - permet HMR)
      - ./backend:/app:delegated
      - /app/node_modules  # Anonyme pour isolation
      # Uploads persistants
      - uploads:/app/uploads
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    
    networks:
      - emploi-network
    
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          memory: 512M

  # ============================================
  # Frontend - Vite + React + Nginx
  # ============================================
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: emploi_frontend
    restart: unless-stopped
    
    # Ports
    ports:
      - "80:80"
      - "443:443"
    
    # Volumes
    volumes:
      # Config Nginx customisée
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      # Certificats SSL (optionnel)
      - ./certs:/etc/nginx/certs:ro
      # Logs
      - nginx_logs:/var/log/nginx
    
    # Health check
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    
    networks:
      - emploi-network
    
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M

# ============================================
# Réseaux
# ============================================
networks:
  emploi-network:
    driver: bridge

# ============================================
# Volumes Persistants
# ============================================
volumes:
  postgres_data:
    driver: local
  uploads:
    driver: local
  nginx_logs:
    driver: local
```

**Points clés du docker-compose.yml**:
- **depends_on + healthcheck**: Assure que la DB est prête avant de lancer le backend
- **DATABASE_URL**: Utilise le nom du service `db` (résolution DNS interne)
- **Volumes anonymes**: `/app/node_modules` évite que node_modules du host interfère
- **Networks**: Isolation du trafic, communication sécurisée entre conteneurs
- **Limites de ressources**: Évite qu'un service consomme trop de RAM/CPU

---

## 4. Gestion de l'Environnement

### 🔐 Fichiers d'Environnement

#### `.env.local` (Développement - Never commit)
```bash
# Database PostgreSQL
DB_USER=postgres
DB_PASSWORD=dev_password_local
DB_NAME=emploi_plus_db_cg
DB_PORT=5432

# Backend
NODE_ENV=development
PORT=5000
JWT_SECRET=dev_secret_key_for_testing_only
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_key_here
SITEMAP_TOKEN=dev_sitemap_token

# Frontend
VITE_API_URL=http://localhost:5000
```

#### `.env.production` (Production - Utiliser des secrets)
```bash
# Database PostgreSQL
DB_USER=emploi_user
DB_PASSWORD=${POSTGRES_PASSWORD}  # À injecter depuis un secret manager
DB_NAME=emploi_plus_db_cg
DB_PORT=5432

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=${JWT_SECRET}  # Secret fort, 32+ caractères
CORS_ORIGIN=https://emploiplus-group.com
GEMINI_API_KEY=${GEMINI_API_KEY}
SITEMAP_TOKEN=${SITEMAP_TOKEN}

# Frontend
VITE_API_URL=https://emploiplus-group.com
```

#### `.env.docker` (Pour docker-compose in-testing)
```bash
# Database PostgreSQL
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emploi_plus_db_cg
DB_PORT=5432

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret_min_32_chars
CORS_ORIGIN=http://localhost
GEMINI_API_KEY=AIzaSyDSAj76TtI_KjzrEZi-hSMji-WqH2GOXnQ
SITEMAP_TOKEN=your_sitemap_token_here

# Frontend
VITE_API_URL=http://localhost/api
```

### 🔗 Injection des Variables - Trois Approches

**1. Depuis le docker-compose.yml (Simple, pour dev/staging)**
```yaml
environment:
  DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```
Commande: `docker compose --env-file .env.docker up`

**2. Via les secrets Docker Swarm (Production mode)**
```yaml
environment:
  DATABASE_URL: postgresql://user:${POSTGRES_PASSWORD_FILE}/database
secrets:
  - POSTGRES_PASSWORD_FILE
  
secrets:
  POSTGRES_PASSWORD_FILE:
    external: true  # Créé avec: docker secret create POSTGRES_PASSWORD_FILE -
```

**3. Via les variables d'environnement du système**
```bash
# Avant de lancer
export DB_PASSWORD="super_secure_password"
docker compose up
```

### 📡 Communication Inter-Services

#### Backend → PostgreSQL
```javascript
// backend/config/db.js
// À l'intérieur du conteneur, utiliser le nom du service
const DATABASE_URL = process.env.DATABASE_URL;
// = postgresql://postgres:postgres@db:5432/emploi_plus_db_cg

const pool = new Pool({
  connectionString: DATABASE_URL
});
```

#### Frontend → Backend
```typescript
// frontend/src/services/api.ts
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';

// En DEHORS du conteneur (accès depuis le navigateur)
// = "http://localhost:5000/api/..."

// EN DEDANS du conteneur (server-side rendering si applicable)
// = "http://backend:5000/api/..."
```

#### Frontend → Backend (via Nginx proxy)
```nginx
# nginx/default.conf
location /api/ {
    proxy_pass http://backend:5000;  # Utilise le nom du service
}
```

---

## 5. Guide d'Utilisation

### 🚀 Commandes Essentielles

#### 1. **Démarrage Complet (Développement)**
```bash
# Positionner à la racine du projet
cd ~/public_html/emploi-connect-

# Demander le fichier .env.docker ou le créer
# Les variables sont injectées via docker-compose

# Lancer TOUS les services
docker compose up --build

# Ou en arrière-plan (détaché)
docker compose up -d --build

# Afficher les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend
```

#### 2. **Arrêt et Nettoyage**
```bash
# Arrêter sans supprimer (données persistées)
docker compose stop

# Arrêter complètement
docker compose down

# Supprimer aussi les volumes (ATTENTION: perte de données DB!)
docker compose down -v

# Supprimer aussi les images
docker compose down -v --rmi all
```

#### 3. **Reconstruction des Images**
```bash
# Rebuild tout depuis les Dockerfiles
docker compose build --no-cache

# Rebuild un service spécifique
docker compose build --no-cache backend

# Puis lancer
docker compose up
```

#### 4. **Accès aux Conteneurs**
```bash
# Terminal interactif dans le backend
docker compose exec backend sh

# Terminal dans la DB PostgreSQL
docker compose exec db psql -U postgres -d emploi_plus_db_cg

# Exécuter une commande unique
docker compose exec backend npm run build
docker compose exec db pg_dump -U postgres emploi_plus_db_cg > backup.sql
```

#### 5. **Migration et Seeding (from container)**
```bash
# Lancer les migrations
docker compose exec backend node run-migration.js

# Ou via npm script (si défini)
docker compose exec backend npm run migrate

# Seeding de données de test
docker compose exec backend node scripts/seed.js
```

#### 6. **Gestion des Volumes**
```bash
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect emploi-connect-_postgres_data

# Nettoyer les volumes inutilisés
docker volume prune
```

#### 7. **État et Monitoring**
```bash
# Status des conteneurs
docker compose ps

# Détails d'un conteneur
docker compose inspect backend

# Statistiques CPU/Mémoire en temps réel
docker stats emploi_backend emploi_db emploi_frontend

# Logs avec timestamps et filtrage
docker compose logs --timestamps --tail=100 backend
```

#### 8. **Backup et Restore PostgreSQL**
```bash
# Backup complet depuis le conteneur
docker compose exec db pg_dump -U postgres emploi_plus_db_cg > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore depuis un backup
cat backup_20240315_143022.sql | docker compose exec -T db psql -U postgres emploi_plus_db_cg

# Backup en format binaire (plus rapide)
docker compose exec db pg_dump -U postgres -Fc emploi_plus_db_cg > backup.dump
docker compose exec -T db pg_restore -U postgres -d emploi_plus_db_cg backup.dump
```

---

### 📋 Workflow Complet: Du Code au Production

#### **Étape 1: Préparation Locale**
```bash
# Sur votre machine (macOS)
cd ~/public_html/emploi-connect-

# Commit et push des changements
git add .
git commit -m "feat: maj de feature X"
git push origin main

# S'assurer que les Dockerfiles et docker-compose.yml sont à jour
nano Dockerfile.backend
nano docker-compose.yml
```

#### **Étape 2: Sur le Serveur VPS**
```bash
# SSH sur le serveur
ssh user@emploiplus-group.com

# Aller dans le dossier de production
cd ~/emploi-connect  # ou /var/www/emploi-connect

# Télécharger les derniers changements
git pull origin main

# Reconstruire les images avec le nouveau code
docker compose build --pull --no-cache

# Arrêter les anciens conteneurs gracieusement
docker compose stop

# Lancer les nouveaux conteneurs
docker compose up -d

# Vérifier l'état
docker compose ps

# Afficher les logs du démarrage
docker compose logs -f --tail=50
```

#### **Étape 3: Vérification Post-Déploiement**
```bash
# Tester les health checks
curl http://localhost/health       # Frontend
curl http://localhost:5000/api/health  # Backend

# Vérifier la connexion DB
docker compose exec backend curl postgresql://postgres@db:5432/emploi_plus_db_cg

# Tester une route API
curl http://localhost/api/jobs -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Monitoring des ressources
docker stats --no-stream

# Analyser les logs pour erreurs
docker compose logs | grep -i error
```

---

### 🔄 CI/CD avec Docker (GitHub Actions exemple)

**Chemin**: `.github/workflows/docker-deploy.yml`

```yaml
name: Build & Deploy Docker

on:
  push:
    branches: [main, production]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build images
        run: |
          docker compose build --pull
      
      - name: Run tests
        run: |
          docker compose run backend npm test
      
      - name: Push to registry
        if: github.ref == 'refs/heads/production'
        run: |
          docker tag emploi_backend emploiplus/backend:latest
          docker tag emploi_frontend emploiplus/frontend:latest
          docker push emploiplus/backend:latest
          docker push emploiplus/frontend:latest
      
      - name: Deploy to VPS
        if: github.ref == 'refs/heads/production'
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/emploi-connect
            git pull origin main
            docker compose --file docker-compose.prod.yml pull
            docker compose --file docker-compose.prod.yml up -d
            docker image prune -f
```

---

## 6. Dépannage

### 🐛 Problèmes Courants et Solutions

#### **❌ "Connection refused: db:5432"**
**Cause**: Le service `db` n'est pas prêt avant que le backend ne tente la connexion.
```bash
# Solution 1: Vérifier le health check de la DB
docker compose logs db | grep "SELECT 1"

# Solution 2: Augmenter le temps d'attente dans docker-compose.yml
# Changer start_period: 10s en start_period: 30s

# Solution 3: Vérifier que le backend attend bien
depends_on:
  db:
    condition: service_healthy
```

#### **❌ "Memory limit exceeded"**
**Cause**: Un conteneur consomme trop de RAM.
```bash
# Identifier le coupable
docker stats --no-stream

# Augmenter la limite dans docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G  # Augmenter de 1G à 2G
```

#### **❌ "npm install: EACCES permission denied"**
**Cause**: Problème de permissions entre host et conteneur.
```bash
# Solution: S'assurer que node_modules est un volume anonyme
volumes:
  - /app/node_modules  # Isolation complète

# Nettoyer et rebuilder
docker compose down -v
docker compose build --no-cache
```

#### **❌ "Nginx: proxy_pass error 502 Bad Gateway"**
**Cause**: Le backend ne répond pas ou le nom du service est mal référencé.
```bash
# Vérifier que le backend est accessible depuis Nginx
docker compose exec frontend curl http://backend:5000

# Vérifier le nom du service dans nginx.conf
location /api/ {
    proxy_pass http://backend:5000;  # ✅ Correct
    # proxy_pass http://localhost:5000;  # ❌ WRONG (localhost = container lui-même)
}
```

#### **❌ "CORS error when calling API from frontend"**
**Cause**: Les en-têtes CORS ne sont pas configurés correctement.
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// En production via Nginx, ajouter:
add_header Access-Control-Allow-Origin "https://emploiplus-group.com" always;
add_header Access-Control-Allow-Credentials "true" always;
```

#### **❌ "PostgreSQL: database does not exist"**
**Cause**: La base de données n'a pas été créée au premier démarrage.
```bash
# Solution 1: Créer manuellement
docker compose exec db psql -U postgres -c "CREATE DATABASE emploi_plus_db_cg;"

# Solution 2: Ajouter un script d'initialisation
# Créer: backend/migrations/00-init.sql
# Contenant: CREATE DATABASE IF NOT EXISTS emploi_plus_db_cg;

# Puis monter dans docker-compose.yml:
volumes:
  - ./backend/migrations:/docker-entrypoint-initdb.d
```

#### **❌ "Cannot GET /" (Frontend returns 404)"**
**Cause**: Les assets n'ont pas été buildés dans `dist/`.
```bash
# Solution: Vérifier le build Vite
docker compose logs frontend | grep "error"

# Reconstruire avec debug
docker compose exec frontend npm run build

# S'assurer que Nginx serv les bons fichiers
docker compose exec frontend ls -la /usr/share/nginx/html/
```

#### **❌ "SSL certificate not found"**
**Cause**: Les certificats Lets Encrypt ne sont pas montés.
```bash
# Solution: Créer les répertoires et certificats
mkdir -p certs

# Générer auto-signed pour dev (déprécié en prod)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/privkey.pem \
  -out certs/cert.pem

# Production: Utiliser Certbot/Lets Encrypt
docker run -it --rm -p 80:80 -p 443:443 \
  -v ./certs:/etc/letsencrypt \
  certbot/certbot certonly \
    --standalone \
    -d emploiplus-group.com
```

---

### 📊 Monitoring et Logs

#### **Logs Structurés**
```bash
# Format JSON pour parsing
docker compose logs --format json backend | jq '.log'

# Capture dans un fichier
docker compose logs > application_$(date +%Y%m%d_%H%M%S).log

# Tail en temps réel avec couleurs
docker compose logs -f --timestamps
```

#### **Alertes et Métriques** (Optionnel: Prometheus + Grafana)
```yaml
# docker-compose.yml - ajout de services
monitoring:
  image: prom/prometheus:latest
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin
```

---

## 📚 Fichiers à Créer/Modifier

```
emploi-connect-/
├── Dockerfile (root)  ← Utiliser backend/Dockerfile
├── docker-compose.yml ← Créer à partir du template
├── .dockerignore       ← Créer
├── nginx/
│   ├── nginx.conf      ← Créer
│   └── default.conf    ← Créer (alias)
├── .env.docker         ← Créer
├── .env.production     ← Créer
├── backend/
│   ├── Dockerfile      ← Créer
│   └── .dockerignore   ← Créer
└── frontend/
    ├── Dockerfile      ← Créer
    └── .dockerignore   ← Créer
```

---

## 🔒 Sécurité en Production

- **Pas de root**: Tous les conteneurs tournent sous `nodejs` (uid 1001)
- **Secrets**: Utiliser des secrets Docker Swarm ou Kubernetes secrets
- **Registry privé**: Pousser les images vers Docker Hub/ECR privé
- **Volumes chiffrés**: Activer le chiffrement des volumes (option cloud)
- **Network isolation**: Conteneurs sur réseau privé, Nginx exposé seulement
- **SSL/TLS**: Certificats Lets Encrypt avec renouvellement automatique
- **Rate limiting**: Express rate-limit + Nginx limit_req

---

## 🎯 Checklist Avant Production

- ✅ Fichiers `.env` configurés avec secrets forts
- ✅ Health checks validés (`curl` fonctionnent)
- ✅ Backups PostgreSQL testés et fonctionnels
- ✅ Logs centralisés (journald, Splunk, etc.)
- ✅ Ressources limitées (CPU, RAM) pour éviter le runaway
- ✅ Politique de restart: `unless-stopped`
- ✅ Volume de données sur persistance (NFS, EBS, etc.)
- ✅ Monitoring actif et alertes configurées
- ✅ Récupération d'erreur et rollback plan
- ✅ Certificats SSL/TLS valides

---

**Dernière mise à jour**: Mars 8, 2026
**Auteur**: Équipe DevOps Emploi Connect
**Dépôt**: https://github.com/francklinetoka/emploiplus.git
