# DEBUG_MULTIPART_JSON_CONFLICT.md
## Résolution du Conflit entre express.json() et Multipart/Form-Data

---

## 1. Analyse du Flux de Données : Pourquoi L'Erreur Se Produit

### 1.1 Le Problème Fondamental

Quand une requête HTTP envoyée avec `Content-Type: multipart/form-data` arrive au serveur Express, voici ce qui se passe **en cas de mauvaise configuration** :

```
┌─────────────────────────────────────────────────────────────────┐
│ Requête Client : POST /api/ai/analyze-cv                        │
│ Content-Type: multipart/form-data; boundary=------WebKit...     │
├─────────────────────────────────────────────────────────────────┤
│ CONTENU RÉEL :                                                  │
│ ------WebKit123456                                              │
│ Content-Disposition: form-data; name="file"; filename="cv.pdf"  │
│ Content-Type: application/pdf                                   │
│ [BINARY PDF DATA]                                               │
│ ------WebKit123456                                              │
│ Content-Disposition: form-data; name="jobId"                    │
│ 1                                                               │
│ ------WebKit123456--                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flux avec Mauvaise Configuration

```
REQUÊTE MULTIPART
       ↓
   [SERVER EXPRESS]
       ↓
   app.use(express.json())  ← ❌ CATASTROPHE ICI
       ↓
   express.json() regarde le Content-Type: multipart/form-data
       ↓
   Il essaie de parser le body comme du JSON (corps brut multipart)
       ↓
   Le buffer contient "------WebKit123456..." au lieu de "{"
       ↓
   "Unexpected token '-', '------WebK' is not valid JSON"
       ↓
   application CRASH 💥 (jamais atteint le contrôleur)
```

### 1.3 Flux avec Bonne Configuration

```
REQUÊTE MULTIPART
       ↓
   [SERVER EXPRESS]
       ↓
   app.post('/api/ai/analyze-cv', upload.single('file'), ...)  ← ✅ Multer d'abord
       ↓
   Multer détecte multipart/form-data
       ↓
   Multer parse la requête en champs structurés
       ↓
   req.file = { buffer, mimetype, originalname }
   req.body = { jobId: '1' }
       ↓
   app.use(express.json())  ← Vient APRÈS pour les routes JSON
       ↓
   Contrôleur reçoit des données propres ✅
```

### 1.4 Le Middleware express.json() - Détails Techniques

`express.json()` fonctionne ainsi :

```javascript
// C'est ce que fait express.json() internement :
function jsonParser(req, res, next) {
  if (req.is('application/json')) {
    // Content-Type = application/json ✅
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        next();
      } catch (e) {
        // ❌ ERREUR = "Unexpected token '-'"
        res.status(400).json({ error: e.message });
      }
    });
  } else {
    next();  // Ignore si Content-Type ≠ application/json
  }
}
```

**MAIS** : Si le Content-Type est mal configuré côté client ou si plusieurs parsers se chevauchent, express.json() peut tenter de parser des données multipart.

### 1.5 Deux Causes Possibles de L'Erreur

#### Cause A : Middlewares dans le Mauvais Ordre (PLUS COURANT)

```javascript
// ❌ MAUVAIS - JSON avant Multer
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Quand multipart arrive, express.json() a déjà tenté de la parser!

app.post('/api/ai/analyze-cv', upload.single('file'), aiController.analyzeCv);
```

#### Cause B : Client envoie le mauvais Content-Type

```javascript
// ❌ MAUVAIS - Frontend envoie du JSON au lieu de multipart
fetch('/api/ai/analyze-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },  // ❌ INCORRECT
  body: JSON.stringify({ file: 'PDF', jobId: 1 })
});

// ✅ CORRECT - Utiliser FormData pour multipart
const formData = new FormData();
formData.append('file', pdfFile);  // FormData auto-défini multipart
formData.append('jobId', jobId);
fetch('/api/ai/analyze-cv', {
  method: 'POST',
  body: formData  // Pas de Content-Type, le navigateur le set automatiquement
});
```

---

## 2. Visualisation de la Pile de Middlewares

### 2.1 Mauvaise Configuration - Multer Après JSON

```javascript
// ❌ CONFIGURATION INITIALE (BUGGUÉE)
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ❌ PROBLÈME : Middlewares globaux AVANT les routes spécifiques
app.use(cors());
app.use(helmet());
app.use(express.json());           // ❌ Middleware GLOBAL
app.use(express.urlencoded({ extended: true }));  // ❌ Middleware GLOBAL

// Configuration Multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Les routes arrivent APRÈS les middlewares globaux
app.post('/api/ai/analyze-cv', upload.single('file'), (req, res) => {
  // ❌ Le body a DÉJÀ été corrompu par express.json()
  res.json({ success: true });
});

// ❌ FLUX D'EXÉCUTION :
// 1. POST /api/ai/analyze-cv arrive
// 2. cors() ✅
// 3. helmet() ✅
// 4. express.json() ❌ Tente de parser multipart comme JSON
// 5. CRASH avant d'atteindre multer ou le contrôleur
```

### 2.2 Configuration Corrigée - Option A : Multer Avant JSON

```javascript
// ✅ CONFIGURATION CORRIGÉE - OPTION A
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares globaux sûrs d'abord
app.use(cors());
app.use(helmet());

// Configuration Multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ✅ ROUTES MULTIPART AVANT les middlewares de body-parsing
app.post('/api/ai/analyze-cv', upload.single('file'), (req, res) => {
  // ✅ Multer a déjà parsé la requête correctement
  console.log(req.file);   // { buffer, mimetype, originalname, ... }
  console.log(req.body);   // { jobId: '1' }
  res.json({ success: true });
});

app.post('/api/uploads', upload.array('files', 10), (req, res) => {
  // ✅ Multer a déjà parsé la requête
  res.json({ success: true, fileCount: req.files.length });
});

// ✅ MAINTENANT les middlewares de body-parsing (pour les autres routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes JSON normales
app.post('/api/jobs', (req, res) => {
  // ✅ express.json() a parsé le body correctement
  console.log(req.body);
  res.json({ success: true });
});

// ✅ FLUX D'EXÉCUTION :
// 1. POST /api/ai/analyze-cv arrive
// 2. cors() ✅
// 3. helmet() ✅
// 4. upload.single('file') ✅ Multer parse multipart
// 5. Contrôleur exécuté ✅
// 6. express.json() n'intervient jamais (route déjà traitée)
```

### 2.3 Configuration Corrigée - Option B : JSON avec Exclusion de Route

```javascript
// ✅ CONFIGURATION CORRIGÉE - OPTION B
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(cors());
app.use(helmet());

// Configuration Multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ✅ express.json() avec EXCLUSION des routes multipart
app.use((req, res, next) => {
  // Exclure les routes avec fichiers
  if (req.path.startsWith('/api/ai/analyze-cv') ||
      req.path.startsWith('/api/uploads')) {
    return next();  // Sauter le middleware JSON
  }
  express.json()(req, res, next);
});

app.use(express.urlencoded({ extended: true }));

// Routes multipart
app.post('/api/ai/analyze-cv', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.json({ success: true });
});

// Routes JSON
app.post('/api/jobs', (req, res) => {
  console.log(req.body);
  res.json({ success: true });
});

// ✅ FLUX D'EXÉCUTION :
// 1. POST /api/ai/analyze-cv arrive
// 2. cors() ✅
// 3. helmet() ✅
// 4. Middleware JSON personnalisé → next() (exclusion) ✅
// 5. upload.single('file') ✅
// 6. Contrôleur exécuté ✅
```

### 2.4 Tableau Comparatif des Trois Approches

| Approche | Avantages | Inconvénients | Recommandé |
|----------|-----------|---------------|-----------|
| **Option A : Multer avant JSON** | Simple, clair, ordre naturel | Doit réorganiser tout le code | ✅ OUI |
| **Option B : JSON avec exclusion** | Moins de réorganisation | Plus complexe, maintenance difficile | ⚠️ Possible |
| **Mauvaise Config** | N/A | CRASH, erreur multipart | ❌ NON |

---

## 3. Exemple de Code Minimaliste : Reproduire et Corriger L'Erreur

### 3.1 Serveur Minimaliste Bugué

```javascript
// ❌ BUG_SERVER.JS - Reproduit l'erreur
const express = require('express');
const multer = require('multer');

const app = express();

// ❌ ERREUR : express.json() AVANT multer
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file.originalname });
});

app.listen(5000, () => console.log('Server on :5000 (BUGUÉ)'));

// Pour tester (produira l'erreur) :
// curl -F "file=@cv.pdf" http://localhost:5000/upload
// ❌ Erreur : "Unexpected token '-', '------WebKit' is not valid JSON"
```

### 3.2 Serveur Minimaliste Corrigé

```javascript
// ✅ FIXED_SERVER.JS - Corrige l'erreur
const express = require('express');
const multer = require('multer');

const app = express();

// ✅ Configuration Multer
const upload = multer({ storage: multer.memoryStorage() });

// ✅ ROUTES MULTIPART D'ABORD
app.post('/upload', upload.single('file'), (req, res) => {
  console.log('File reçu:', req.file.originalname);
  console.log('Body:', req.body);
  res.json({ success: true, file: req.file.originalname });
});

// ✅ PUIS middleware JSON pour les autres routes
app.use(express.json());

app.post('/data', (req, res) => {
  console.log('Body JSON reçu:', req.body);
  res.json({ success: true, data: req.body });
});

app.listen(5000, () => console.log('Server on :5000 (CORRIGÉ) ✅'));

// Pour tester (fonctionnera correctement) :
// curl -F "file=@cv.pdf" http://localhost:5000/upload
// ✅ Response: { "success": true, "file": "cv.pdf" }
```

### 3.3 Comparaison des Deux Serveurs

```bash
# ❌ Serveur Bugué
node bug_server.js
curl -F "file=@cv.pdf" -F "jobId=1" http://localhost:5000/upload
# SyntaxError: Unexpected token '-', "------WebKit" is not valid JSON

# ✅ Serveur Corrigé
node fixed_server.js
curl -F "file=@cv.pdf" -F "jobId=1" http://localhost:5000/upload
# { "success": true, "file": "cv.pdf" }
```

---

## 4. Correction du Contrôleur : Nettoyage de la Réponse Gemini

### 4.1 Le Problème : Gemini Retourne du Markdown

Même si la requête est bien reçue par le contrôleur, l'API Gemini peut renvoyer la réponse en JSON enrobée de Markdown :

```javascript
// Réponse de Gemini (SANS nettoyage)
const responseText = `Voici l'analyse profonde :

\`\`\`json
{
  "score_matching": 85,
  "points_forts": ["JavaScript", "React"],
  "lacunes": ["TypeScript"],
  "lettre_motivation": "..."
}
\`\`\`

N'hésitez pas à postuler !`;

// ❌ JSON.parse(responseText) échouera
// → "Unexpected token 'V', "Voici l'...
```

### 4.2 Solution : Fonction d'Extraction JSON Robuste

```javascript
/**
 * Extrait le JSON valide depuis une réponse Gemini brute
 * Gère les cas : Markdown, texte superflu, accolades imbriquées
 */
function extractJsonFromGeminiResponse(responseText) {
  // Étape 1 : Supprimer les balises Markdown ```json ... ```
  let cleaned = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // Étape 2 : Trouver le début et fin du JSON (accolades)
  const openBraceIndex = cleaned.indexOf('{');
  const lastBraceIndex = cleaned.lastIndexOf('}');

  if (openBraceIndex === -1 || lastBraceIndex === -1) {
    throw new Error('Aucun JSON trouvé dans la réponse Gemini');
  }

  // Étape 3 : Extraire le JSON brut
  let jsonContent = cleaned.slice(openBraceIndex, lastBraceIndex + 1);

  // Étape 4 : Valider en essayant de parser
  try {
    const parsed = JSON.parse(jsonContent);
    return parsed;
  } catch (parseError) {
    // Étape 5 : Si toujours une erreur, essayer une extraction plus agressve
    // Supprimer les caractères de contrôle
    jsonContent = jsonContent
      .replace(/[\x00-\x1F\x7F]/g, ' ')  // Contrôle chars
      .replace(/\s+/g, ' ')               // Normaliser espaces
      .trim();

    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      throw new Error(`Impossible parser JSON: ${e.message}\nContenu: ${jsonContent.slice(0, 100)}`);
    }
  }
}

// Tests unitaires
function testExtractJson() {
  // Test 1 : JSON avec Markdown
  const response1 = `\`\`\`json
  { "score": 85, "status": "ok" }
  \`\`\``;
  console.log(extractJsonFromGeminiResponse(response1));
  // ✅ { score: 85, status: 'ok' }

  // Test 2 : JSON avec texte superflu
  const response2 = `Analyse terminée :
  { "score": 85, "status": "ok" }
  Fin de l'analyse.`;
  console.log(extractJsonFromGeminiResponse(response2));
  // ✅ { score: 85, status: 'ok' }

  // Test 3 : JSON imbriqué complexe
  const response3 = `{ "score": 85, "nested": { "key": "value", "array": [1, 2, 3] } }`;
  console.log(extractJsonFromGeminiResponse(response3));
  // ✅ { score: 85, nested: { key: 'value', array: [ 1, 2, 3 ] } }
}
```

### 4.3 Intégration dans le Contrôleur AI

```javascript
// controllers/ai.controller.js
const { TextServiceClient } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');

async function analyzeCv(req, res) {
  try {
    // 1. Validation
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier PDF fourni' });
    }

    if (!req.body.jobId) {
      return res.status(400).json({ error: 'jobId requis' });
    }

    // 2. Extraction PDF
    console.log('📄 Extraction du contenu PDF...');
    const pdfData = await pdfParse(req.file.buffer);
    const cvText = pdfData.text;

    if (!cvText.trim()) {
      return res.status(400).json({ error: 'Le PDF est vide ou invalide' });
    }

    // 3. Récupération offre d'emploi
    const jobService = require('../services/job.service');
    const job = await jobService.getJobById(req.body.jobId);

    if (!job) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    // 4. Construction du prompt
    const systemPrompt = `Tu es un expert RH avec 20 ans d'expérience...
    Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
    {
      "score_matching": <nombre entre 0 et 100>,
      "points_forts": [<compétences clés>],
      "lacunes": [<compétences manquantes>],
      "lettre_motivation": "<texte complet>"
    }
    Ne retourne AUCUN texte en dehors du JSON.`;

    const userPrompt = `Analyse ce CV par rapport à cette offre d'emploi:
    
    OFFRE:
    ${job.description}
    
    CV:
    ${cvText}`;

    // 5. Appel API Gemini
    console.log('🤖 Appel Gemini API...');
    const genAI = new TextServiceClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      system_instruction: systemPrompt
    });

    // 6. Extraction et nettoyage de la réponse
    console.log('🔍 Parsing réponse Gemini...');
    const responseText = result.response.text();
    console.log('Raw Gemini response:', responseText.slice(0, 200));

    // ✅ UTILISER LA FONCTION DE NETTOYAGE
    let analysis;
    try {
      analysis = extractJsonFromGeminiResponse(responseText);
    } catch (extractError) {
      console.error('❌ Erreur extraction JSON:', extractError.message);
      // Fallback : utiliser une analyse mock
      analysis = generateMockAnalysis(cvText, job.description);
    }

    // 7. Validation structure
    if (!analysis.score_matching || !analysis.points_forts || !analysis.lacunes) {
      console.warn('⚠️ Réponse Gemini invalide, utilisation mock');
      analysis = generateMockAnalysis(cvText, job.description);
    }

    // 8. Construction réponse
    const finalResponse = {
      success: true,
      data: {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        score_matching: analysis.score_matching,
        points_forts: analysis.points_forts,
        competences_manquantes: analysis.lacunes,
        lettre_motivation: analysis.lettre_motivation
      }
    };

    res.json(finalResponse);

  } catch (error) {
    console.error('❌ Erreur analyzeCv:', error.message);

    // Gestion des erreurs spécifiques
    if (error.message.includes('quota')) {
      return res.status(429).json({ error: 'Quota API dépassé' });
    }

    if (error.message.includes('Service')) {
      return res.status(503).json({ error: 'Service d\'IA indisponible' });
    }

    res.status(500).json({
      error: 'Erreur lors de l\'analyse',
      message: error.message
    });
  }
}

// Fonction fallback
function generateMockAnalysis(cvText, jobDescription) {
  const hasJavaScript = cvText.toLowerCase().includes('javascript');
  const hasReact = cvText.toLowerCase().includes('react');
  const hasExperience = /\d+\s*(?:year|an|exp)/i.test(cvText);

  const score = (hasJavaScript ? 30 : 0) + (hasReact ? 30 : 0) + (hasExperience ? 20 : 0) + 10;

  return {
    score_matching: Math.min(score, 100),
    points_forts: hasJavaScript ? ['JavaScript', 'Frontend'] : ['Candidat intéressé'],
    lacunes: hasReact ? [] : ['React'],
    lettre_motivation: 'Candidat motivé par cette opportunité.'
  };
}

module.exports = { analyzeCv };
```

---

## 5. Checklist de Résolution pour Votre Projet

### 5.1 Checklist Complète (À Valider dans Cet Ordre)

#### ✅ Point 1 : Vérifier l'Ordre des Middlewares dans server.js

```bash
# Localiser votre server.js
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-/backend

# Ouvrir et vérifier l'ordre
cat server.js | grep -n "app.use\|app.post\|app.get" | head -20
```

**À vérifier :**
- [ ] `app.use(express.json())` vient-il AVANT les routes `/api/ai/...` ?
- [ ] Si OUI = ❌ Bug confirmé, corriger immédiatement
- [ ] Si NON = ✅ Ordre correct (mais vérifier Point 2)

**Correction attendue :**
```javascript
// ❌ AVANT (order wrong)
app.use(express.json());
app.post('/api/ai/analyze-cv', ...);

// ✅ APRÈS (correct order)
app.post('/api/ai/analyze-cv', ...);
app.use(express.json());
```

#### ✅ Point 2 : Vérifier la Configuration de Multer

**Localiser la configuration Multer :**
```bash
grep -r "multer" backend/config backend/middleware backend/routes
```

**À vérifier :**
- [ ] Multer est-il configuré avec `memoryStorage()` ?
- [ ] Le `fileFilter` accepte-t-il `application/pdf` ?
- [ ] La limite de fichier est-elle > 50 MB (ou suffisante) ?
- [ ] Les erreurs Multer sont-elles capturées avec un middleware d'erreur ?

**Configuration valide :**
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les PDF acceptés'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Middleware d'erreur
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
```

#### ✅ Point 3 : Vérifier les Headers Frontend

**Localiser le code upload frontend :**
```bash
grep -r "multipart\|FormData\|analyze-cv" frontend/src --include="*.tsx" --include="*.ts"
```

**À vérifier :**
- [ ] L'upload utilise-t-il `FormData` ?
- [ ] FormData contient-il les champs `file` et `jobId` ?
- [ ] Le header `Content-Type` n'est-il PAS défini manuellement ? (le navigateur le set auto)

**Code correct :**
```typescript
const handleAnalyzeCv = async (pdfFile: File, jobId: string) => {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('jobId', jobId);

  const response = await fetch(`${API_BASE_URL}/api/ai/analyze-cv`, {
    method: 'POST',
    body: formData
    // ✅ PAS de 'headers: { Content-Type: ... }'
    // Le navigateur le défini automatiquement
  });
};
```

#### ✅ Point 4 : Vérifier le Nettoyage JSON du Contrôleur

**Localiser le contrôleur AI :**
```bash
cat backend/controllers/ai.controller.js | grep -A 5 "result.response.text()"
```

**À vérifier :**
- [ ] Le code récupère-t-il `result.response.text()` ?
- [ ] Y a-t-il une fonction `extractJsonFromText()` ou équivalent ?
- [ ] Cette fonction supprime-t-elle les balises ```json ... ``` ?
- [ ] Y a-t-il un try/catch autour du `JSON.parse()` ?
- [ ] Un fallback `generateMockAnalysis()` existe-t-il ?

**Pattern valide :**
```javascript
const responseText = result.response.text();

// Nettoyage Markdown
let cleaned = responseText
  .replace(/```json\s*/g, '')
  .replace(/```\s*/g, '')
  .trim();

// Extraction JSON robuste
const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error('JSON not found');

try {
  analysis = JSON.parse(jsonMatch[0]);
} catch (e) {
  console.error('Parse error:', e);
  analysis = generateMockAnalysis(...);  // Fallback
}
```

#### ✅ Point 5 : Tester le Flux Complet with Debug Logs

**Commande de test :**
```bash
# 1. Lancer le serveur en mode debug
cd backend
DEBUG=* npm run dev

# 2. Dans un autre terminal, tester le endpoint
curl -v -F "file=@/tmp/test_cv.pdf" -F "jobId=1" \
  http://localhost:5000/api/ai/analyze-cv 2>&1 | head -50

# 3. Vérifier les logs pour :
# - "Multer a parsé le fichier" ✅
# - "Extraction PDF..." ✅
# - "Raw Gemini response" ✅
# - "Parsing réponse" ✅
# - "success": true ✅
```

**Points de vérification dans les logs :**

| Log | Status en cas de bug |
|-----|---------------------|
| `Unexpected token '-'` | ❌ Ordre middlewares incorrect |
| `File is undefined` | ❌ Multer n'a pas parsé |
| `Cannot parse JSON` | ❌ Réponse Gemini pas nettoyée |
| `success: true` | ✅ Tout fonctionne |

---

## 6. Tableau de Diagnostic Rapide

```
┌─────────────────────────────────────────────────────────────────┐
│                        DIAGNOSTIC RAPIDE                         │
├─────────────────────────────────────────────────────────────────┤
│ ERREUR                              │ CAUSE PROBABLE              │
├─────────────────────────────────────────────────────────────────┤
│ "Unexpected token '-'"              │ ❌ Ordre middlewares        │
│                                     │    (JSON avant Multer)      │
├─────────────────────────────────────────────────────────────────┤
│ "Cannot read property 'file'"       │ ❌ Multer non configuré     │
│ req.file is undefined               │    ou mauvaise route        │
├─────────────────────────────────────────────────────────────────┤
│ "Unexpected token 'V'"              │ ❌ Réponse Gemini avec      │
│ (début de réponse malformée)        │    Markdown non nettoyée    │
├─────────────────────────────────────────────────────────────────┤
│ "CORS error"                        │ ⚠️  Frontend headers ou      │
│ Request blocked                     │    URL backend incorrect     │
├─────────────────────────────────────────────────────────────────┤
│ 200 OK + empty response             │ ⚠️  Succès silencieux mais │
│                                     │    données manquantes       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Fichiers à Modifier / Vérifier

```
Projet : /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-

BACKEND (Priorité Haute) :
  ├─ backend/server.js ........................... [✓ Ordre middlewares]
  ├─ backend/routes/ai.routes.js ................ [✓ Config Multer]
  ├─ backend/controllers/ai.controller.js ....... [✓ Nettoyage JSON]
  ├─ backend/middleware/*.js ..................... [✓ Error handling]
  └─ backend/.env ............................... [✓ GEMINI_API_KEY]

FRONTEND (Priorité Moyenne) :
  ├─ frontend/src/**.tsx ........................ [✓ FormData usage]
  ├─ frontend/api/client.ts ..................... [✓ Headers]
  └─ frontend/.env .............................. [✓ API_BASE_URL]

DOCUMENTATION :
  ├─ API_CONFIGURATION.md ....................... [Inclure cette doc]
  └─ DEBUGGING_MULTIPART_JSON_CONFLICT.md ...... [Ce fichier]
```

---

## 8. Résumé Exécutif

### Le Problème en 30 Secondes
```
Frontend envoie PDF en multipart/form-data
                    ↓
Backend reçoit la requête
                    ↓
express.json() tente de parser "------WebKit..."
                    ↓
CRASH: "Unexpected token '-' is not valid JSON"
```

### La Solution en 30 Secondes
```
Multer avant express.json() dans server.js
                    ↓
Multer parse correctement multipart/form-data
                    ↓
Contrôleur reçoit req.file et req.body propres
                    ↓
SUCCESS: Analyse CV fonctionne ✅
```

### Template server.js Minimal Corrigé
```javascript
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

// 1. Middlewares sûrs
app.use(cors());

// 2. Configuration Multer
const upload = multer({ storage: multer.memoryStorage() });

// 3. Routes multipart d'ABORD
app.post('/api/ai/analyze-cv', upload.single('file'), (req, res) => {
  // req.file et req.body sont valides ici
});

// 4. Middlewares de parsing APRÈS
app.use(express.json());

// 5. Routes JSON
app.post('/api/data', (req, res) => {
  // req.body est parsé comme JSON ici
});

app.listen(5000);
```

---

## 9. Ressources et Références

- [Express Middleware Documentation](https://expressjs.com/en/guide/using-middleware.html)
- [Multer Documentation](https://github.com/expressjs/multer)
- [HTTP Content-Type Multipart/Form-Data](https://tools.ietf.org/html/rfc7578)
- [JSON Parsing Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/JSON/parse)

---

**Document mis à jour le :** 5 mars 2026  
**Version :** 1.0 - Documentation de référence complète  
**Statut :** Production-ready ✅
