# Commandes Docker Rapides - Emploi Connect
# Un document de référence pour les commandes les plus utiles

## 🚀 DÉMARRAGE

### Start complet avec script automatisé
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Start manuel
```bash
docker compose up -d --build
docker compose up -d  # Sans rebuild
```

### Start avec logs en temps réel
```bash
docker compose up  # Sans -d
```

---

## 🛑 ARRÊT ET NETTOYAGE

### Arrêt gracieux (données persistées)
```bash
docker compose stop
```

### Arrêt complet avec nettoyage
```bash
docker compose down
```

### Arrêt + suppression des volumes (⚠️ PERTE DE DONNÉES DB!)
```bash
docker compose down -v
```

### Arrêt + suppression des images
```bash
docker compose down -v --rmi all
```

---

## 📊 MONITORING

### Status des conteneurs
```bash
docker compose ps
```

### Logs en temps réel
```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend
```

### Logs avec timestamps et limite
```bash
docker compose logs --timestamps --tail=100
```

### Statistiques CPU/Mémoire
```bash
docker stats
docker stats --no-stream  # Une seule capture
```

### Inspection d'un conteneur
```bash
docker compose inspect backend
```

---

## 🔧 ACCÈS AUX CONTENEURS

### Terminal interactif
```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec db bash
```

### Exécuter une commande unique
```bash
docker compose exec backend npm run build
docker compose exec backend curl http://localhost:5000/api/health
docker compose exec db psql -U postgres
```

### Voir le processus PID 1 (pour debug)
```bash
docker compose exec backend ps aux
```

---

## 📦 REBUILD & MISE À JOUR

### Rebuild complet (sans cache)
```bash
docker compose build --no-cache
```

### Rebuild un service spécifique
```bash
docker compose build --no-cache backend
docker compose build --no-cache frontend
```

### Rebuild et démarrage
```bash
docker compose up --build -d
docker compose up --build  # Avec logs
```

---

## 📝 MIGRATIONS ET SEEDS

### Lancer les migrations
```bash
docker compose exec backend node run-migration.js
docker compose exec backend node run-migration-004.js
docker compose exec backend npm run migrate
```

### Seeding de données
```bash
docker compose exec backend node scripts/seed.js
```

### Vérifier les migrations appliquées
```bash
docker compose exec db psql -U postgres -d emploi_plus_db_cg
```

---

## 💾 POSTGRESQL - BACKUP & RESTORE

### Backup complet SQL
```bash
docker compose exec db pg_dump -U postgres emploi_plus_db_cg > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Backup en format binaire (plus rapide)
```bash
docker compose exec db pg_dump -U postgres -Fc emploi_plus_db_cg > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore depuis SQL
```bash
cat backup_20240315_143022.sql | docker compose exec -T db psql -U postgres emploi_plus_db_cg
```

### Restore depuis dump binaire
```bash
docker compose exec -T db pg_restore -U postgres -d emploi_plus_db_cg < backup.dump
```

### Accéder à psql interactif
```bash
docker compose exec db psql -U postgres -d emploi_plus_db_cg

# Commandes utiles dans psql:
\dt                    # Lister les tables
\d table_name          # Décrire une table
SELECT * FROM users;   # Requête SQL
\q                     # Quitter
```

---

## 🔒 GESTION DES VOLUMES

### Lister les volumes
```bash
docker volume ls
```

### Inspecter un volume
```bash
docker volume inspect emploi-connect-_postgres_data
```

### Nettoyer les volumes inutilisés
```bash
docker volume prune
```

### Voir le contenu d'un volume (depuis conteneur)
```bash
docker compose exec db ls -la /var/lib/postgresql/data/
```

---

## 🌐 TESTS D'API

### Tester un health check
```bash
curl http://localhost/health
curl http://localhost:5000/api/health
```

### Appel API avec JWT
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost/api/jobs
```

### Tester la connexion DB déclaration
```bash
docker compose exec -T backend node -e "
const { Pool } = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log('DB Connected:', res.rows[0]);
  process.exit(0);
});
"
```

---

## 🐛 DEBUGGING

### Logs avec grep (filtrer par erreur)
```bash
docker compose logs | grep -i error
docker compose logs backend | grep -i "stacktrace"
```

### Afficher les variables d'environnement d'un conteneur
```bash
docker compose exec backend env
```

### Afficher les montages de volume
```bash
docker inspect emploi_backend | grep Mounts -A 20
```

### Vérifier la connectivité réseau
```bash
docker compose exec backend ping db
docker compose exec frontend wget -q -O- http://backend:5000/api/health
```

### Voir les fichiers d'un conteneur
```bash
docker compose exec backend ls -la /app
docker compose exec frontend ls -la /usr/share/nginx/html
```

---

## 🚀 DÉPLOIEMENT PRODUCTION

### Préparation pour production
```bash
# 1. Générer des secrets forts
openssl rand -hex 32  # Pour JWT_SECRET
openssl rand -hex 32  # Pour SITEMAP_TOKEN

# 2. Copier la config prod
cp .env.production .env

# 3. Éditer le .env avec les vrais secrets
nano .env

# 4. Rebuild pour production
docker compose build --pull --no-cache

# 5. Démarrer en background
docker compose up -d --pull always

# 6. Vérifier la santé
docker compose ps
docker stats --no-stream
```

### Mise à jour en production
```bash
cd /path/to/app
git pull origin main
docker compose build --pull
docker compose stop
docker compose up -d
docker compose logs -f
```

---

## 🧹 NETTOYAGE & MAINTENANCE

### Nettoyer les images non utilisées
```bash
docker image prune -a
```

### Nettoyer les conteneurs arrêtés
```bash
docker container prune
```

### Nettoyer TOUT (⚠️ SOYEZ SÛR!)
```bash
docker system prune -a --volumes
```

### Voir la taille des images
```bash
docker images --format "table {{.Repository}}\t{{.Size}}"
```

---

## 📋 QUICK HEALTH CHECK SCRIPT

```bash
#!/bin/bash
echo "🔍 Vérification de santé..."

echo "DB: $(docker compose exec -T db pg_isready -U postgres && echo '✅' || echo '❌')"
echo "Backend: $(docker compose exec -T backend curl -s http://localhost:5000/api/health | jq . > /dev/null && echo '✅' || echo '❌')"
echo "Frontend: $(docker compose exec -T frontend wget -q --tries=1 --spider http://localhost/ 2>/dev/null && echo '✅' || echo '❌')"

echo ""
echo "📊 Conteneurs:"
docker compose ps

echo ""
echo "💾 Volumes:"
docker volume ls | grep emploi
```

**À sauvegarder comme**: `health-check.sh` puis exécuter avec `bash health-check.sh`
