# DEPLOYMENT_PLAN.md - Plan complet de déploiement EmploiPlus (Février 2026)

**Date de création** : 20 février 2026  
**Statut** : 🟢 PRÊT POUR DÉPLOIEMENT (Auth stable)  
**Version backend** : Simplified (publications temporairement désactivées)

---

## 📌 Vue d'ensemble

Ce projet a suivi un processus de simplification radicale pour éliminer les erreurs TypeScript et permettre un déploiement stable de **l'authentification** sur le VPS.

### ✅ État actuel

| Component | Status | Notes |
|-----------|--------|-------|
| **Express Server** | ✅ Stable | `npm run build` = 0 errors |
| **Authentication** | ✅ Fonctionnel | Admin, Super-admin, User |
| **CORS** | ✅ Configuré | All domains authorized |
| **Database** | ✅ Ready | PostgreSQL configured |
| **Publications** | ⏸️ Paused | À réactiver post-auth |
| **Jobs** | ⏸️ Paused | À réactiver post-auth |

---

## 🚀 Phase 1 : Déploiement AUTH sur VPS (AUJOURD'HUI)

### Objectif
Déployer l'backend simplifié avec routes d'authentification fonctionnelles.

### Conditions requises
- ✅ Code TypeScript compile sans erreur (`npm run build`)
- ✅ Database PostgreSQL accessible
- ✅ PM2 ou systemd configuré
- ✅ Reverse proxy CyberPanel/OpenLiteSpeed actif

### Étapes

#### 1. Prep du code

```bash
# À la racine du projet
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend

# Mettre à jour le code
git pull origin main

# Installer dépendances si update
npm install
```

#### 2. Build TypeScript

```bash
npm run build

# ✅ Expected output: 0 errors
# ✅ dist/server.js doit exister
```

#### 3. Vérifier configuration

```bash
# Vérifier .env
cat .env | grep -E "PORT|JWT_SECRET|DATABASE_URL|CORS_ORIGINS"

# Fort requis
# - PORT (5000 par défaut)
# - JWT_SECRET (clé pour tokens)
# - DATABASE_URL (connection string PostgreSQL)
# - CORS_ORIGINS (domaines autorisés)
```

#### 4. Redémarrer le serveur

```bash
# Option A : PM2
pm2 restart emploi-backend
pm2 logs emploi-backend

# Option B : Systemd
sudo systemctl restart emploi-backend
sudo journalctl -u emploi-backend -f

# Option C : Direct (développement/test)
node dist/server.js
```

#### 5. Vérifier que ça marche

```bash
# Health check
curl http://localhost:5000/_health

# Admin registration
curl -X POST http://localhost:5000/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test123!"}'

# Vérifier CORS
curl -X OPTIONS http://localhost:5000/_health \
  -H "Origin: https://emploiplus-group.com" \
  -i | grep "Access-Control-Allow-Origin"
```

### ✅ Checklist Phase 1

- [ ] `npm run build` = 0 errors
- [ ] Database accessible
- [ ] Serveur démarre sans crash
- [ ] `/_health` répond
- [ ] `/auth/admin/register` fonctionne
- [ ] CORS autorise le domaine frontend
- [ ] PM2/systemd peut redémarrer

---

## 📋 Phase 2 : Validation AUTH (J+1 à J+3)

### Objectif
Vérifier que l'authentification marche correctement en production.

### Tests (utiliser AUTH_DEPLOYMENT_TEST.md)

```bash
# Script test complet
chmod +x test-auth.sh
./test-auth.sh
```

### Points à vérifier

1. ✅ Admin peut se créer
2. ✅ User peut se créer
3. ✅ Login retourne token JWT valide
4. ✅ Token peut être utilisé pour requêtes auth-required
5. ✅ Pas d'erreur CORS
6. ✅ Base de données synchro

### Document de référence
👉 [AUTH_DEPLOYMENT_TEST.md](AUTH_DEPLOYMENT_TEST.md)

---

## 🔄 Phase 3 : Réactivation Publications (J+7+)

### Objectif
Reactiver les routes de newsfeed.

### Prérequis
- ✅ Phase 1 et 2 validés
- ✅ Auth stable en production
- ✅ Base de données optimisée

### Étapes

1. **Créer/Restaurer** `src/routes/publications.ts`
   - Voir code dans [REACTIVATE_FEATURES.md](REACTIVATE_FEATURES.md)

2. **Réactiver import** dans `src/routes/index.ts`
   ```typescript
   import publicationsRoutes from './publications.js';
   router.use('/publications', publicationsRoutes);
   ```

3. **Compiler et tester**
   ```bash
   npm run build  # Doit réussir
   npm run test  # Si tests existent
   ```

4. **Déployer**
   ```bash
   git add .
   git commit -m "feat: Reactivate publications routes"
   git push origin main
   pm2 restart emploi-backend
   ```

5. **Valider**
   ```bash
   curl http://localhost:5000/api/publications
   ```

### Document de référence
👉 [REACTIVATE_FEATURES.md](REACTIVATE_FEATURES.md)

---

## 🎯 Timeline recommandée

```
AUJOURD'HUI (20 Fév)
│
├─ 08:00 - Merger code simplifié
├─ 09:00 - Build & test localement
├─ 10:00 - Déployer sur VPS (Phase 1)
├─ 11:00 - Tests AUTH basiques
│
DEMAIN (21 Fév)
│
├─ 09:00 - Tests AUTH complets (Phase 2)
├─ 14:00 - Valider avec frontend
├─ 18:00 - Signature-off si OK
│
WEEK PROCHAINE (24+ Fév)
│
├─ Réactiver Publications (Phase 3)
├─ Tests publications
├─ Déployer progressivement autres features
```

---

## 📚 Documentation liée

| Document | Objectif | Quand lire |
|----------|----------|-----------|
| [DEPLOYMENT_FIX.md](DEPLOYMENT_FIX.md) | Corrections CORS & routes | Avant Phase 1 |
| [SIMPLIFIED_BUILD.md](SIMPLIFIED_BUILD.md) | État simplifié du backend | Avant Phase 1 |
| [AUTH_DEPLOYMENT_TEST.md](AUTH_DEPLOYMENT_TEST.md) | Tests complets auth | Phase 2 |
| [REACTIVATE_FEATURES.md](REACTIVATE_FEATURES.md) | Guide réactivation | Phase 3 |

---

## 🔍 Points clés du déploiement

### ✅ Ce qui a changé positivement

1. **Build sans erreur** 
   - Avant : TS2345 errors dans publications.ts
   - Après : 0 errors, compilation réussie

2. **Routes harmonisées**
   - Acceptent `/auth` ET `/api/auth`
   - Toutes les routes d'auth fonctionnent

3. **CORS correctement configuré**
   - Tous les domaines de production autorisés
   - Pas d'erreurs CORS côté browser

4. **Types simplifiés**
   - Seuls les types essentiels restent
   - Moins de dépendances, plus stable

### ⚠️ Limitations temporaires

1. **Publications désactivées**
   - `/api/publications` retourne 404
   - À réactiver après validation auth (Phase 2)

2. **Jobs désactivés**
   - Routes jobs non montées
   - À réactiver progressivement

3. **WebHooks paused**
   - Webhooks désactivés temporairement
   - À restaurer après validation

---

## 🆘 Troubleshooting déploiement

### Problème : Build échoue après `git pull`

**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problème : "CORS policy violation"

**Cause** : Domaine frontend pas dans CORS_ORIGINS

**Solution** :
```bash
# Vérifier .env
grep CORS_ORIGINS .env

# Ajouter si besoin
echo "CORS_ORIGINS=https://emploiplus-group.com,http://emploiplus-group.com,https://www.emploiplus-group.com" >> .env

# Redémarrer
pm2 restart emploi-backend
```

### Problème : "Database connection error"

**Cause** : DATABASE_URL incorrect

**Solution** :
```bash
# Vérifier connection string
echo $DATABASE_URL

# Tester la connexion
psql $DATABASE_URL -c "SELECT 1;"

# Si fails, vérifier credentials et network
```

### Problème : Port 5000 déjà utilisé

**Solution** :
```bash
# Voir qui utilise le port
lsof -i :5000

# Tuer si besoin
kill -9 <PID>

# Ou utiliser port différent
PORT=5001 node dist/server.js
```

### Problème : PM2 restart = "not found"

**Solution** :
```bash
# Lister les apps PM2
pm2 list

# Restart l'app correcte
pm2 restart 0  # L'app est probablement à l'index 0

# Ou relancer fresh
pm2 kill
pm2 start dist/server.js --name "emploi-backend"
```

---

## 📊 Validation post-déploiement

### Checklist finale

- [ ] Build succeeds (0 errors)
- [ ] Server starts without crash
- [ ] Health endpoint responds
- [ ] Admin registration works
- [ ] User registration works
- [ ] Login returns valid JWT
- [ ] CORS headers present
- [ ] Database queries succeed
- [ ] PM2/systemd can restart
- [ ] No errors in logs

### Tests recommandés

Avant de considérer Phase 1 complète :

```bash
# 1. Health check
curl http://localhost:5000/_health

# 2. Admin can register
curl -X POST http://localhost:5000/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Pass123!","full_name":"Test","role":"admin"}'

# 3. User can register
curl -X POST http://localhost:5000/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!","user_type":"candidat","first_name":"Jean","last_name":"Dupont"}'

# 4. Database is accessible
curl http://localhost:5000/api/health/db

# 5. CORS is working
curl -X OPTIONS http://localhost:5000/_health \
  -H "Origin: https://emploiplus-group.com" -i
```

---

## 🎓 Learnings & Best Practices

### Simplification était nécessaire
- ❌ Code complexe + types incomplets = build fail
- ✅ Code minimal + types stricts = build success

### TypeScript strictness
- ✅ Éviter `any`
- ✅ Utiliser interfaces claires
- ✅ Compiler régulièrement during dev

### Phased deployment
- ✅ Déployer core first (auth)
- ✅ Valider avant réactiver autres features
- ✅ Une feature à la fois

---

## 📞 Support & Escalation

### Si problème pendant Phase 1

1. Vérifier `.env` et credentials
2. Relire [DEPLOYMENT_FIX.md](DEPLOYMENT_FIX.md)
3. Checker logs : `pm2 logs`
4. Relancer build : `npm run build`
5. Contact support avec logs

---

## ✨ Conclusion

Le backend est maintenant **prêt pour déploiement** de la couche d'authentification.

- ✅ Build complet sans erreurs
- ✅ Routes d'auth fonctionnelles
- ✅ CORS configuré
- ✅ Database prêt
- ✅ Documentation complète

**Prochaine étape** : Exécuter Phase 1 et valider sur VPS.

---

**Document créé** : 20 février 2026  
**Responsable** : Backend Team  
**Dernière mise à jour** : 20 février 2026  
**Statut** : 🟢 Ready for deployment
