#!/bin/bash

# 📚 Commandes Utiles pour Déploiement

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║         🚀 COMMANDES UTILES POUR DÉPLOIEMENT                  ║
╚═══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 VÉRIFICATIONS AVANT DÉPLOIEMENT

# Exécuter tous les checks
./deployment-checklist.sh

# Générer une clé JWT secrète
./generate-secrets.sh

# Préparer le projet pour déploiement
./prepare-deploy.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔨 BUILD & TEST LOCAL

# Installer dépendances
npm install
cd backend && npm install && cd ..

# Builder le projet localement
npm run build

# Tester le build localement
npm run preview

# Builder le backend
cd backend && npm run build && cd ..

# Démarrer le backend en dev
cd backend && npm run dev

# Démarrer le frontend en dev
npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TEST DES ENDPOINTS

# Test l'API locale
./test-endpoints.sh http://localhost:5000

# Test l'API production (placeholder)
./test-endpoints.sh https://your-production-api.example.com

# Test endpoint spécifique
curl -X GET http://localhost:5000/api/stats | jq .

# Test avec authentification
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/saved-jobs | jq .

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 GESTION DES SECRETS

# Générer une clé secrète
openssl rand -hex 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ne jamais afficher les secrets
echo "Ne jamais log les secrets en production!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 GIT COMMANDS

# Vérifier le status
git status

# Ajouter tous les fichiers
git add .

# Commit avec message
git commit -m "Setup deployment configuration"

# Push vers GitHub (auto-deploy!)
git push origin main

# Voir l'historique
git log --oneline

# Voir les remotes
git remote -v

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 INSPECTION DES FICHIERS

# Vérifier la structure du projet
tree -L 2 -a

# Vérifier les fichiers de config
ls -la | grep -E "vercel|render|\.env"

# Vérifier les scripts d'aide
ls -la *.sh

# Vérifier la documentation
ls -la *DEPLOYMENT* START_HERE.md

# Vérifier les node_modules
du -sh node_modules backend/node_modules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DEBUG & LOGS

# Logs locaux frontend
# Ouvrir DevTools: F12 → Console

# Logs locaux backend
# Terminal affiche les logs du serveur

# Logs: check your production host dashboard for logs
# e.g. Settings → Logs

# Logs Vercel (depuis Vercel dashboard)
# Deployments → Logs

# Logs Supabase (depuis Supabase dashboard)
# Database → Logs

# Query une base de données en dev
psql "postgresql://postgres:password@localhost/emploi_connect"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 DÉPLOIEMENT

# Push vers GitHub (déclenche auto-deploy)
git push origin main

# Production host: Redeploy manuel (consultez votre hébergeur)
# e.g. Dashboard → Deployments → Trigger deploy

# Vercel: Redeploy manuel
# Aller dans Vercel Dashboard → Deployments → Redeploy

# Vérifier le statut du deployment
# Production host: Settings → Deployment logs (ou équivalent)
# Vercel: Analytics → Deployments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 INTEGRATION TESTS

# Test CORS depuis le frontend
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:5000/api/stats

# Test avec données JSON
curl -X POST http://localhost:5000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","subject":"Test","message":"Hello"}'

# Test file upload
curl -X POST http://localhost:5000/api/upload \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{...}'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 BACKUP & EXPORT

# Exporter la base de données (local)
pg_dump -U postgres emploi_connect > backup.sql

# Exporter depuis Supabase (via Supabase dashboard)
# Database → Backups → Download

# Faire un backup du code
git push origin main && git tag v1.0.0 && git push origin v1.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 NETTOYAGE

# Supprimer node_modules (pour gagner espace)
rm -rf node_modules backend/node_modules

# Supprimer build outputs
rm -rf dist backend/dist

# Nettoyer npm cache
npm cache clean --force

# Réinstaller clean
npm install && cd backend && npm install && cd ..

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 TROUBLESHOOTING RAPIDE

# Port 5000 déjà utilisé?
lsof -i :5000  # Voir quel processus
kill -9 <PID>  # Tuer le processus

# Port 5173 déjà utilisé?
lsof -i :5173

# Nettoyer les logs
rm -f logs/*.log

# Reset une variable env
unset VARIABLE_NAME

# Voir toutes les env vars
env | grep -E "DATABASE|JWT|CORS"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOCUMENTATION RAPIDE

# Ouvrir la documentation locale
cat QUICKSTART_DEPLOYMENT.md
cat DEPLOYMENT_GUIDE.md
cat DEPLOYMENT_ARCHITECTURE.md

# Voir la structure du projet
find . -maxdepth 2 -type f -name "*.ts" -o -name "*.tsx" | head -20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 ALIASES UTILES (à ajouter à votre .bashrc ou .zshrc)

# Ajouter à ~/.bashrc ou ~/.zshrc
alias deploy-check='./deployment-checklist.sh'
alias deploy-gen-secret='./generate-secrets.sh'
alias deploy-test='./test-endpoints.sh'
alias deploy-prepare='./prepare-deploy.sh'

alias backend-dev='cd backend && npm run dev'
alias frontend-dev='npm run dev'
alias backend-build='cd backend && npm run build'
alias frontend-build='npm run build'

# Ensuite relancer votre shell: source ~/.bashrc

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 RESSOURCES

Vercel Docs:      https://vercel.com/docs
Render Docs:      https://render.com/docs
Supabase Docs:    https://supabase.com/docs
PostgreSQL Docs:  https://www.postgresql.org/docs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Happy Deploying! 🚀

EOF

