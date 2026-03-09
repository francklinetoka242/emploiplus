# 🏗️ Diagrammes d'Architecture - Emploi Connect Docker

## Vue d'Ensemble du Système

```
┌─────────────────────────────────────────────────────────────────┐
│                      INTERNET / UTILISATEURS                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   Port 80/443  │
                    │    (Nginx)     │
                    │   Reverse Proxy│
                    └───┬─────────┬──┘
                        │         │
            ┌───────────┘         └─────────────┐
            │                                   │
            ▼                                   ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  FRONTEND        │            │  API BACKEND     │
    │  React + Vite    │            │  Node + Express  │
    │  Port 5173 (dev) │            │  Port 5000       │
    │  Nginx (prod)    │            │                  │
    │                  │            │  - Routes API    │
    │  - SPA React     │            │  - JWT Auth      │
    │  - Assets        │            │  - File Uploads  │
    │  - Static        │            │  - IA (Gemini)   │
    └──────┬───────────┘            └────────┬─────────┘
           │                                 │
           │         /api/* appels          │
           └─────────────────────────────────┤
                                             │
                                             ▼
                            ┌────────────────────────┐
                            │  PostgreSQL Database   │
                            │  Port 5432             │
                            │                        │
                            │  - users               │
                            │  - jobs                │
                            │  - applications        │
                            │  - formations          │
                            │  - audit logs          │
                            │  - notifications       │
                            └────────────────────────┘
```

## Architecture des Conteneurs Docker

```
HOST MACHINE (MacOS / Linux / Windows with Docker Desktop)
│
├── [Docker Network: emploi-network]
│   │
│   ├── CONTAINER 1: PostgreSQL (db)
│   │   ├── Image: postgres:15-alpine
│   │   ├── Port: 5432:5432 (interne 5432)
│   │   ├── Volume: postgres_data:/var/lib/postgresql/data
│   │   └── Health: pg_isready check
│   │
│   ├── CONTAINER 2: Backend API (backend)
│   │   ├── Image: Dockerfile (Node 20-alpine)
│   │   ├── Port: 5000:5000 (interne 5000)
│   │   ├── Volumes:
│   │   │   ├── ./backend:/app (code source)
│   │   │   ├── /app/node_modules (isolé)
│   │   │   ├── uploads:/app/uploads (persistant)
│   │   │   └── logs:/app/logs (persistant)
│   │   ├── Env: DATABASE_URL=postgresql://db:5432/...
│   │   ├── Health: curl /api/health
│   │   └── Dépend de: db (condition: service_healthy)
│   │
│   ├── CONTAINER 3: Frontend + Nginx (frontend)
│   │   ├── Build: Vite build + Nginx serve
│   │   ├── Image: nginx:alpine
│   │   ├── Port: 80:80, 443:443 (interne 80)
│   │   ├── Volumes:
│   │   │   ├── /app/dist → /usr/share/nginx/html
│   │   │   ├── ./nginx/default.conf → /etc/nginx/conf.d/default.conf
│   │   │   └── nginx_logs:/var/log/nginx
│   │   ├── Health: wget / (port 80)
│   │   └── Proxy: /api/ → http://backend:5000
│   │
│   └── VOLUMES PERSISTANTS:
│       ├── postgres_data (PostgreSQL)
│       ├── uploads (Files uploads)
│       └── nginx_logs (Web logs)
```

## Communication Entre Conteneurs

```
                    FRONTEND (Nginx)
                         │
              /api/jobs  │         ┌───────────────────────┐
           ───────────────┼────────►│   BACKEND API         │
                         │         │                       │
                   /uploads/       │   - GET /api/jobs    │
            ◄────────────┼─────────┤   - POST /api/auth   │
                         │         │   - PUT /api/jobs    │
                         │         │                       │
                         │         └────────────┬──────────┘
                         │                      │
                         │       DATABASE_URL   │
                         │       postgresql://  │
                         │       postgres@db    │
                         │                      ▼
                         │                 PostgreSQL
                         │
                   ┌─────▼──────────────────────────────┐
                   │  RÉSOLUTION DNS INTERNE           │
                   │  - backend:5000  ← TCP/IP         │
                   │  - db:5432       ← TCP/IP         │
                   │  - localhost     ← N/A (local)    │
                   └────────────────────────────────────┘
```

## Cycle de Vie du Conteneur Backend

```
┌─────────────────────────────────────────────────────────┐
│  1. BUILD STAGE (docker compose build backend)         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Stage 1: Builder (NODE_ENV=development)          │ │
│  │ - FROM node:20-alpine                            │ │
│  │ - COPY backend/package*.json                     │ │
│  │ - npm ci --include=dev (800MB)                   │ │
│  │ - COPY backend/ .                                │ │
│  │                                                   │ │
│  │ Stage 2: Runtime (NODE_ENV=production)           │ │
│  │ - FROM node:20-alpine                            │ │
│  │ - COPY --from=builder /app/package*.json         │ │
│  │ - npm ci --only=production (reduced)             │ │
│  │ - Result: 250-350 MB image                       │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  2. CREATE STAGE (docker compose up)                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Créer le conteneur:                              │ │
│  │ - Mount volumes (./backend:/app)                 │ │
│  │ - Mapper les ports (5000:5000)                   │ │
│  │ - Connecter au réseau (emploi-network)           │ │
│  │ - Définir l'environment                          │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  3. START STAGE                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ENTRYPOINT: dumb-init                            │ │
│  │ CMD: node server.js                              │ │
│  │ - Charge .env (NODE_ENV, PORT, DATABASE_URL)    │ │
│  │ - Connecte à PostgreSQL                          │ │
│  │ - Écoute sur port 5000                           │ │
│  │ - Health check: curl /api/health (success ✅)    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  4. RUNNING - En Attente de Requêtes                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ État: UP (healthy)                               │ │
│  │ - Écoute les requêtes HTTP sur 5000              │ │
│  │ - Maintient la connexion DB                      │ │
│  │ - Répond aux health checks (30s)                 │ │
│  │ - Gère les uploads multipart                     │ │
│  │ - Exécute les migrations si besoin               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  5. STOP STAGE (docker compose stop/down)              │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Signal SIGTERM envoyé par Docker                 │ │
│  │ dumb-init passe le signal à node                 │ │
│  │ Fermeture gracieuse:                             │ │
│  │ - Close DB connections                           │ │
│  │ - Finish current requests                        │ │
│  │ - Save state                                     │ │
│  │ Après 10s: SIGKILL force l'arrêt                 │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Flux de Requête Frontend → Backend → DB

```
1. UTILISATEUR ACCÈDE http://localhost/jobs
   │
   ├─► Browser envoie GET /jobs
   │
   └─► Nginx reçoit (80:80)
       │
       ├─► Vérifie: /jobs est-il un fichier? NON
       │
       ├─► Fallback: try_files → /index.html
       │
       ├─► Retourne /dist/index.html
       │
       └─► Browser charge React APP
           │
           └─► React Router détecte route /jobs
               │
               └─► Appelle via React Query:
                   GET /api/jobs
                   │
                   └─► Browser envoie requête HTTP
                       │
                       └─► Nginx reçoit /api/jobs
                           │
                           ├─► Location /api/ match
                           │
                           ├─► proxy_pass http://backend:5000
                           │   (résolution DNS interne)
                           │
                           └─► Forwarde vers Backend:5000
                               │
                               └─► Backend Route: /api/jobs
                                   │
                                   ├─► Query PostgreSQL:
                                   │   SELECT * FROM jobs
                                   │
                                   ├─► Execute Pool connection:
                                   │   pool.query("SELECT...")
                                   │
                                   └─► DB retourne les emplois
                                       │
                                       └─► Backend formatte JSON
                                           │
                                           └─► Retour à Nginx
                                               │
                                               └─► Retour au Browser
                                                   │
                                                   └─► React affiche les jobs
```

## Volumes et Persistance des Données

```
Docker Volumes vs Bind Mounts:

┌────────────────────────────────┐
│  Volumes (Recommandé)          │
├────────────────────────────────┤
│ postgres_data:                 │
│ └── Géré par Docker            │
│ └── Performant                 │
│ └── Persiste après container   │
│ └── Portable entre hosts       │
│                                │
│ uploads:                       │
│ └── Files uploadés par users   │
│ └── Persiste après restart     │
│ └── Accessible via /api/uploads│
└────────────────────────────────┘

                    VS

┌────────────────────────────────┐
│  Bind Mounts (Dev Mode)        │
├────────────────────────────────┤
│ ./backend:/app                 │
│ └── Code source du host        │
│ └── Changements vus live       │
│ └── Débuggage via terminal     │
│ └── À désactiver en prod!      │
└────────────────────────────────┘

Isolation node_modules:
┌────────────────────────────────┐
│ /app/node_modules (anonymous)  │
│                                │
│ - Pas de bind mount            │
│ - Installé dans le container   │
│ - Binaires compatibles (Linux) │
│ - Evite conflits host vs container
└────────────────────────────────┘
```

## Gestion des Ressources

```
docker-compose.yml - Limites de ressources:

Backend (Node.js + Express)
├── Limit CPU: 2 cores max
├── Limit RAM: 1 GB max
├── Reserve RAM: 512 MB minimum
└── Prévient: Memory leak non détecté → OOM kill

Database (PostgreSQL)
├── Limit CPU: 1 core max
├── Limit RAM: 512 MB max
├── Reserve RAM: 256 MB minimum
└── Prévient: DB queries trop coûteuses

Frontend (Nginx)
├── Limit CPU: 1 core max
├── Limit RAM: 512 MB max
├── Reserve RAM: 256 MB minimum
└── Prévient: Accès concurrent énorme

Total Recommandé: 4+ cores, 2+ GB RAM
```

## Sécurité en Couches

```
┌─────────────────────────────────────────┐
│  COUCHE 1: Image Sécurité               │
├─────────────────────────────────────────┤
│ ✅ Non-root user (uid 1001)             │
│ ✅ Alpine Linux (petite surface)        │
│ ✅ Pas de secrets en dur                │
│ ✅ Multi-stage (no dev tools)           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  COUCHE 2: Container Runtime            │
├─────────────────────────────────────────┤
│ ✅ Réseau privé isolé                   │
│ ✅ Resource limits (CPU/RAM)            │
│ ✅ Read-only filesystem (options)       │
│ ✅ No privileged mode                   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  COUCHE 3: Application                  │
├─────────────────────────────────────────┤
│ ✅ HTTPS/TLS (Nginx)                    │
│ ✅ JWT Auth (Backend)                   │
│ ✅ Rate limiting (Express)              │
│ ✅ CORS restrictive                     │
│ ✅ Helmet Security Headers              │
└─────────────────────────────────────────┘
```

---

## 📊 Stats de Taille

```
Images Docker (après multi-stage):

Backend:
node:20-alpine base    → 150 MB
  + dependencies       → 100-150 MB
  + code               → 5-10 MB
  ─────────────────────────────
  Total runtime image  → 250-350 MB

Frontend:
node:20-alpine base    → 150 MB (build stage only, not in final)
nginx:alpine base      → 40 MB
  + React build        → 2-5 MB
  ─────────────────────────────
  Total runtime image  → 50-70 MB

Database:
postgres:15-alpine     → 150 MB

TOTAL: ~500-600 MB (toutes les images)
Compare à VMs: 500 MB × 3 = 1.5 GB par VM!
```

---

## 🔄 Processus de Déploiement

```
┌─────────────────────────────┐
│  1. LOCAL DEVELOPMENT       │
├─────────────────────────────┤
│ Source Code Changes         │
│ ↓                           │
│ git commit + push           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  2. VPS PULL & BUILD        │
├─────────────────────────────┤
│ git pull origin main        │
│ docker compose build        │
│ docker compose stop         │
│ docker compose up -d        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  3. HEALTH CHECKS           │
├─────────────────────────────┤
│ postgres ready? ✅          │
│ backend health? ✅          │
│ frontend ready? ✅          │
└──────────────┬──────────────┘
               │
               ▼
        ✅ LIVE
```

---

Generated: Mars 8, 2026  
Format: Architecture Diagrams  
Status: ✅ Ready
