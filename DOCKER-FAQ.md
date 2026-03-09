# Docker FAQ & Troubleshooting - Emploi Connect

## 📋 Questions Fréquemment Posées

### Q1: Comment commencer rapidement?

**R**: Exécutez le script fourni:
```bash
chmod +x docker-start.sh
./docker-start.sh
```

Ou manuellement:
```bash
docker compose up -d --build
```

Accédez à: `http://localhost`

---

### Q2: Comment générer les images sans démarrer les conteneurs?

**R**: 
```bash
docker compose build
# Ou rebuild sans cache:
docker compose build --no-cache
```

---

### Q3: Comment recompiler uniquement le frontend?

**R**:
```bash
docker compose build --no-cache frontend
# Puis relancer:
docker compose up -d frontend
```

---

### Q4: Comment voir les logs en temps réel?

**R**:
```bash
# Tous les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Logs avec timestamps
docker compose logs -f --timestamps

# Limiter les dernières lignes
docker compose logs -f --tail=50
docker compose logs -f backend --tail=20
```

---

### Q5: Comment modifier le code et voir les changements?

**R**: Les volumes sont déjà configurés en mode code source:

```yaml
volumes:
  - ./backend:/app:delegated  # Code source mappé
  - /app/node_modules         # node_modules isolé
```

- **Frontend**: Rebuild le `dist/` via `npm run build` (manuellement ou en watch)
- **Backend**: Redémarrer le conteneur ou utiliser `nodemon` si configuré

Pour auto-rebuild le frontend lors des changements:
```bash
docker compose exec frontend npm run build -- --watch
```

---

### Q6: Comment accéder à la base de données?

**R**: 
```bash
# Terminal psql interactif
docker compose exec db psql -U postgres -d emploi_plus_db_cg

# Ou via ligne de commande
docker compose exec db psql -U postgres -d emploi_plus_db_cg -c "SELECT COUNT(*) FROM users;"
```

**Depuis votre machine locale** (si port 5432 exposé):
```bash
# Installer pgAdmin (GUI)
# Ou via CLI:
PGPASSWORD=postgres psql -h localhost -U postgres -d emploi_plus_db_cg
```

---

### Q7: Comment backup la base de données?

**R**:
```bash
# Backup SQL
docker compose exec db pg_dump -U postgres emploi_plus_db_cg > backup.sql

# Backup binaire (plus rapide)
docker compose exec db pg_dump -U postgres -Fc emploi_plus_db_cg > backup.dump

# Avec date
docker compose exec db pg_dump -U postgres emploi_plus_db_cg > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

### Q8: Comment restorer une base de données?

**R**:
```bash
# Depuis SQL
cat backup.sql | docker compose exec -T db psql -U postgres emploi_plus_db_cg

# Depuis dump binaire
docker compose exec -T db pg_restore -U postgres -d emploi_plus_db_cg < backup.dump
```

---

### Q9: Comment migrer les données depuis MySQL (XAMPP) vers PostgreSQL?

**R**: Utiliser `pgloader`:

```bash
# Installation
brew install pgloader  # macOS
apt-get install pgloader  # Linux

# Migration MySQL → PostgreSQL
pgloader mysql://user:password@localhost:3306/old_db postgresql://postgres:postgres@localhost:5432/emploi_plus_db_cg

# Ou via conteneur Docker
docker run --rm -it --network emploi-network \
  pgloader/pgloader:latest \
  pgloader mysql://user:password@host:3306/old_db postgresql://postgres:postgres@db:5432/emploi_plus_db_cg
```

---

### Q10: Mon backend ne démarre pas, comment débuguer?

**R**: 

1. **Vérifier les logs**:
```bash
docker compose logs backend
```

2. **Vérifier la connexion DB**:
```bash
docker compose exec backend curl http://db:5432/health
# (Devrait renvoyer une erreur, c'est normal - c'est HTTP, pas DB)
```

3. **Tester la connexion PostgreSQL directement**:
```bash
docker compose exec backend \
  node -e "
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    pool.query('SELECT NOW()', (err, res) => {
      if (err) console.error('DB Error:', err);
      else console.log('DB Time:', res.rows[0]);
      process.exit(0);
    });
  "
```

4. **Vérifier les variables d'environnement**:
```bash
docker compose exec backend env | grep DATABASE
docker compose exec backend env | grep JWT
```

5. **Accéder au terminal**:
```bash
docker compose exec backend sh
# Puis manuellement:
node server.js  # Voir les erreurs directes
npm run build   # Tester la compilation
```

---

### Q11: "Connection refused: db:5432" Que faire?

**R**: 

1. **S'assurer que le service `db` est prêt**:
```bash
docker compose ps
# STATUS doit être "Up (healthy)"
```

2. **Augmenter le temps d'attente** dans `docker-compose.yml`:
```yaml
depends_on:
  db:
    condition: service_healthy
    
# Et dans healthcheck:
healthcheck:
  start_period: 30s  # Augmenter de 15s à 30s
```

3. **Relancer**:
```bash
docker compose down -v
docker compose up
```

---

### Q12: "502 Bad Gateway" depuis le frontend, comment corriger?

**R**: 

1. **Vérifier que le backend répond**:
```bash
docker compose exec frontend curl http://backend:5000/api/health
```

2. **Vérifier la config Nginx**:
```bash
# Vérifier que le proxy_pass est correct
cat nginx/default.conf | grep proxy_pass

# Résultat doit être:
# proxy_pass http://backend:5000;
# (PAS localhost, c'est interne au conteneur nginx)
```

3. **Redémarrer Frontend**:
```bash
docker compose restart frontend
```

---

### Q13: Comment mettre à jour le code et redéployer?

**R**:

**Développement**:
```bash
# Code changé localement
git add .
git commit -m "fix: update feature"
git push origin main

# Sur le serveur:
cd /path/to/app
git pull origin main
docker compose build
docker compose up -d
```

**Production avec downtime minimal**:
```bash
# Mettre à jour sans arrêter complètement
docker compose pull
docker compose up -d --no-deps --build backend
docker compose up -d --no-deps --build frontend
```

---

### Q14: Comment voir les variables d'environnement dans un conteneur?

**R**:
```bash
docker compose exec backend env
docker compose exec backend env | grep JWT
docker compose exec db env
```

---

### Q15: Comment nettoyer complètement et recommencer?

**R**:
```bash
# Arrêter et supprimer TOUT
docker compose down -v --rmi all

# Nettoyer les images orphelines
docker image prune -a

# Nettoyer les volumes orphelines
docker volume prune

# Puis recommencer:
docker compose build
docker compose up -d
```

---

## 🐛 Problèmes et Solutions

### Problème: "Cannot GET /" sur le frontend

**Cause**: Assets Vite non construits

**Solution**:
```bash
# Vérifier que Nginx serv les fichiers
docker compose exec frontend ls -la /usr/share/nginx/html/

# Troubleshoot le build Vite
docker compose exec frontend npm run build

# Voir les logs du build
docker compose logs frontend | grep -i "error\|fail"
```

---

### Problème: "npm ERR! EACCES" pendant le build

**Cause**: Permissions de fichiers

**Solution**:
```bash
# Nettoyer les volumes et recommencer
docker compose down -v
rm -rf node_modules/
docker compose build --no-cache
```

---

### Problème: Conteneur sort en erreur immédiatement

**Cause**: Crash du processus principal

**Solution**:
```bash
# Voir les logs complets
docker compose logs backend

# Accéder au shell pour tester
docker compose run --rm backend sh

# À l'intérieur du shell, tester:
npm list
npm run build
node server.js  # Voir les erreurs
```

---

### Problème: "Out of memory" en production

**Cause**: Ressources insuffisantes

**Solution**:
```yaml
# Augmenter les limites dans docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G  # Augmenter
      cpus: '4'
```

---

### Problème: API très lente, timeouts

**Cause**: 
- Requête à la DB inefficace
- Limites de ressources trop basses
- Uploads de fichiers volumineux

**Solution**:
```bash
# Vérifier la consommation réelle
docker stats --no-stream

# Augmenter les timeouts Nginx si uploads volumineux
# nginx/default.conf:
# proxy_read_timeout 300s;
# proxy_send_timeout 300s;

# Optimiser les requêtes DB
docker compose exec db psql -U postgres
\d+ big_table;  # Analyser les index
ANALYZE; VACUUM;  # Optimiser
```

---

### Problème: Logs énormes, disque plein

**Cause**: Logs non limités

**Solution**:
```bash
# Limiter la taille des logs (dans docker-compose.yml)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# Ou nettoyer manuellement
docker system prune --all --volumes
```

---

### Problème: Certificat SSL/TLS expiré

**Cause**: Certificat Lets Encrypt non renouvelé

**Solution**:
```bash
# Renouveler manuellement
docker run -it --rm -v ./certs:/etc/letsencrypt certbot/certbot renew

# Ou ajouter un cronjob pour auto-renouvellement
0 2 * * * certbot renew --quiet
```

---

### Problème: Certains utilisateurs ne peuvent pas accéder au site

**Cause**: 
- CORS mal configuré
- Firewall/NAT
- DNS régional

**Solution**:
```nginx
# Vérifier CORS (nginx/default.conf)
add_header Access-Control-Allow-Origin "https://emploiplus-group.com" always;

# Vérifier DNS
docker run --rm curlimages/curl curl https://emploiplus-group.com
```

---

## 🎯 Performance Tuning

### Optimiser le Backend

```javascript
// backend/server.js - Activer la compression
import compression from 'compression';
app.use(compression({
  level: 6,  // 1-9, défaut 6
  threshold: 1024  // Compresser si > 1KB
}));

// Limiter les connexions DB
const pool = new Pool({
  max: 10,                 // Max connexions
  idleTimeoutMillis: 30000, // Auto-close après 30s
  connectionTimeoutMillis: 5000,
});
```

### Optimiser le Frontend

```nginx
# nginx/default.conf
# Gzip compression
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_level 6;

# Cache busting - Assets Vite avec hash
location /assets/ {
  expires 1y;  # Cache 1 an
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# Pas de cache pour index.html
location = /index.html {
  expires 1s;
  add_header Cache-Control "public, max-age=1, must-revalidate";
}
```

### Monitoring

```bash
# Alerter si un conteneur consomme trop
docker stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# Avec seuil
docker stats --format "{{.Container}} - Mem: {{.MemUsage}} CPU: {{.CPUPerc}}"
```

---

## 📞 Support et Escalade

Si vous ne trouvez pas la solution:

1. **Collectez les logs**:
```bash
docker compose logs backend > logs_backend.txt
docker compose logs db > logs_db.txt
docker compose logs frontend > logs_frontend.txt
docker compose ps > status.txt
```

2. **Reportez avec contexte**:
- Logs complets
- Version Docker (`docker --version`)
- OS
- Commande exacte qui a échoué

3. **Contacts**:
- GitHub Issues: [emploiplus repo](https://github.com/francklinetoka/emploiplus/issues)
- Email: support@emploiplus-group.com

---

**Version**: 1.0  
**Dernière mise à jour**: Mars 8, 2026
