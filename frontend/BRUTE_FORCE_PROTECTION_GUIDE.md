# 🔐 Système de Protection par Force Brute - Documentation Complète

## 📋 Vue d'ensemble

Ce système met en place une protection sophistiquée contre les attaques par force brute sur votre VPS. Il enregistre chaque tentative de connexion, bloque les comptes après 5 tentatives échouées pendant 15 minutes, et offre des outils de monitoring pour détecter les attaques.

## 🔧 Architecture

### 1. Base de Données (`login_attempts`)

```sql
Table: login_attempts
- id (Primary Key)
- email (Foreign Key → admins.email)
- ip_address (INET)
- user_agent (TEXT)
- attempt_type ('failed' | 'success')
- created_at (TIMESTAMP)

Indexes:
✓ idx_login_attempts_email
✓ idx_login_attempts_ip
✓ idx_login_attempts_email_created
✓ idx_login_attempts_ip_created
```

### 2. Colonnes ajoutées à `admins`

```sql
ALTER TABLE admins:
- locked_until TIMESTAMP (quand le compte est débloqué)
- blocked_ips INET[] (liste des IPs bloquées)
- last_failed_at TIMESTAMP (dernière tentative échouée)
```

### 3. Services

**`loginAttemptsService.ts`** - Cœur du système:
- `checkLoginAttempts(email, ipAddress)` → Vérifie si login est autorisé
- `recordLoginAttempt(email, ip, userAgent, type)` → Enregistre une tentative
- `resetLoginAttempts(email, ip)` → Réinitialise après succès
- `getClientIP(req)` → Récupère l'IP réelle du client

## 📊 Configuration Actuelle

```
MAX_ATTEMPTS            = 5 tentatives
BLOCK_DURATION          = 15 minutes
ATTEMPT_WINDOW          = 15 minutes (fenêtre de temps pour compter les tentatives)
CLEANUP_RETENTION       = 30 jours (conservation des logs)
```

## 🔐 Logique de Protection

### Flux de Connexion

```
1. Utilisateur soumet email + password
   ↓
2. Récupération de l'IP client (via X-Forwarded-For)
   ↓
3. checkLoginAttempts(email, ip) → Vérification:
   a) Compte est-il locked_until > NOW() ?
   b) Tentatives échouées dans les 15 dernières min >= 5 ?
   c) IP a-t-elle >= 5 tentatives échouées ?
   ↓
4a. SI BLOQUÉ → 429 Too Many Requests + temps d'attente
   ↓
4b. SI AUTORISÉ → Procéder à l'authentification
   ↓
5a. Mot de passe INCORRECT → recordLoginAttempt(..., 'failed')
   ↓
5b. Mot de passe CORRECT → resetLoginAttempts(email, ip)
                          → Créer JWT Token
                          → Retourner les données admin
```

### Protection Double

Le système bloque sur **DEUX CRITÈRES** (OR):

1. **Par Email** (Compte Admin)
   - 5 tentatives échouées en 15 min → compte bloqué 15 min

2. **Par IP** (Attaque distribuée)
   - Même IP avec 5+ tentatives échouées (peu importe l'email) → bloquer cette IP 15 min

## 📡 Endpoints API

### 1. Login (Existant - Amélioré)

```http
POST /api/admin-auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secure_password"
}

Réponse 200 OK:
{
  "message": "Connexion réussie",
  "token": "eyJhbGc...",
  "admin": { ... }
}

Réponse 429 Too Many Requests:
{
  "error": "Trop de tentatives de connexion. Compte bloqué 15 minutes. Réessayez dans 12m 45s",
  "remainingMinutes": 12,
  "remainingSeconds": 45
}

Réponse 401 Unauthorized:
{
  "error": "Identifiants invalides"
}
```

### 2. Récupérer les Tentatives de Connexion

```http
GET /api/security/login-attempts?email=admin@example.com&limit=50&offset=0
Authorization: Bearer {token}

Réponse 200:
{
  "attempts": [
    {
      "id": 1,
      "email": "admin@example.com",
      "ip_address": "192.168.1.100",
      "attempt_type": "failed",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-02-20T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 3. Statistiques de Sécurité

```http
GET /api/security/stats?email=admin@example.com
Authorization: Bearer {token}

Réponse 200:
{
  "email": "admin@example.com",
  "total_attempts": 45,
  "failed_attempts": 3,
  "successful_attempts": 42,
  "last_attempt": "2026-02-20T10:35:00Z",
  "unique_ips": 2,
  "isCurrentlyLocked": false,
  "lockedUntil": null
}
```

### 4. Détecter les Attaques par IP

```http
GET /api/security/attacks?hours=24&minAttempts=5
Authorization: Bearer {token}
Requires: Super Admin

Réponse 200:
{
  "potentialAttacks": [
    {
      "ip_address": "203.0.113.45",
      "attempt_count": 23,
      "unique_accounts": 4,
      "latest_attempt": "2026-02-20T10:40:00Z",
      "targeted_emails": ["admin@example.com", "user1@example.com"]
    }
  ],
  "period": "24 hours",
  "threshold": "5 attempts"
}
```

### 5. Débloquer un Compte

```http
POST /api/security/unlock
Authorization: Bearer {token}
Content-Type: application/json
Requires: Super Admin

{
  "email": "admin@example.com"
}

Réponse 200:
{
  "message": "Account unlocked successfully",
  "email": "admin@example.com"
}
```

### 6. Effacer l'Historique de Connexion

```http
POST /api/security/clear-history
Authorization: Bearer {token}
Content-Type: application/json
Requires: Super Admin

{
  "email": "admin@example.com"
}

Réponse 200:
{
  "message": "Login history cleared"
}
```

## 🚀 Déploiement

### 1. Appliquer la Migration SQL

```bash
cd backend
psql -U your_db_user -d your_db_name -f src/migrations/006_login_attempts_security.sql
```

Ou via votre client SQL préféré.

### 2. Compiler TypeScript

```bash
cd backend
npm run build
```

### 3. Redémarrer le serveur

```bash
npm run prod
# ou avec pm2
pm2 restart backend
```

## 📊 Monitoring

### Requête SQL pour voir les attaques actuelles

```sql
-- Comptes bloqués actuellement
SELECT email, locked_until, 
       NOW()::timestamp - INTERVAL '15 minutes' as block_start
FROM admins 
WHERE locked_until > NOW()
ORDER BY locked_until DESC;

-- Top IPs malveillantes (24h)
SELECT ip_address, COUNT(*) as attempts,
       COUNT(DISTINCT email) as accounts_targeted
FROM login_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
AND attempt_type = 'failed'
GROUP BY ip_address
ORDER BY attempts DESC
LIMIT 20;

-- Historique d'un compte spécifique (7 jours)
SELECT created_at, ip_address, attempt_type, user_agent
FROM login_attempts
WHERE email = 'admin@example.com'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Logs à surveiller

Le service enregistre:
```
[LoginAttempts] Error checking login attempts: ...
[LoginAttempts] Error recording failed attempt: ...
[LoginAttempts] Error resetting login attempts: ...
[LoginAttempts] Cleaned up X old attempt records
```

## 🔍 Exemples d'Utilisation

### Scenario 1: Attaque par Force Brute

```
10:00:00 - Attaquant IP 203.0.113.45 essaie admin@example.com (fail)
10:00:15 - Même IP, même compte (fail)
10:00:30 - Même IP, même compte (fail)
10:00:45 - Même IP, même compte (fail)
10:01:00 - Même IP, même compte (fail) ← 5ème tentative
         → BLOQUÉ jusqu'à 10:16:00
10:01:15 - Même IP essaie → HTTP 429 "Réessayez dans 14m 45s"
```

### Scenario 2: Attaque Multi-Comptes

```
10:00:00 - IP 203.0.113.45 essaie admin1@... (fail)
10:00:10 - Même IP essaie admin2@... (fail)
10:00:20 - Même IP essaie admin3@... (fail)
10:00:30 - Même IP essaie admin4@... (fail)
10:00:40 - Même IP essaie admin5@... (fail) ← 5ème tentative d'UNE IP
         → Cette IP est bloquée 15 min
```

### Scenario 3: Nettoyage Automatique

Chaque jour, les tentatives > 30 jours sont supprimées automatiquement (via SQL fonction `cleanup_old_login_attempts()`).

**Optionnel**: Planifier avec pg_cron:
```sql
SELECT cron.schedule('cleanup-login-attempts', '0 3 * * *', 'SELECT cleanup_old_login_attempts()');
```

## 🛡️ Bonnes Pratiques

### Pour les Admins

1. ✅ **N'utilisez pas les mêmes mots de passe** sur plusieurs comptes
2. ✅ **Changez vos mots de passe régulièrement** (tous les 90 jours)
3. ✅ **Utilisez un VPN/Proxy** d'IP fixe si possible
4. ✅ **Activez l'authentification à 2 facteurs** (à venir)

### Pour les Super Admins

1. ✅ Vérifiez l'endpoint `/api/security/attacks` quotidiennement
2. ✅ Débloquez rapidement les comptes légimes bloqués par erreur
3. ✅ Notifiez les admins en cas d'attaque
4. ✅ Augmentez MAX_ATTEMPTS/BLOCK_DURATION si nécessaire

### Pour le VPS

1. ✅ **Configurez un WAF** (ModSecurity)
2. ✅ **Rate-limit au niveau Nginx** en plus du backend
3. ✅ **Exportez les logs** (Splunk, DataDog, ELK)
4. ✅ **Configurez des alertes** sur trop de 429 errors

```nginx
# Exemple Nginx Rate Limit
limit_req_zone $binary_remote_addr zone=admin_zone:10m rate=5r/m;
location /api/admin-auth/login {
  limit_req zone=admin_zone burst=5 nodelay;
  proxy_pass http://backend;
}
```

## 🔧 Configuration Avancée

Pour modifier les limites, éditez `loginAttemptsService.ts`:

```typescript
// Augmenter à 10 tentatives avant blocage
const MAX_ATTEMPTS = 10;

// Bloquer 30 minutes au lieu de 15
const BLOCK_DURATION_MINUTES = 30;

// Réinitialiser les compteurs après 30 minutes d'inactivité
const ATTEMPT_WINDOW_MINUTES = 30;
```

## 📞 Support & Troubleshooting

### Problème: Migration échoue

```bash
# Vérifier la syntaxe SQL
psql -U user -d db -f migrations/006_login_attempts_security.sql

# Si erreur: vérifier que les colonnes n'existent pas déjà
psql -U user -d db -c "\d admins"
```

### Problème: Comptes bloqués par erreur

```bash
# Débloquer immédiatement:
curl -X POST http://localhost:5000/api/security/unlock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com"}'

# Ou via SQL direct:
UPDATE admins SET locked_until = NULL WHERE email = 'admin@example.com';
```

### Problème: IP détectée comme mauvaise

```bash
# Vérifier que X-Forwarded-For est configuré correctement
# dans votre proxy (Nginx, Apache, etc.)

# Test: afficher l'IP détectée
curl -H "X-Forwarded-For: 192.168.1.100" http://backend-internal/_health
```

## 🎯 Prochaines Étapes

- [ ] Implémenter l'authentification 2FA
- [ ] Ajouter les emails de notification d'attaque
- [ ] Dashboard de sécurité en temps réel
- [ ] Intégration avec un SIEM (ELK, Splunk)
- [ ] Whitelist d'IPs connues

---

**Version**: 1.0 | **Date**: 20 Février 2026 | **Auteur**: Développement Backend
