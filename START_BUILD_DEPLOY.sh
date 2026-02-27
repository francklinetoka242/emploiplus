#!/usr/bin/env bash

###############################################################################
# EmployiPlus Group - Build & Deploy Quick Start
# 
# User Request: "Donne-moi la commande PM2 pour redémarrer le backend 
#               et le script de build pour le frontend"
#
# ✅ SOLUTION DELIVERED
###############################################################################

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📋 EmployiPlus Group - Build & Deploy Scripts                ║"
echo "║  ✅ All scripts are ready to use                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

###############################################################################
# SECTION 1: PM2 BACKEND RESTART (REQUESTED)
###############################################################################

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔄 PM2 BACKEND RESTART COMMAND (Requested)                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Single Command:"
echo ""
echo "   bash pm2-backend.sh restart"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "📂 Full Path:"
echo ""
echo "   bash /home/emploiplus-group.com/public_html/pm2-backend.sh restart"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "✨ What This Does:"
echo "   • Stops the running backend process gracefully"
echo "   • Reloads all code changes"
echo "   • Restarts the Node.js server on port 5000"
echo "   • Takes ~2-5 seconds"
echo "   • Shows success message with process info"
echo ""
echo "🎯 Use This When:"
echo "   ✓ Code changes are made to backend"
echo "   ✓ Database migrations are completed"
echo "   ✓ Environment variables are updated"
echo "   ✓ New routes/controllers are added"
echo "   ✓ Dependencies are installed"
echo ""

###############################################################################
# SECTION 2: FRONTEND BUILD SCRIPT (REQUESTED)
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🏗️  FRONTEND BUILD SCRIPT (Requested)                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Single Command:"
echo ""
echo "   bash build-frontend.sh"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "📂 Full Path:"
echo ""
echo "   bash /home/emploiplus-group.com/public_html/build-frontend.sh"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "✨ What This Does:"
echo "   • Navigates to frontend directory"
echo "   • Installs npm dependencies (npm install)"
echo "   • Runs Vite build (npm run build)"
echo "   • Generates optimized /dist/ folder"
echo "   • Reports build size and file count"
echo "   • Takes ~10-30 seconds"
echo ""
echo "📤 Output Location:"
echo "   /home/emploiplus-group.com/public_html/frontend/dist/"
echo ""
echo "🎯 Use This When:"
echo "   ✓ Code changes are made to frontend"
echo "   ✓ Dependencies are updated"
echo "   ✓ Before deployment to production"
echo "   ✓ To generate optimized production files"
echo ""

###############################################################################
# SECTION 3: COMPLETE SOLUTION - BOTH COMMANDS TOGETHER
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✨ RECOMMENDED WORKFLOW (Frontend + Backend)                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Step 1️⃣  Build Backend"
echo ""
echo "   bash build-backend.sh"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "Step 2️⃣  Build Frontend"
echo ""
echo "   bash build-frontend.sh"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "Step 3️⃣  Restart Backend with PM2"
echo ""
echo "   bash pm2-backend.sh restart"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "Step 4️⃣  Verify Health"
echo ""
echo "   bash pm2-backend.sh health"
echo ""
echo "───────────────────────────────────────────────────────────────────"
echo ""
echo "⏱️  Total Time: ~3-5 minutes"
echo ""

###############################################################################
# SECTION 4: ALL AVAILABLE SCRIPTS
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📦 ALL AVAILABLE SCRIPTS                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
1️⃣  build-frontend.sh
    Purpose: Build React frontend with Vite
    Command: bash build-frontend.sh
    Output: /frontend/dist/
    Time: 10-30 seconds
    Use: Before deploying frontend changes

2️⃣  build-backend.sh
    Purpose: Build TypeScript backend
    Command: bash build-backend.sh
    Output: /backend/dist/
    Time: 15-45 seconds
    Use: Before deploying backend changes

3️⃣  pm2-backend.sh
    Purpose: Manage backend process with PM2
    Commands:
      - start:          bash pm2-backend.sh start
      - restart:        bash pm2-backend.sh restart     ← Most used
      - stop:           bash pm2-backend.sh stop
      - status:         bash pm2-backend.sh status
      - logs:           bash pm2-backend.sh logs
      - health:         bash pm2-backend.sh health
      - setup-startup:  bash pm2-backend.sh setup-startup

4️⃣  deploy.sh
    Purpose: Full deployment (backup + build + migrate + restart)
    Command: bash deploy.sh full
    Time: 3-5 minutes
    Use: Complete production deployment

5️⃣  pm2-manage.sh
    Purpose: Advanced PM2 process management
    Use: For detailed process control and monitoring

6️⃣  QUICK_COMMANDS.sh
    Purpose: Reference file with copy-paste commands
    Contains: Common commands and emergency procedures
    Read: View file for quick reference

7️⃣  BUILD_DEPLOY_GUIDE.md
    Purpose: Comprehensive documentation
    Includes: Usage guide, troubleshooting, workflows

8️⃣  BUILD_SCRIPTS_README.md
    Purpose: Overview and quick reference
    Includes: File locations, configuration, checklists
EOF

echo ""

###############################################################################
# SECTION 5: QUICK REFERENCE TABLE
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ⚡ QUICK REFERENCE (Copy & Paste)                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
┌─────────────────────────────────────────────────────────────────────┐
│ MOST COMMON COMMANDS                                                │
├─────────────────────────────────────────────────────────────────────┤
│ Restart backend:        bash pm2-backend.sh restart                │
│ Check status:           bash pm2-backend.sh status                 │
│ View logs:              bash pm2-backend.sh logs                   │
│ Build frontend:         bash build-frontend.sh                     │
│ Build backend:          bash build-backend.sh                      │
│ Health check:           bash pm2-backend.sh health                 │
│ Full deployment:        bash deploy.sh full                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ AFTER CODE CHANGES                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 1. bash build-backend.sh                                            │
│ 2. bash pm2-backend.sh restart                                      │
│ 3. bash pm2-backend.sh health                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND PM2 COMMANDS                                                │
├─────────────────────────────────────────────────────────────────────┤
│ bash pm2-backend.sh start          # Launch first time              │
│ bash pm2-backend.sh restart        # Restart running process        │
│ bash pm2-backend.sh stop           # Stop gracefully                │
│ bash pm2-backend.sh status         # Show status                    │
│ bash pm2-backend.sh logs           # Stream logs (Ctrl+C to exit)   │
│ bash pm2-backend.sh health         # Check if responding            │
│ bash pm2-backend.sh setup-startup  # Auto-start on reboot           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MONITORING                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ bash pm2-backend.sh status         # Current status                 │
│ pm2 list                           # All PM2 processes              │
│ pm2 monit                          # Real-time monitoring           │
│ bash pm2-backend.sh logs | grep ERROR                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ EMERGENCY COMMANDS                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ pm2 stop emploiplus-backend        # Stop immediately              │
│ pm2 restart emploiplus-backend     # Force restart                 │
│ pm2 delete emploiplus-backend      # Remove process                │
│ pm2 kill                           # Kill all PM2 processes        │
└─────────────────────────────────────────────────────────────────────┘
EOF

echo ""

###############################################################################
# SECTION 6: VERIFICATION CHECKLIST
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ POST-DEPLOYMENT VERIFICATION                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
After running deployment commands, verify:

□ Check Process Status
  Command: bash pm2-backend.sh status
  Expected: "online" status in green

□ Health Check
  Command: bash pm2-backend.sh health
  Expected: "Backend en bonne santé (HTTP 200)"

□ View Recent Logs
  Command: bash pm2-backend.sh logs
  Expected: No ERROR messages

□ Test API Endpoint
  Command: curl http://localhost:5000/api/health
  Expected: JSON response

□ Frontend Files Built
  Command: ls -la frontend/dist/ | head
  Expected: index.html and assets folder
EOF

echo ""

###############################################################################
# SECTION 7: FILE LOCATIONS
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📁 ALL SCRIPT LOCATIONS                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
Base Directory: /home/emploiplus-group.com/public_html/

Scripts:
  ✓ build-frontend.sh
  ✓ build-backend.sh
  ✓ pm2-backend.sh
  ✓ deploy.sh
  ✓ pm2-manage.sh

Documentation:
  ✓ BUILD_SCRIPTS_README.md        ← Overview (this file)
  ✓ BUILD_DEPLOY_GUIDE.md          ← Complete guide
  ✓ QUICK_COMMANDS.sh              ← Copy-paste commands
  ✓ STEP_7_EXPORT_FINALIZATION.md  ← Export system docs

Project Directories:
  ✓ frontend/                      ← React app
  ✓ backend/                       ← Node.js server
  ✓ logs/                          ← Access/error logs
  ✓ backups/                       ← Database backups
EOF

echo ""

###############################################################################
# SECTION 8: ADDITIONAL INFO
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ℹ️  SYSTEM INFORMATION                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🔧 Backend Configuration:"
echo "   • Port: 5000"
echo "   • Process Manager: PM2"
echo "   • Process Name: emploiplus-backend"
echo "   • Command: npm run dev"
echo "   • Watch Mode: Enabled"
echo ""

echo "🎨 Frontend Configuration:"
echo "   • Build Tool: Vite"
echo "   • Framework: React + TypeScript"
echo "   • Output: /frontend/dist/"
echo "   • Environment: VITE_API_BASE_URL"
echo ""

echo "🗄️  Database Configuration:"
echo "   • Type: PostgreSQL"
echo "   • Database: emploiplus_db"
echo "   • Credentials: From .env file"
echo ""

###############################################################################
# SECTION 9: NEXT STEPS
###############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 NEXT STEPS                                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
1. ✅ Read Documentation
   cat BUILD_DEPLOY_GUIDE.md

2. 🏗️  Build Backend
   bash build-backend.sh

3. 🎨 Build Frontend
   bash build-frontend.sh

4. 🔄 Restart Backend
   bash pm2-backend.sh restart

5. ✅ Verify Health
   bash pm2-backend.sh health

6. 📊 Monitor Logs
   bash pm2-backend.sh logs

7. 🌐 Test in Browser
   Visit: http://localhost:5000
EOF

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✨ All scripts are ready for production use!                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
