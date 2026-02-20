# 🔐 Implémentation de la Protection contre les Attaques par Force Brute

## 📌 RÉSUMÉ EXÉCUTIF

Vous demandé une protection critique contre les attaques par force brute on the LOGIN (connexion admin). 

**✅ CE QUI A ÉTÉ CONSTRUISÉ:**

1. **Table `login_attempts`** - Enregistre CHAQUE tentative de connexion par:
   - Email de l'administrateur
   - Adresse IP du client
   - Type d'action (success/failed)
   - User-Agent du navigateur

2. **Logique de Blocage (duré 15 minutes)**:
   - Après 5 tentatives échouées → compte BLOQUÉ
   - Après 5 tentatives échouées depuis UNE IP → cette IP BLOQUÉE
   - Retourne HTTP 429 avec temps d'attente restant

3. **Service de Sécurité complet** - `loginAttemptsService.ts`:
   - Vérification du blocage avant chaque tentative
   - Enregistrement de chaque tentative
   - Réinitialisation automatique après succès
   - Nettoyage des anciens logs (30 jours)

4. **Endpoints d'Administration** - `/api/security/*`:
   - Voir l'historique des tentatives
   - Débloquer les comptes manuellement
   - Détecter les attaques par IP
   - Monitorer en temps réel

---

## 📦 FICHIERS CRÉÉS / MODIFIÉS

### NOUVELLES MIGRATIONS (1 fichier)
```
✨ backend/src/migrations/006_login_attempts_security.sql
   • Crée la table login_attempts avec indices
   • Ajoute colonnes locked_until, blocked_ips, last_failed_at à admins
   • Fonction de nettoyage automatique des logs anciens
```

### NOUVEAUX SERVICES (1 fichier)
```
✨ backend/src/services/loginAttemptsService.ts (280 lignes)
   • Cœur du système de protection
   • checkLoginAttempts(email, ip) ← fonction principale
   • recordLoginAttempt() ← enregistrement des tentatives
   • resetLoginAttempts() ← réinitialisation
   • getClientIP() ← récupération IP réelle (proxy-safe)
   • getAttemptStats() ← statistiques pour dashboard
```

### NOUVEAUX CONTRÔLEURS (1 fichier)
```
✨ backend/src/controllers/security-monitoring.controller.ts (180 lignes)
   • getRecentLoginAttempts() ← voir historique
   • getSecurityStats() ← statsistiques d'un compte
   • getFailedAttemptsByIP() ← détecter attaques
   • unlockAdminAccount() ← débloquer manuellement
   • clearLoginHistory() ← nettoyer historique
```

### NOUVELLES ROUTES (1 fichier)
```
✨ backend/src/routes/security-monitoring.ts
   • GET  /api/security/login-attempts  ← historique complet
   • GET  /api/security/stats            ← statistiques compte
   • GET  /api/security/attacks          ← détection attaques (super-admin)
   • POST /api/security/unlock           ← débloquer (super-admin)
   • POST /api/security/clear-history    ← nettoyer (super-admin)
```

### FICHIERS MODIFIÉS (3 fichiers)

```
📝 backend/src/middleware/adminAuth.ts
   ✓ Ajout import du nouveau service loginAttemptsService
   ✓ Deprecated les anciennes fonctions (backward compatibility)
   ✓ Gardé logAdminAction() et checkPermission()
```

```
📝 backend/src/controllers/admin-auth.controller.ts
   ✓ Changé imports: utiliser loginAttemptsService au lieu de adminAuth
   ✓ Modifié loginAdmin() pour:
     - Récupérer l'IP réelle du client
     - Appeler checkLoginAttempts(email, IP) ← ICI c'est la magie!
     - Enregistrer les tentatives échouées avec IP
     - Retourner temps restant dans la réponse 429
```

```
📝 backend/src/server.ts
   ✓ Ajout import des routes security-monitoring
   ✓ Montage des routes: /api/security et /security
```

### DOCUMENTATION (3 fichiers)
```
📚 BRUTE_FORCE_PROTECTION_GUIDE.md (700+ lignes)
   • Configuration complète
   • Exemples d'API avec curl
   • Requêtes SQL pour monitoring
   • Bonnes pratiques de sécurité
   • Troubleshooting

📜 deploy-brute-force-protection.sh (script bash)
   • Applique la migration automatiquement
   • Vérifie le schéma de base de données
   • Compile le TypeScript
   • Affiche un résumé de déploiement

🧪 backend/test-brute-force-protection.ts (test suite)
   • Tests automatisés complètement la logique
   • Vérifie le blocage après 5 tentatives
   • Valide les messages d'erreur
   • Teste le suivi par IP
```

---

## 🚀 COMMENT DÉPLOYER

### OPTION 1: Déploiement Automatisé (Recommandé)

```bash
# Depuis la racine du projet
chmod +x deploy-brute-force-protection.sh
./deploy-brute-force-protection.sh
```

Cela va:
1. ✓ Appliquer la migration SQL
2. ✓ Vérifier le schéma
3. ✓ Compiler le TypeScript
4. ✓ Afficher un résumé

### OPTION 2: Déploiement Manuel

**Étape 1: Appliquer la migration SQL**
```bash
cd backend
psql $DATABASE_URL -f src/migrations/006_login_attempts_security.sql
```

**Étape 2: Compiler TypeScript**
```bash
npm run build
```

**Étape 3: Redémarrer le serveur**
```bash
npm run prod
# ou avec pm2:
pm2 restart backend
```

---

## 💡 COMMENT ÇA MARCHE (Flux Technique)

### Lors de chaque tentative de connexion:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. POST /api/admin-auth/login { email, password }           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. loginAdmin() controller:                                  │
│    • Récupère IP du client: getClientIP(req)                │
│    • User-Agent du navigateur                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. checkLoginAttempts(email, ip) ← LA CLÉ!                 │
│                                                              │
│    SELECT COUNT(*) FROM login_attempts                      │
│    WHERE email = $1                                         │
│    AND attempt_type = 'failed'                              │
│    AND created_at > NOW() - 15 minutes                      │
│                                                              │
│    + Même vérification pour l'IP seule                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4a. SI BLOQUÉ (>= 5 tentatives):                           │
│     • UPDATE admins SET locked_until = NOW() + 15 min      │
│     • RETURN HTTP 429                                       │
│       {                                                      │
│         "error": "Compte bloqué. Réessayez dans 14m 32s",   │
│         "remainingMinutes": 14,                             │
│         "remainingSeconds": 32                              │
│       }                                                      │
└─────────────────────────────────────────────────────────────┘
                    OU
┌─────────────────────────────────────────────────────────────┐
│ 4b. SI AUTORISÉ:                                            │
│     • Vérifier les identifiants (email/password)            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5a. SI MOT DE PASSE INCORRECT:                              │
│     • recordLoginAttempt(email, ip, ua, 'failed')           │
│     • INSERT INTO login_attempts (...)                      │
│     • RETURN HTTP 401 "Identifiants invalides"              │
└─────────────────────────────────────────────────────────────┘
                    OU
┌─────────────────────────────────────────────────────────────┐
│ 5b. SI MOT DE PASSE CORRECT:                                │
│     • resetLoginAttempts(email, ip)                         │
│     • UPDATE admins SET locked_until = NULL                 │
│     • recordLoginAttempt(email, ip, ua, 'success')          │
│     • Générer JWT token                                     │
│     • RETURN HTTP 200 + token                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 TESTER LA PROTECTION

### Test 1: Vérifier que ça fonctionne

```bash
# Depuis le dossier backend
npm run build
npm run dev

# Dans un autre terminal:
npx ts-node test-brute-force-protection.ts
```

### Test 2: Déclencher le blocage manuellement

```bash
# Se connecter 5 fois avec un mauvais mot de passe
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/admin-auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done

# À la 6ème tentative → HTTP 429
curl -X POST http://localhost:5000/api/admin-auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"wrong"}'

# Réponse:
# {
#   "error": "Trop de tentatives de connexion. Compte bloqué 15 minutes. Réessayez dans 14m 45s",
#   "remainingMinutes": 14,
#   "remainingSeconds": 45
# }
```

### Test 3: Voir l'historique des tentatives

```bash
# D'abord, se connecter avec un admin valide pour obtenir le token
TOKEN=$(curl -X POST http://localhost:5000/api/admin-auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"secure_pass"}' | jq -r '.token')

# Voir les tentatives récentes
curl -X GET "http://localhost:5000/api/security/login-attempts?limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Voir les stats d'un compte
curl -X GET "http://localhost:5000/api/security/stats?email=test@example.com" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 4: Débloquer un compte (super-admin)

```bash
TOKEN=$(curl -X POST http://localhost:5000/api/admin-auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"super-admin@example.com","password":"pass"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/security/unlock \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'
```

---

## 🔒 CONFIGURATIONS DE SÉCURITÉ

### Configuration par défaut (15 minutes, 5 tentatives)

Si vous voulez adapter:

**Fichier**: `backend/src/services/loginAttemptsService.ts`

```typescript
// Modifier ces constantes:
const MAX_ATTEMPTS = 5;                      // Nombre max d'essais
const BLOCK_DURATION_MINUTES = 15;           // Durée du blocage
const ATTEMPT_WINDOW_MINUTES = 15;           // Fenêtre de temps pour compter
```

**Exemple**: Blocage plus strict (30 min après 3 tentatives)

```typescript
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 30;
```

---

## 📊 MONITORING EN TEMPS RÉEL

### Requêtes SQL pour surveiller les attaques

```sql
-- Voir les comptes actuellement bloqués
SELECT email, locked_until, 
       EXTRACT(EPOCH FROM (locked_until - NOW())) / 60 as minutes_remaining
FROM admins 
WHERE locked_until > NOW()
ORDER BY locked_until DESC;

-- Top 10 IPs malveillantes (dernières 24h)
SELECT ip_address, 
       COUNT(*) as total_attempts,
       COUNT(DISTINCT email) as accounts_targeted,
       MAX(created_at) as latest_attempt
FROM login_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
AND attempt_type = 'failed'
GROUP BY ip_address
ORDER BY total_attempts DESC
LIMIT 10;

-- Historique complet d'un compte (7 jours)
SELECT created_at, ip_address, attempt_type, user_agent
FROM login_attempts
WHERE email = 'admin@example.com'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Compteur en temps réel (dernière heure)
SELECT 
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN attempt_type = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN attempt_type = 'success' THEN 1 END) as success,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT email) as unique_accounts
FROM login_attempts
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Lire le fichier `BRUTE_FORCE_PROTECTION_GUIDE.md`
- [ ] Exécuter `./deploy-brute-force-protection.sh` OU appliquer la migration manuellement
- [ ] Compiler: `cd backend && npm run build`
- [ ] Redémarrer le serveur: `npm run prod`
- [ ] Tester: `npx ts-node test-brute-force-protection.ts`
- [ ] Vérifier que les routes sont accessibles: `curl http://localhost:5000/_health`
- [ ] Tester un login réel
- [ ] Configurer le monitoring (logs, alertes)
- [ ] Former l'équipe aux nouveaux endpoints `/api/security/*`

---

## 🚨 DÉPANNAGE

### Problème: Migration échoue avec "table already exists"
**Solution**: C'est normal! Les migrations idempotentes utilisent `IF NOT EXISTS`. Vérifiez juste que les colonnes existent:

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'admins' AND column_name = 'locked_until';
```

### Problème: IP n'est pas détectée correctement
**Cause**: Proxy/Nginx ne passe pas `X-Forwarded-For`  
**Solution**: Vérifier la config de votre reverse proxy:

```nginx
# Dans Nginx:
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Real-IP $remote_addr;
```

### Problème: Les comptes restent bloqués indéfiniment
**Cause**: Colonne `locked_until` n'a pas été mise à jour  
**Solution**: Débloquer manuellement:

```sql
UPDATE admins SET locked_until = NULL 
WHERE email = 'admin@example.com';
```

---

## 📺 VIDEO EXPLICATIVE (Si demandé)

Le flux de sécurité fonctionne en 4 étapes:

1. **Tracé** → Chaque tentative enregistrée par IP + email
2. **Détection** → Après 5 échecs en 15 min
3. **Blocage** → HTTP 429 + durée d'attente
4. **Déblocage** → Automatique après 15 min OU manuel par super-admin

---

## 🎯 PROCHAINES AMÉLIORATIONS (Roadmap)

- [ ] 2FA (Two-Factor Authentication)
- [ ] Email de notification d'attaque
- [ ] Dashboard de sécurité en temps réel
- [ ] Whitelist/Blacklist d'IPs
- [ ] Intégration SIEM (Splunk, ELK)
- [ ] Captcha après 3 tentatives
- [ ] Challenge question après blocage

---

**Version**: 1.0 | **Date**: 20 Février 2026 | **Auteur**: Backend Security Team

Pour toute question, consulter: `BRUTE_FORCE_PROTECTION_GUIDE.md`
