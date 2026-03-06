import express from 'express';
import multer from 'multer';
import fs from 'fs';

// Configuration Multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF ou texte sont acceptés'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// =====================================================
// VERSION 1 : express.json() AVANT la route Multer
// =====================================================
console.log('🚀 Démarrage VERSION 1 : express.json() AVANT la route Multer');
console.log('❌ Cette version devrait échouer avec "Unexpected token -"');

const app1 = express();
const PORT1 = 5001;

// ⚠️ express.json() AVANT la route multer - C'EST LE PROBLÈME !
app1.use(express.json({ limit: '10mb' }));

// Route qui utilise multer
app1.post('/test-debug', upload.single('file'), (req, res) => {
  console.log('[VERSION 1] 📁 req.file:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'NO FILE');

  console.log('[VERSION 1] 📝 req.body:', req.body);

  res.json({
    success: true,
    message: 'Upload réussi (Version 1)',
    file: req.file ? req.file.originalname : null,
    body: req.body
  });
});

// Gestionnaire d'erreur pour multer
app1.use((error, req, res, next) => {
  console.log('[VERSION 1] ❌ ERREUR MULTER:', error.message);
  res.status(400).json({ error: error.message });
});

// Démarrage du serveur 1
const server1 = app1.listen(PORT1, () => {
  console.log(`✅ Serveur VERSION 1 démarré sur http://localhost:${PORT1}`);
});

// =====================================================
// VERSION 2 : express.json() APRÈS la route Multer
// =====================================================
console.log('\n🚀 Démarrage VERSION 2 : express.json() APRÈS la route Multer');
console.log('✅ Cette version devrait fonctionner correctement');

const app2 = express();
const PORT2 = 5002;

// ✅ express.json() APRÈS la route multer - SOLUTION !
app2.use(express.json({ limit: '10mb' }));

// Route qui utilise multer
app2.post('/test-debug', upload.single('file'), (req, res) => {
  console.log('[VERSION 2] 📁 req.file:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'NO FILE');

  console.log('[VERSION 2] 📝 req.body:', req.body);

  res.json({
    success: true,
    message: 'Upload réussi (Version 2)',
    file: req.file ? req.file.originalname : null,
    body: req.body
  });
});

// Gestionnaire d'erreur pour multer
app2.use((error, req, res, next) => {
  console.log('[VERSION 2] ❌ ERREUR MULTER:', error.message);
  res.status(400).json({ error: error.message });
});

// Démarrage du serveur 2
const server2 = app2.listen(PORT2, () => {
  console.log(`✅ Serveur VERSION 2 démarré sur http://localhost:${PORT2}`);
});

// =====================================================
// SCRIPT DE TEST MANUEL (utilisez curl)
// =====================================================
console.log('\n🧪 TESTS MANUELS AVEC CURL:');
console.log('\n1. Créer un fichier de test:');
console.log('echo "Ceci est un test" > /tmp/test.txt');
console.log('\n2. Tester VERSION 1 (devrait échouer):');
console.log(`curl -F "file=@/tmp/test.txt" -F "jobId=123" http://localhost:${PORT1}/test-debug`);
console.log('\n3. Tester VERSION 2 (devrait réussir):');
console.log(`curl -F "file=@/tmp/test.txt" -F "jobId=123" http://localhost:${PORT2}/test-debug`);

// =====================================================
// SCRIPT DE TEST AUTOMATIQUE (simplifié sans fetch)
// =====================================================
async function runSimpleTests() {
  console.log('\n🧪 TESTS AUTOMATIQUES SIMPLIFIÉS\n');

  // Créer un fichier de test temporaire
  const testContent = 'Ceci est un fichier de test pour démontrer le problème de parsing multipart.';
  const testFilePath = '/tmp/test-upload.txt';
  fs.writeFileSync(testFilePath, testContent);

  console.log('📄 Fichier de test créé:', testFilePath);
  console.log('📏 Taille:', testContent.length, 'caractères');

  console.log('\n🎯 INSTRUCTIONS DE TEST:');
  console.log('Ouvrez un nouveau terminal et exécutez ces commandes:');
  console.log('');
  console.log(`# Test VERSION 1 (devrait échouer):`);
  console.log(`curl -F "file=@/tmp/test-upload.txt" -F "jobId=123" -F "userName=Test User" http://localhost:${PORT1}/test-debug`);
  console.log('');
  console.log(`# Test VERSION 2 (devrait réussir):`);
  console.log(`curl -F "file=@/tmp/test-upload.txt" -F "jobId=123" -F "userName=Test User" http://localhost:${PORT2}/test-debug`);

  console.log('\n🔄 Serveurs actifs pour 60 secondes...');
  console.log('Appuyez Ctrl+C pour arrêter');

  // Attendre 60 secondes puis nettoyer
  setTimeout(() => {
    console.log('\n🧹 Nettoyage...');
    fs.unlinkSync(testFilePath);
    server1.close();
    server2.close();
    console.log('✅ Serveurs arrêtés');
  }, 60000);
}

// Lancer les tests après un court délai
setTimeout(runSimpleTests, 1000);

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt des serveurs...');
  try {
    if (fs.existsSync('/tmp/test-upload.txt')) {
      fs.unlinkSync('/tmp/test-upload.txt');
    }
  } catch (e) {
    // Ignore
  }
  server1.close();
  server2.close();
  process.exit(0);
});