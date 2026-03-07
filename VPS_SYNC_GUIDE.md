# ============================================
# SYNCHRONISATION VPS - EMPLOIPLUS
# ============================================
# Exécutez ces commandes étape par étape sur le VPS

# Étape 1: Vous connecter au VPS
ssh emplo1205@195.110.35.133 -p 7932

# Étape 2: Aller au répertoire backend
cd /home/emploiplus-group.com/public_html/backend

# Étape 3: Récupérer les dernières modifications du code
git pull origin main

# Étape 4: Installer les dépendances (node-cron)
npm install

# Étape 5: Exécuter la migration pour créer/corriger la table publications
# Connectez-vous à PostgreSQL et exécutez:
psql postgresql://emploiplus_user:vcybk24235GDWe@127.0.0.1:5432/emploi_plus_db_cg << 'EOF'

-- Migration: Create or update publications table
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries  
CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at);

COMMENT ON TABLE publications IS 'Stores user publications/articles';

EOF

# Étape 6: Exécuter TOUTES les migrations disponibles avec le script
node migrations/runAllMigrations.js

# Étape 7: Redémarrer l'application PM2
pm2 restart backend-prod

# Étape 8: Vérifier le statut
pm2 status
pm2 logs backend-prod --lines 30

# ============================================
# VÉRIFICATIONS APRÈS SYNCHRONISATION
# ============================================

# Vérifier que les offres d'emploi sont bien accessibles:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://emploiplus-group.com/api/jobs

# Vérifier les publications:
curl https://emploiplus-group.com/api/publications

# Vérifier que le backend est actif:
curl https://emploiplus-group.com/api/health

# ============================================
