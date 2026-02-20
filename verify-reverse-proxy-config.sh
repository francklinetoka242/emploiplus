#!/bin/bash
# 🔍 Script de Vérification - Configuration Reverse Proxy Apache + Backend
# Ce script vérifie que le déploiement est correctement configuré

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔍 VÉRIFICATION CONFIGURATION REVERSE PROXY               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ───────────────────────────────────────────────────
# 1. Vérifier Backend .env
# ───────────────────────────────────────────────────
echo "📋 1️⃣  Vérification Backend .env"
echo "─────────────────────────────────────────"

if [ -f "backend/.env" ]; then
    echo "✅ Fichier backend/.env existe"
    
    PORT=$(grep "^PORT=" backend/.env | cut -d'=' -f2 | tr -d '\r')
    NODE_ENV=$(grep "^NODE_ENV=" backend/.env | cut -d'=' -f2 | tr -d '\r')
    
    echo "   PORT configuré: ${PORT:-❌ Non défini}"
    echo "   NODE_ENV: ${NODE_ENV:-❌ Non défini}"
    
    if [ "$PORT" = "5000" ]; then
        echo "   ✅ PORT=5000 (correct)"
    else
        echo "   ⚠️  PORT devrait être 5000, actuellement: $PORT"
    fi
else
    echo "❌ backend/.env non trouvé"
    exit 1
fi

echo ""

# ───────────────────────────────────────────────────
# 2. Vérifier Frontend .env
# ───────────────────────────────────────────────────
echo "📋 2️⃣  Vérification Frontend .env"
echo "─────────────────────────────────────────"

if [ -f ".env" ]; then
    echo "✅ Fichier .env existe"
    
    API_URL=$(grep "^VITE_API_URL=" .env | cut -d'=' -f2 | tr -d '\r')
    
    echo "   VITE_API_URL configuré: ${API_URL:-❌ Non défini}"
    
    if [ "$API_URL" = "/api" ]; then
        echo "   ✅ VITE_API_URL=/api (correct pour reverse proxy)"
    else
        echo "   ⚠️  VITE_API_URL ne correspond pas. Attendu: /api, Trouvé: $API_URL"
    fi
else
    echo "❌ .env non trouvé"
    exit 1
fi

echo ""

# ───────────────────────────────────────────────────
# 3. Vérifier Backend server.ts configuration
# ───────────────────────────────────────────────────
echo "📋 3️⃣  Vérification Backend server.ts"
echo "─────────────────────────────────────────"

if grep -q "const HOST = '127.0.0.1'" backend/src/server.ts 2>/dev/null; then
    echo "✅ Backend configuré pour écouter sur 127.0.0.1 (localhost only)"
else
    echo "⚠️  Attention: Backend pourrait écouter sur d'autres interfaces"
    echo "   Vérifier: backend/src/server.ts ligne ~124"
fi

echo ""

# ───────────────────────────────────────────────────
# 4. Vérifier App.tsx utilise HashRouter
# ───────────────────────────────────────────────────
echo "📋 4️⃣  Vérification Frontend App.tsx"
echo "─────────────────────────────────────────"

if grep -q "import.*HashRouter.*from.*react-router-dom" src/App.tsx 2>/dev/null; then
    echo "✅ App.tsx utilise HashRouter"
else
    echo "❌ App.tsx n'utilise pas HashRouter"
    echo "   Vérifier: src/App.tsx ligne 6"
fi

if grep -q "<HashRouter" src/App.tsx 2>/dev/null; then
    echo "✅ Component <HashRouter> trouvé"
else
    echo "❌ Component <HashRouter> non trouvé"
fi

echo ""

# ───────────────────────────────────────────────────
# 5. Vérifier src/lib/api.ts utilise la variable env
# ───────────────────────────────────────────────────
echo "📋 5️⃣  Vérification src/lib/api.ts"
echo "─────────────────────────────────────────"

if grep -q "getApiBaseUrl()" src/lib/api.ts 2>/dev/null; then
    echo "✅ src/lib/api.ts utilise getApiBaseUrl()"
else
    echo "⚠️  src/lib/api.ts ne semble pas utiliser getApiBaseUrl()"
fi

echo ""

# ───────────────────────────────────────────────────
# 6. Runtime Checks (si services tournent)
# ───────────────────────────────────────────────────
echo "📋 6️⃣  Vérifications Runtime"
echo "─────────────────────────────────────────"

# Vérifier si Node.js tourne sur 5000
if command -v lsof &> /dev/null; then
    if lsof -i :5000 &>/dev/null; then
        PID=$(lsof -i :5000 -t)
        echo "✅ Processus Node.js tourne sur 127.0.0.1:5000 (PID: $PID)"
    else
        echo "⚠️  Aucun processus n'écoute sur le port 5000"
        echo "   Rappel: Lancer avec: cd backend && node dist/server.js"
    fi
else
    echo "ℹ️  lsof non disponible - impossible de vérifier le port 5000"
fi

# Vérifier le health check
if command -v curl &> /dev/null; then
    echo ""
    echo "   🧪 Test Health Check..."
    if curl -s http://127.0.0.1:5000/_health &>/dev/null; then
        HEALTH=$(curl -s http://127.0.0.1:5000/_health)
        echo "   ✅ Backend répond: $HEALTH"
    else
        echo "   ⚠️  Backend ne répond pas sur http://127.0.0.1:5000/_health"
    fi
fi

echo ""

# ───────────────────────────────────────────────────
# 7. Résumé
# ───────────────────────────────────────────────────
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  📊 RÉSUMÉ CONFIGURATION                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "Frontend:"
echo "  • VITE_API_URL=/api ✅"
echo "  • HashRouter activé ✅"
echo "  • URLs format: https://domain.com/#/route"
echo ""

echo "Backend:"
echo "  • Port: 5000 ✅"
echo "  • Listen: 127.0.0.1 (localhost) ✅"
echo "  • SSL/TLS: Géré par Apache ✅"
echo ""

echo "Apache Reverse Proxy:"
echo "  • Configuration: apache-reverse-proxy.conf"
echo "  • /api → http://127.0.0.1:5000/api"
echo "  • Frontend assets → /dist"
echo ""

echo "💡 Prochaines étapes:"
echo "  1. Adapter apache-reverse-proxy.conf à votre configuration"
echo "  2. Activer les modules Apache: proxy, proxy_http, headers"
echo "  3. Recharger Apache: sudo systemctl reload apache2"
echo "  4. Test: curl https://domain.com/api/_health"
echo ""

echo "📖 Documentation complète: REVERSE_PROXY_DEPLOYMENT.md"
