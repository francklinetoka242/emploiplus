# Guide de Test - Fallback Silencieux CV Analysis

## Démarrer le serveur

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend
node server.js
```

Vous verrez:
```
✓ Database connection successful
✓ Server listening on port 5000
✓ API available at http://localhost:5000/api
[AI] ⚠️  No models available, will use MOCK analysis instead
```

## Obtenir l'ID d'une offre d'emploi

```bash
curl -s http://localhost:5000/api/jobs | head -20
```

Notez un `id` d'offre (ex: `1`, `2`, etc.)

## Tester avec un fichier PDF

### Créer un fichier test PDF simple

```bash
# Pour macOS avec PDF simple en texte pur
cat > /tmp/test_cv.txt << 'EOF'
John Doe
Senior JavaScript Developer

EXPERIENCE
- 5 years JavaScript development
- 3 years Python projects
- 10 years IT experience

SKILLS
- JavaScript, React, Node.js
- Python, Django
- PostgreSQL, MongoDB
- AWS, Docker
EOF
```

### Envoyer une requête d'analyse

```bash
curl -X POST http://localhost:5000/api/ai/analyze-cv \
  -F "file=@/tmp/test_cv.txt" \
  -F "jobId=1" \
  2>&1 | jq .
```

## Réponse attendue (Fallback 200)

```json
{
  "success": true,
  "fallback": true,
  "message": "Analyse en mode dégradé (API temporairement indisponible)",
  "data": {
    "jobId": "1",
    "jobTitle": "Titre du poste",
    "company": "Entreprise",
    "score_matching": 75,
    "points_forts": [
      "Profil technique solide",
      "Expérience démontrée",
      "Adaptabilité manifeste"
    ],
    "competences_manquantes": [
      "Certification professionnelle à acquérir",
      "Expérience secteur spécifique limitée"
    ],
    "lettre_motivation": "Madame, Monsieur,\n\nTrès intéressé par cette opportunité..."
  }
}
```

## Points-clés à vérifier

✅ **Code HTTP 200** (pas de 500 ou 503)  
✅ **Flag `"fallback": true`** (indique mode dégradé)  
✅ **Message clair** (explique pourquoi ça utilise le fallback)  
✅ **Données complètes** (tous les champs de réponse présents)  
✅ **Serveur toujours actif** (peut recevoir d'autres requêtes)

## Logs du serveur attendus

```
[AI] ========================================
[AI] 🚀 ANALYZE-CV ENDPOINT CALLED
[AI] ========================================
[AI] ✅ File and jobId validated
[AI] ✅ PDF text extracted successfully
[AI] ✅ Job fetched successfully
[AI] ❌ ERROR calling Gemini: [Error] ...
[AI] Using FALLBACK mock analysis due to API error
[AI] ✅ Final response built successfully
[AI] ===== CV ANALYSIS COMPLETED SUCCESSFULLY =====
```

## Différence avant/après

### AVANT (Crash)
```
[AI] ⚠️  No models available, will use MOCK analysis instead
<AUCUN LOG SUPPLÉMENTAIRE>
<PROCESSUS NODE MEURT>
```

### APRÈS (Fallback Graciful)
```
[AI] ⚠️  No models available, will use MOCK analysis instead
[AI] ========================================
[AI] 🚀 ANALYZE-CV ENDPOINT CALLED
[AI] ========================================
[AI] ✅ Mock analysis generated successfully
[AI] 📤 Returning 200 response with mock analysis as fallback
```

## Cas d'erreur à tester

### 1. Sans fichier PDF

```bash
curl -X POST http://localhost:5000/api/ai/analyze-cv \
  -F "jobId=1"
```

**Réponse:** 400 Bad Request (validation préalable)

### 2. Sans jobId

```bash
curl -X POST http://localhost:5000/api/ai/analyze-cv \
  -F "file=@/tmp/test_cv.txt"
```

**Réponse:** 400 Bad Request (validation préalable)

### 3. Avec jobId invalide

```bash
curl -X POST http://localhost:5000/api/ai/analyze-cv \
  -F "file=@/tmp/test_cv.txt" \
  -F "jobId=99999"
```

**Réponse:** 404 Not Found (offre n'existe pas)

### 4. Avec fichier vide

```bash
touch /tmp/empty.txt
curl -X POST http://localhost:5000/api/ai/analyze-cv \
  -F "file=@/tmp/empty.txt" \
  -F "jobId=1"
```

**Réponse:** 200 Fallback (CV vide, mais génère analyse basique)

## Logs complets d'une requête réussie

```
[AI] ========================================
[AI] 🚀 ANALYZE-CV ENDPOINT CALLED
[AI] ========================================
[AI] Method: POST
[AI] Path: /api/ai/analyze-cv
[AI] Content-Type: multipart/form-data; ...
[AI] ✅ req.file EXISTE? true
[AI] ✅ req.body EXISTE? true
[AI] Champs reçus dans req.body: [ 'jobId' ]
[AI] Valeurs req.body: { jobId: '1' }
[AI] ===== STEP 1: PDF TEXT EXTRACTION =====
[AI] Calling PDFParse with buffer length: 125
[AI] ✅ PDF text extracted successfully
[AI] Text length: 102
[AI] ===== STEP 2: FETCHING JOB DETAILS =====
[AI] ✅ Job fetched successfully: { id: '1', title: 'Developer', company: 'Tech Corp' }
[AI] ===== STEP 3: BUILDING JOB DESCRIPTION =====
[AI] ✅ Job description built successfully
[AI] ===== STEP 4: CALLING GEMINI AI =====
[AI] ⚠️  No AI model available, using mock analysis directly
[AI] ===== STEP 7: BUILDING FINAL RESPONSE =====
[AI] ✅ Final response built successfully
[AI] ===== CV ANALYSIS COMPLETED SUCCESSFULLY =====
```
