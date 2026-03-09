# Frontend - Vite + React + Nginx
# Architecture multi-stage: construire avec Node.js, servir avec Nginx

# ============================================================
# Stage 1: Builder - Construire l'application React
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers npm
COPY frontend/package*.json ./

# Optimiser npm install avec cache et flags de performance
RUN npm install --no-audit --no-fund --ignore-scripts

# Copier le code source APRÈS l'installation des deps pour optimiser le cache
COPY frontend/ .

# Construire l'application avec Vite
# Génère le dossier dist/ avec tous les assets optimisés
RUN npm run build

# ============================================================
# Stage 2: Runtime - Servir with Nginx (production)
# ============================================================
FROM nginx:1.27-alpine

# Copier les assets construits du stage 1 dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx customisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# (Optionnel) Remplacer la config principale si modifications avancées
# COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Créer le répertoire PID et ajuster les permissions (non-root)
RUN mkdir -p /var/run/nginx && \
    touch /var/run/nginx/nginx.pid && \
    chown -R nginx:nginx \
      /var/run/nginx \
      /var/cache/nginx \
      /var/log/nginx \
      /usr/share/nginx/html

# Basculer vers l'utilisateur nginx (non-root)
USER nginx

# Exposer les ports HTTP/HTTPS
EXPOSE 80 443

# Health check pour vérifier que Nginx répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx en foreground (important pour Docker)
# daemon off; permet à Nginx de rester attaché au conteneur
CMD ["nginx", "-g", "daemon off;"]
