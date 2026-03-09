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
RUN npm run build

# ============================================================
# Stage 2: Runtime - Servir with Nginx (production)
# ============================================================
FROM nginx:1.27-alpine

# Copier les assets construits du stage 1 dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx customisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Créer le répertoire PID et ajuster les permissions (indispensable pour le mode non-root)
# Note : On ajoute /var/cache/nginx et /etc/nginx/conf.d pour éviter toute erreur de permission
RUN mkdir -p /var/run/nginx /var/cache/nginx && \
    chown -R nginx:nginx \
      /var/run/nginx \
      /var/cache/nginx \
      /var/log/nginx \
      /etc/nginx/conf.d \
      /usr/share/nginx/html && \
    touch /var/run/nginx/nginx.pid && \
    chown nginx:nginx /var/run/nginx/nginx.pid

# Basculer vers l'utilisateur nginx (non-root) pour la sécurité
USER nginx

# Exposer les ports HTTP/HTTPS
EXPOSE 80 443

# Health check pour vérifier que Nginx répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx en foreground (important pour Docker)
CMD ["nginx", "-g", "daemon off;"]