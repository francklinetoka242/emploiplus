# 🔍 TEST DIAGNOSTIC DU FORMULAIRE DE CV

## ✅ ÉTAPES À SUIVRE POUR DIAGNOSTIQUER LE PROBLÈME

### 1️⃣ Ouvre le fichier diagnostic

**Choix A: Via le navigateur directement (sans serveur)**
```
file:///Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/DIAGNOSTIC_FRONTEND.html
```

**Choix B: Via localhost (si tu veux tester le proxy Vite)**
```
http://localhost:5173
```
Puis navigue vers une offre d'emploi → "Candidature Intelligente"

### 2️⃣ Prépare les outils

**Terminal 1 - Regarde les logs du backend:**
```bash
tail -f /tmp/server-debug.log | grep -E "\[ROUTE\]|\[MULTER\]|\[AI\]"
```

**Navigateur - Ouvre F12 (Developer Tools):**
- Onglet "Console" → Pour voir logs frontend
- Onglet "Network" → Pour voir la requête HTTP

### 3️⃣ Effectue le test

**Dans le formulaire:**
1. Clique **"Charger les offres"** → Devrait afficher 9 offres ✅
2. Sélectionne **un fichier PDF** → Vérifies qu'il s'affiche en preview ✅  
3. Sélectionne **une "Job ID"** → Choisis parmi les offres ✅
4. Clique **"Test DIRECT"** → Teste directement vers localhost:5000
   - Si ✅ SUCCESS → Le problème est côté proxy ou frontend
   - Si ❌ Erreur → Le problème est au backend
5. Clique **"Test VIA PROXY"** → Teste via le proxy Vite (http://localhost:5173)
   - Si ✅ SUCCESS → Tout fonctionne avec le React app
   - Si ❌ Erreur → Le proxy Vite pose problème

### 4️⃣ Lis les logs

**Console Frontend (F12 → Console):**
```
[Frontend] FormData créée avec:
[Frontend]   - jobId: 12
[Frontend]   - file: File(nom.pdf, 12345 bytes, type=application/pdf)
[Frontend] FormData entries:
[Frontend]   - jobId: 12
[Frontend]   - file: File(nom.pdf, 12345 bytes, type=application/pdf)
[Frontend] Envoi vers /api/ai/analyze-cv...
[Frontend] Response status: 200
[Frontend] ✅ SUCCESS Response (raw): {"success":true,"data":{...}}
```

**Terminal Backend (logs du serveur):**
```
[ROUTE] ========== ANALYZE-CV ROUTE START ==========
[ROUTE] POST /api/ai/analyze-cv request received
[ROUTE] Headers: { 'content-type': 'multipart/form-data; boundary=...' }
[ROUTE] ========== AFTER MULTER ==========
[ROUTE] req.file: ✅ EXISTS
[ROUTE] File details:
[ROUTE]   - fieldname: file
[ROUTE]   - originalname: mon-cv.pdf
[ROUTE]   - mimetype: application/pdf
[ROUTE]   - size: 12345 bytes
[ROUTE] req.body: { jobId: '12' }
[ROUTE] Body keys: [ 'jobId' ]
[ROUTE]   - jobId: 12
[ROUTE] ========== CALLING CONTROLLER ==========
[AI] ========================================
[AI] 🚀 ANALYZE-CV ENDPOINT CALLED
[AI] ========================================
[AI] req.file exists: true
[AI] req.body: { jobId: '12' }
[AI] ===== STARTING CV ANALYSIS =====
```

---

## 🚨 DIAGNOSTIC DES ERREURS

### Erreur 1: "Aucun fichier PDF fourni" (400 Bad Request)

**Cela signifie:**
- Multer n'a pas reçu le fichier (req.file = undefined)

**Choses à vérifier:**
1. ✅ Dans Frontend: `formData.append('file', pdfFile)` (la clé doit être 'file')
2. ✅ Dans Backend: `upload.single('file')` (doit matcher 'file')
3. ✅ Le fichier doit être un PDF (mimetype = 'application/pdf')
4. ✅ Le fichier ne doit pas dépasser 50 MB

**Logs à chercher:**
```
❌ [ROUTE] req.file: MISSING ❌
❌ [AI] ❌ ERROR: No file uploaded
```

### Erreur 2: "ID de l'offre requis" (400 Bad Request)

**Cela signifie:**
- Le fichier a été reçu, mais pas le jobId

**Choses à vérifier:**
1. ✅ Dans Frontend: `formData.append('jobId', jobId)` (doit avoir une valeur)
2. ✅ jobId ne doit pas être vide, null, ou undefined

**Logs à chercher:**
```
✅ [ROUTE] req.file: EXISTS ✅
❌ [ROUTE] req.body.jobId: undefined
❌ [AI] ❌ ERROR: No jobId provided in body
```

### Erreur 3: "Job not found" (404)

**Cela signifie:**
- Le fichier et jobId ont été reçus, mais ce jobId n'existe pas en base

**Choses à vérifier:**
1. ✅ Utilise un jobId qui existe
2. ✅ Clique "Charger les offres" pour voir les IDs valides

**Logs à chercher:**
```
✅ [ROUTE] req.file: EXISTS ✅
✅ [ROUTE] req.body: { jobId: '12' }
❌ [AI] ❌ ERROR fetching job: Error: Job not found
```

---

## ✅ CAS RÉUSSI - LOGS ATTENDUS

**Frontend Console:**
```
[Frontend] FormData créée avec:
[Frontend]   - jobId: 12
[Frontend]   - file: File(CV.pdf, 549 bytes, type=application/pdf)
[Frontend] Envoi vers /api/ai/analyze-cv...
[Frontend] Response status: 200
[Frontend] ✅ SUCCESS Response: {"success":true,"data":{"jobId":"12"...}}
```

**Backend Terminal:**
```
[ROUTE] req.file: ✅ EXISTS
[ROUTE]   - fieldname: file
[ROUTE]   - originalname: CV.pdf
[ROUTE]   - size: 549 bytes
[ROUTE] req.body: { jobId: '12' }
[AI] ===== STARTING CV ANALYSIS =====
[AI] ✅ PDF text extracted successfully
[AI] ✅ Job fetched successfully
[AI] ===== CV ANALYSIS COMPLETED SUCCESSFULLY =====
```

---

## 📋 CHECKLIST À ENVOYER

Quand tu as testé, envoie-moi :

- [ ] Test DIRECT: ✅ SUCCESS ou ❌ Erreur?
- [ ] Test VIA PROXY: ✅ SUCCESS ou ❌ Erreur?
- [ ] **Console Frontend** (F12 → Console) → Copie tous les logs `[Frontend]`
- [ ] **Terminal Backend** → Copie TOUS les logs `[ROUTE]` et `[AI]`

Cela me permettra de diagnostiquer le problème exactement!
