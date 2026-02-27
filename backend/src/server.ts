import 'dotenv/config';
import app from './app.js';

// Temporary forced route to bypass router/import issues
// This will be removed after debugging
app.post('/api/auth/register-admin', (req, res) => {
  console.log('⚠️  FORCED route /api/auth/register-admin invoked');
  res.json({ success: true, message: 'Forced route active (debug)', timestamp: new Date().toISOString() });
});
import { initializeDatabase } from './config/database.js';
import { initializeMailTransporter } from './config/mail.js';

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Démarrage du serveur
 */
async function startServer() {
  try {
    // Connexion à la base de données
    console.log('🔌 Tentative de connexion à la base de données...');
    await initializeDatabase();

    // Initialisation du système de mail
    console.log('📧 Initialisation du système de mail...');
    initializeMailTransporter();

    // Démarrage du serveur Express
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  🚀 Serveur Express démarré avec succès                ║');
      console.log(`║  🌐 URL: https://emploiplus-group.com:${PORT}                  ║`);
      console.log(`║  📝 Environnement: ${NODE_ENV.padEnd(37)}║`);
      console.log('║  ✅ Base de données: Connectée                         ║');
      console.log('║  ✅ Système de mail: Initialisé                        ║');
      console.log('║  🏥 Health Check: GET /api/health                      ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
    });

    // Dump Express internal stack for debugging (temporary)
    try {
      const dumpStack = () => {
        try {
          const stack = (app as any)._router?.stack || [];
          console.log('--- Express internal router stack (debug) ---');
          stack.forEach((layer: any, idx: number) => {
            try {
              const name = layer.name || '<anonymous>';
              const hasRoute = !!layer.route;
              const regexp = layer.regexp && layer.regexp.source ? layer.regexp.source : null;
              const handleStackLen = layer.handle && layer.handle.stack ? layer.handle.stack.length : 0;
              console.log(`LAYER[${idx}] name=${name} hasRoute=${hasRoute} regexp=${regexp} handleStackLen=${handleStackLen}`);

              if (layer.route) {
                const methods = Object.keys(layer.route.methods || {}).map((m) => m.toUpperCase()).join(',');
                console.log(`  -> route: ${methods} ${layer.route.path}`);
              }

              if (layer.handle && layer.handle.stack && Array.isArray(layer.handle.stack)) {
                layer.handle.stack.forEach((nested: any, nidx: number) => {
                  const nHasRoute = !!nested.route;
                  const nRegexp = nested.regexp && nested.regexp.source ? nested.regexp.source : null;
                  console.log(`    NESTED[${idx}.${nidx}] name=${nested.name || '<anon>'} hasRoute=${nHasRoute} regexp=${nRegexp}`);
                  if (nested.route) {
                    const methods = Object.keys(nested.route.methods || {}).map((m) => m.toUpperCase()).join(',');
                    console.log(`      -> nested route: ${methods} ${nested.route.path}`);
                  }
                });
              }
            } catch (inner) {
              console.error('Error inspecting layer', inner);
            }
          });
          console.log('--- End internal stack dump ---');
        } catch (err) {
          console.error('Error while dumping internal stack:', err);
        }
      };

      dumpStack();
    } catch (err) {
      console.error('Failed to dump internal stack on startup:', err);
    }

    // Gestion des arrêts gracieux
    process.on('SIGTERM', () => {
      console.log('⚠️  Signal SIGTERM reçu - Arrêt du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠️  Signal SIGINT reçu - Arrêt du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Lancer le serveur
startServer();
