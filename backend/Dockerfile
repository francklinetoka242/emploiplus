# Backend - Node.js + Express
# Dockerfile optimisé avec multi-stage build pour production

# ============================================================
# Stage 1: Builder - Compilation et installation des deps
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration npm
COPY backend/package*.json ./

# Optimiser npm install avec cache et flags de performance
RUN npm install

# Copier tout le code source
COPY backend/ .

# Si vous avez une étape de build TypeScript, décommenter:
# RUN npm run build

# ============================================================
# Stage 2: Runtime - Image minimale pour la production
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Installer les outils système essentiels
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates

# Copier package.json du builder
COPY --from=builder /app/package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --only=production && npm cache clean --force

# Copier le code compilé du builder (exclure node_modules)
COPY --from=builder /app/src ./src
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/models ./models
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/services ./services
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/config ./config
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env* ./

# Créer les répertoires nécessaires pour l'application
RUN mkdir -p uploads tmp logs public && \
    chmod -R 755 uploads tmp logs public

# Créer un utilisateur non-root pour la sécurité (uid 1001)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Passer à l'utilisateur nodejs (pas root)
USER nodejs

# Exposer le port de l'API
EXPOSE 5000

# Health check pour vérifier que le service répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Utiliser dumb-init pour gérer correctement les signaux SIGTERM/SIGKILL
# Cela assure l'arrêt gracieux du serveur Node.js
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage principal
CMD ["node", "server.js"]
