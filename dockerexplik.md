# Configuration Docker Actuelle - Emploi Connect

## Vue d'ensemble de l'architecture Docker

L'application Emploi Connect utilise une architecture Docker multi-conteneurs avec trois services principaux :

### Services Docker
1. **db** - PostgreSQL 15 (base de données)
2. **backend** - Node.js 20 + Express (API REST)
3. **frontend** - Nginx + React/Vite (interface utilisateur)

### Réseau et Volumes
- **Réseau** : `emploi-network` (bridge)
- **Volumes persistants** :
  - `postgres_data` : données PostgreSQL
  - `uploads` : fichiers uploadés (CV, etc.)
  - `nginx_logs` : logs Nginx

## Configuration détaillée

### 1. Base de données (PostgreSQL)
```yaml
db:
  image: postgres:15-alpine
  container_name: emploi_plus_db_cg
  restart: unless-stopped
  environment:
    POSTGRES_USER: ${DB_USER:-postgres}
    POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    POSTGRES_DB: ${DB_NAME:-emploi_plus_db_cg}
    PGDATA: /var/lib/postgresql/data/pgdata
  ports:
    - "${DB_PORT:-5432}:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-emploi_plus_db_cg}"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 15s
  networks:
    - emploi-network
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        memory: 256M
```

### 2. Backend (Node.js + Express)
```yaml
backend:
  build:
    context: .
    dockerfile: backend/Dockerfile
  container_name: emploi_backend
  restart: unless-stopped
  depends_on:
    db:
      condition: service_healthy
  environment:
    NODE_ENV: ${NODE_ENV:-production}
    PORT: 5000
    DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@db:5432/${DB_NAME:-emploi_plus_db_cg}
    JWT_SECRET: ${JWT_SECRET:-your_secret_key_min_32_chars}
    GEMINI_API_KEY: ${GEMINI_API_KEY}
    CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
    SITEMAP_TOKEN: ${SITEMAP_TOKEN}
  ports:
    - "5000:5000"
  volumes:
    - ./backend:/app:delegated
    - /app/node_modules
    - uploads:/app/uploads
    - ./logs/backend:/app/logs:delegated
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 20s
  networks:
    - emploi-network
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 1G
      reservations:
        memory: 512M
```

### 3. Frontend (Nginx + React)
```yaml
frontend:
  build:
    context: .
    dockerfile: frontend/Dockerfile
  container_name: emploi_frontend
  restart: unless-stopped
  ports:
    - "80:80"
  volumes:
    - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    - nginx_logs:/var/log/nginx
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
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
```

## Variables d'environnement (.env.docker)

Le fichier `.env.docker` contient toutes les variables nécessaires :

```bash
# Base de données
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emploi_plus_db_cg
DB_PORT=5432

# Backend
NODE_ENV=development
BACKEND_PORT=5000
JWT_SECRET=your_jwt_secret_key_min_32_characters_change_this_in_production
CORS_ORIGIN=http://localhost
GEMINI_API_KEY=AIzaSyDSAj76TtI_KjzrEZi-hSMji-WqH2GOXnQ
SITEMAP_TOKEN=your_sitemap_token_change_this_in_production

# Frontend
VITE_API_URL=http://localhost/api

# Optionnel - Email
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USER=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
```

## Dockerfiles

### Backend Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init curl ca-certificates
COPY --from=builder /app/package*.json ./
RUN npm install --only=production && npm cache clean --force
COPY --from=builder /app/ .
RUN mkdir -p uploads tmp logs && chmod -R 755 uploads tmp logs
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Frontend Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Runtime
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/run/nginx && touch /var/run/nginx/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html
USER nginx
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

## Configuration Nginx (nginx/default.conf)

Nginx sert les assets statiques et proxy les appels API :

- **Port 80** : HTTP
- **Routes /api/** : Proxy vers backend:5000
- **Routes /uploads/** : Proxy vers backend:5000/uploads/
- **SPA Fallback** : Toutes les autres routes vers index.html
- **Cache optimisé** : Assets avec hash en cache long, index.html sans cache
- **Sécurité** : Headers de sécurité, blocage des fichiers sensibles

## Commandes pour lancer l'application

### Démarrage automatique (recommandé)
```bash
# Rendre le script exécutable
chmod +x docker-start.sh

# Lancer tout
./docker-start.sh
```

### Démarrage manuel
```bash
# Construire et démarrer
docker compose up -d --build

# Ou démarrer sans rebuild
docker compose up -d
```

### Suivi du démarrage
```bash
# Voir les logs en temps réel
docker compose logs -f

# Vérifier le status
docker compose ps

# Statistiques ressources
docker stats
```

### Accès aux services
- **Frontend** : http://localhost
- **Backend API** : http://localhost:5000
- **Base de données** : localhost:5432 (avec psql ou outils externes)

### Commandes de gestion
```bash
# Arrêter gracieusement
docker compose stop

# Arrêter et supprimer conteneurs
docker compose down

# Arrêter + supprimer volumes (⚠️ perte de données DB)
docker compose down -v

# Terminal dans un conteneur
docker compose exec backend sh
docker compose exec db bash
docker compose exec frontend sh

# Logs spécifiques
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend
```

## Health Checks

Chaque service a des health checks configurés :
- **DB** : `pg_isready` toutes les 10s
- **Backend** : `curl http://localhost:5000/api/health` toutes les 30s
- **Frontend** : `wget http://localhost/` toutes les 30s

Le backend attend que la DB soit healthy avant de démarrer.

## Sécurité

- **Utilisateurs non-root** dans les conteneurs
- **Health checks** pour monitoring
- **Limits de ressources** pour éviter les runaway
- **Headers de sécurité** dans Nginx
- **Blocage des fichiers sensibles** (.env, .git, etc.)
- **Variables d'environnement** pour les secrets

## Volumes et Persistance

Les données importantes sont persistées :
- **postgres_data** : données de la base
- **uploads** : fichiers uploadés par les utilisateurs
- **nginx_logs** : logs du serveur web

Ces volumes survivent aux redémarrages des conteneurs.