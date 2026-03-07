# 🚀 REDÉPLOIEMENT RAPIDE - Formation Service Fix

## Le Problème
Le sitemap génération échouait avec l'erreur :
```
Error: Limit must be between 1 and 100
    at formation.service.js:31
```

Le `formation.service.js` levait une erreur si `limit > 100`, mais le sitemap-generator appelle avec `limit: 10000`.

## La Solution
Modification de `formation.service.js` pour **clamper** la limite à 100 (comme `job.service.js`), au lieu de lever une erreur.

### Changement
```javascript
// ❌ AVANT - Levait une erreur
if (limit < 1 || limit > 100) {
  throw new Error('Limit must be between 1 and 100');
}

// ✅ APRÈS - Clampe la limite
let limit = parseInt(query.limit) || 20;
if (limit > 100) {
  limit = 100;  // Clamp au lieu de lever une erreur
}
```

---

## 📝 Étapes de Redéploiement

### Sur macOS (local)
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-
git add backend/services/formation.service.js
git commit -m "Fix: Clamp formation limit to 100 instead of throwing error

- Changed limit validation in getFormations() to match job.service.js behavior
- Prevents sitemap generation failure when requesting large result sets"
git push origin main
```

### Sur le VPS
```bash
ssh emplo1205@195.110.35.133 -p 7932
cd ~/public_html && git pull origin main
cd backend && pm2 restart backend-prod
pm2 logs backend-prod | head -50
```

### Résultat Attendu
```
✓ Server listening on port 5000
✓ API available at http://localhost:5000/api
[STARTUP] Génération initiale du sitemap...
[SITEMAP] Démarrage génération pour https://emploiplus-group.com
[SITEMAP] ✓ Sitemap généré avec succès (X URLs)
[STARTUP] ✓ Sitemap initial généré (X URLs)
[STARTUP] ✓ Cron job activé : génération du sitemap tous les jours à 03:00
```

---

## ✅ Checklist
- [ ] Fix applied locally
- [ ] Syntax validated (`node --check`)
- [ ] Changes committed & pushed to GitHub
- [ ] VPS updated with `git pull`
- [ ] Server restarted with `pm2 restart backend-prod`
- [ ] Logs checked for errors
- [ ] Sitemap generation successful
