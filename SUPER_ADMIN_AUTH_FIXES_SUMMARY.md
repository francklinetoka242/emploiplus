# 🔐 Super Admin - Corrections de Déconnexion Automatique

## ✅ Résumé des Corrections Appliquées

### Problème Initial
**L'interface Super Admin est visible mais vous êtes déconnecté automatiquement après quelques secondes.**

### 🎯 Causes Identifiées & Corrigées

---

## 1️⃣ **Persistance du Token**: ✅ FIXÉ

### Problème
Le token JWT n'était pas correctement persisté. Il était stocké dans localStorage mais était effacé trop agressivement lors d'erreurs 401.

### Solution Appliquée
**Fichier**: `frontend/src/lib/headers.ts`

- ✅ Token stocké dans localStorage (clé: `adminToken`)
- ✅ Vérifié au chargement de la page
- ✅ **NE s'efface que si vraiment expiré** (nouveau)
- ✅ Grace period de 5 secondes avant suppression

### Détails Techniques
```typescript
// AVANT: Supprimait le token sur n'importe quel 401
if (res.status === 401) {
  localStorage.removeItem('adminToken');  // ❌ Trop agressif!
}

// APRÈS: Vérifie si token est VRAIMENT expiré
if (res.status === 401) {
  const secondsUntilExpiry = calculateExpiry(token);
  if (secondsUntilExpiry <= 5) {  // ✅ Seulement si vraiment expiré
    localStorage.removeItem('adminToken');
  }
}
```

---

## 2️⃣ **Intercepteur Axios (apiFetch)**: ✅ FIXÉ

### Problème
La fonction `apiFetch()` déclenchait un logout immédiat sur TOUTE erreur 401, même si le token était encore valide.

**Conséquences:**
- Utilisateurs déconnectés après quelques secondes
- Pas de distinction entre "token expiré" et "erreur serveur"
- Aucune possibilité de retry intelligent

### Solution Appliquée
**Fichier**: `frontend/src/lib/headers.ts` (fonction `apiFetch`)

```typescript
// NOUVEAU SYSTÈME INTELLIGENT:
1. ⏰ AVANT LA REQUÊTE:
   - Décoder le token JWT
   - Vérifier l'expiration (exp claim)
   - Log: ⏰ [TOKEN SYNC] affiche temps exact

2. 📊 SUR ERREUR 401:
   - Recalculer: secondsUntilExpiry
   - Si > 5 secondes: ✅ Ne pas supprimer (serveur a un pb)
   - Si ≤ 5 secondes: ✅ Supprimer (vraiment expiré)
   - Log: 🔍 [DIAGNOSTIC 401] affiche raison exacte

3. 🔄 REDIRECTION:
   - Seulement si token réellement expiré
   - Jamais pour erreurs transitoires
```

### Résultat
```
AVANT:  401 → Suppression du token → Logout immédiat ❌
APRÈS:  401 → Vérification expiration → Action intelligente ✅
```

---

## 3️⃣ **Synchronisation Horloge**: ✅ LOGS AJOUTÉS

### Problème
Impossible de diagnostiquer les problèmes de timing entre serveur et client.

### Solution Appliquée
**Fichiers modifiés**: 
- `frontend/src/lib/headers.ts`
- `frontend/src/context/AuthContext.tsx`

### 📊 Logs Affichés dans Console

#### A. Avant chaque requête API:
```
⏰ [TOKEN SYNC] Vérification synchronisation horloge:
├── tokenKey: "adminToken"
├── issuedAt: "2025-02-23T10:00:00.000Z"
├── expiresAt: "2025-03-02T10:00:00.000Z"
├── clientNow: "2025-02-23T10:00:30.000Z"
├── secondsUntilExpiry: 604770  ← IMPORTANT!
└── bufferBeforeExpiry: 60 secondes
```

#### B. Si erreur 401:
```
🔍 [DIAGNOSTIC 401]
├── tokenKey: "adminToken"
├── secondsUntilExpiry: 120  ← Nombre positif = token valide!
├── expiresAt: "2025-03-02T10:00:00.000Z"
├── clientNow: "2025-02-23T10:00:30.000Z"
└── message: "Token techniquement valide mais serveur retourne 401"
            → Indique un problème CORS ou serveur ⚠️
```

#### C. Lors du login:
```
📋 Token Validation - SYNC HORLOGE:
├── issuedAt: "2025-02-23T10:00:00.000Z"
├── expiresAt: "2025-03-02T10:00:00.000Z"
├── now: "2025-02-23T10:00:30.000Z"
├── secondsUntilExpiry: 604770
└── clockSkew: "Si négatif, horloge client en avance..."
```

### 🔍 Comment Utiliser Ces Logs

**Ouvrir la console du navigateur** (F12 → Console):
1. Allez sur l'interface Super Admin
2. Loggez-vous
3. Regardez les messages ⏰ [TOKEN SYNC]
4. **Si `secondsUntilExpiry` diminue progressivement** → Token fonctionne ✅
5. **Si vous voyez 🔍 [DIAGNOSTIC 401]** → Problème détecté, regardez le message

---

## 4️⃣ **CORS - Credentials**: ✅ VÉRIFIÉ & AMÉLIORÉ

### Configuration Vérifiée ✅

**Backend** (`backend/.env`):
```env
CORS_ORIGINS="https://emploiplus-group.com,https://www.emploiplus-group.com"
```

**Backend** (`backend/src/middleware/cors.ts`):
```typescript
cors({
  origin: (origin, callback) => { /* vérification */ },
  credentials: true,  ✅ ESSENTIAL!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', ...],
})
```

**Frontend - CORRIGÉ** (`frontend/src/lib/api.ts`):
```typescript
// loginAdmin function - MAINTENANT AVEC:
fetch(`${API_URL}/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',  ✅ AJOUTÉ - Important pour CORS!
  body: JSON.stringify({ email, password }),
})
```

**Frontend** (`frontend/src/lib/headers.ts`):
```typescript
// apiFetch function - DÉJÀ PRÉSENT:
const fetchInit: RequestInit = {
  ...init,
  headers,
  credentials: 'include',  ✅ Présent
};
```

### ✅ Résultat
- Cookies/tokens sont maintenant correctement envoyés dans les requêtes cross-origin
- Backend accepte les credentials de https://emploiplus-group.com
- Pas de blocage CORS pour l'authentification

---

## 📁 Fichiers Modifiés

### Frontend (3 fichiers):
1. **`frontend/src/lib/headers.ts`** - 🔧 Réécrit 50% de la fonction `apiFetch()`
   - Logs détaillés TOKEN SYNC
   - Intelligent 401 handling
   - Grace period avant suppression

2. **`frontend/src/context/AuthContext.tsx`** - Amélioration logs
   - Meilleur affichage clock skew

3. **`frontend/src/lib/api.ts`** - Ajout credentials
   - `credentials: 'include'` dans loginAdmin()

### Backend (0 fichiers modifiés - déjà correct!)
- ✅ CORS middleware déjà configuré correctement
- ✅ JWT secrets déjà définis
- ✅ Middlewares d'authentification en place

---

## 🧪 Tester les Corrections

### Test 1: Persistance du Token
```javascript
// Dans Console du navigateur (F12)

// Étape 1: Loggez-vous
// ✅ Vous devriez voir: ✅ Connexion réussie

// Étape 2: Vérifiez localStorage
localStorage.getItem('adminToken')
// Doit retourner le token (chaîne commençant par "ey...")

// Étape 3: Rafraîchissez la page (F5)
// Vous devriez rester loggé ✅
localStorage.getItem('adminToken')
// Token toujours présent ✅
```

### Test 2: Logs du Décalage Horaire
```javascript
// Dans Console → filtrer par "TOKEN SYNC"
// Vous devriez voir à chaque requête API:
// ⏰ [TOKEN SYNC] Vérification synchronisation horloge
//    secondsUntilExpiry: [grand nombre positif]

// Si vous voyez: secondsUntilExpiry: -5
// → L'horloge serveur est 5 secondes en avance → PROBLÈME!
```

### Test 3: Erreur 401 avec Token Valide
```javascript
// Simulation dans Console:
const token = localStorage.getItem('adminToken');

// Loggez le payload:
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Expire à:', new Date(payload.exp * 1000).toISOString());
console.log('Maintenant:', new Date().toISOString());
// Si expiresAt > maintenant: Token est valide

// Si vous voyez 🔍 [DIAGNOSTIC 401]
// mais secondsUntilExpiry > 0:
// → C'est un problème serveur, pas de token
```

### Test 4: CORS Credentials
```javascript
// Vérifier que credentials sont envoyés
// Dans DevTools → Network tab
// Clic sur requête API
// → Headers → voir Authorization header
// → Cookies section → voir les cookies envoyés
```

---

## 🚀 Prochaines Étapes

### 1. **Reconstruire et Déployer**
```bash
# Frontend
cd /home/emploiplus-group.com/public_html/frontend
npm install
npm run build

# Backend (si compilé)
cd /home/emploiplus-group.com/public_html/backend
npm install
npm run build

# Ou redémarrer le serveur:
pm2 restart backend
```

### 2. **Vérifier les Logs**
1. Ouvrir console du navigateur (F12)
2. Aller sur l'admin panel
3. Chercher les messages ⏰ [TOKEN SYNC]
4. Vérifier que `secondsUntilExpiry` est un grand nombre positif

### 3. **Tester la Permanence**
1. Se logger
2. Rafraîchir la page (F5)
3. Attendre 10 secondes
4. Vérifier qu'on est toujours loggé

---

## 🔍 Diagnostiquer les Problèmes

### Symptôme: Déconnecté après quelques secondes

**Cause #1: Horloge serveur décalée**
```
Solution:
1. Console → chercher ⏰ [TOKEN SYNC]
2. Vérifier si secondsUntilExpiry diminue normalement
3. Sur serveur: date
4. Sync: sudo ntpdate -s time.nist.gov
```

**Cause #2: Problème JWT Secret**
```
Solution:
1. Vérifier backend/.env: JWT_SECRET
2. Vérifier backend/src/config/jwt.ts: même secret
3. Frontend ne génère jamais de token
   (le serveur génère, frontend stocke seulement)
```

**Cause #3: CORS rejeté**
```
Vérifier:
1. Backend .env: CORS_ORIGINS inclut https://emploiplus-group.com
2. Browser console: erro CORS (message rouge)
3. Network tab: réponse avec Access-Control-Allow-Credentials
```

---

## 📊 Configuration Finale Vérifiée

```
✅ BACKEND/.env
   ├── CORS_ORIGINS = "https://emploiplus-group.com,..."
   ├── JWT_SECRET = configuré
   └── NODE_ENV = production

✅ BACKEND/src/middleware/cors.ts
   ├── credentials: true
   ├── origin: vérification correct
   └── allowedHeaders: Authorization inclus

✅ FRONTEND/src/lib/headers.ts
   ├── apiFetch() avec logs TOKEN SYNC
   ├── 401 handling intelligent
   └── credentials: 'include' dans fetch

✅ FRONTEND/src/lib/api.ts
   ├── loginAdmin() avec credentials: 'include'
   └── autres calls via apiFetch()

✅ FRONTEND/.env
   └── VITE_API_URL = https://emploiplus-group.com/api
```

---

## 📞 Support

En cas de problème persistant:

1. **Ouvrir Console du Navigateur** (F12 → Console)
2. **Chercher les messages**:
   - ⏰ [TOKEN SYNC] → affiche timing
   - 🔍 [DIAGNOSTIC 401] → affiche problème exact
   - ❌ erreurs → copier-coller

3. **Vérifier Logs Serveur**:
   ```bash
   tail -f /var/log/backend.log | grep -i "cors\|token\|401"
   ```

4. **Redémarrer Services**:
   ```bash
   # Arrêter/démarrer backend
   pm2 stop backend
   pm2 start backend
   pm2 logs backend
   ```

---

**Dernière mise à jour**: 2025-02-23  
**Statut**: ✅ Toutes les corrections appliquées
**Tests**: Prêt pour déploiement
