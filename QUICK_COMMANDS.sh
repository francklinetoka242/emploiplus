#!/bin/bash

###############################################################################
# QUICK START - Essential Commands for Daily Operations
# 
# Copy and paste these commands directly to your terminal
###############################################################################

# ╔════════════════════════════════════════════════════════════════╗
# ║  🚀 BACKEND MANAGEMENT (Most Used)                            ║
# ╚════════════════════════════════════════════════════════════════╝

# Restart backend after code changes
bash /home/emploiplus-group.com/public_html/pm2-backend.sh restart

# View backend status
bash /home/emploiplus-group.com/public_html/pm2-backend.sh status

# View real-time logs
bash /home/emploiplus-group.com/public_html/pm2-backend.sh logs

# Check health (is backend responding?)
bash /home/emploiplus-group.com/public_html/pm2-backend.sh health


# ╔════════════════════════════════════════════════════════════════╗
# ║  🏗️  BUILD COMMANDS                                            ║
# ╚════════════════════════════════════════════════════════════════╝

# Build backend (compile TypeScript)
bash /home/emploiplus-group.com/public_html/build-backend.sh

# Build frontend (compile React with Vite)
bash /home/emploiplus-group.com/public_html/build-frontend.sh

# Build both (run separately)
bash /home/emploiplus-group.com/public_html/build-backend.sh && bash /home/emploiplus-group.com/public_html/build-frontend.sh


# ╔════════════════════════════════════════════════════════════════╗
# ║  🔄 COMPLETE DEPLOYMENT                                        ║
# ╚════════════════════════════════════════════════════════════════╝

# Full deployment (backup + build + migrate + restart)
bash /home/emploiplus-group.com/public_html/deploy.sh full

# Deploy only backend code
bash /home/emploiplus-group.com/public_html/deploy.sh backend

# Deploy only frontend code
bash /home/emploiplus-group.com/public_html/deploy.sh frontend


# ╔════════════════════════════════════════════════════════════════╗
# ║  🛠️  Process Management                                        ║
# ╚════════════════════════════════════════════════════════════════╝

# Start backend (first time only)
bash /home/emploiplus-group.com/public_html/pm2-backend.sh start

# Stop backend
bash /home/emploiplus-group.com/public_html/pm2-backend.sh stop

# Setup auto-restart on server reboot
bash /home/emploiplus-group.com/public_html/pm2-backend.sh setup-startup

# View all PM2 processes
pm2 list

# Delete PM2 process
pm2 delete emploiplus-backend


# ╔════════════════════════════════════════════════════════════════╗
# ║  📊 MONITORING                                                  ║
# ╚════════════════════════════════════════════════════════════════╝

# Watch CPU/Memory in real-time
pm2 monit

# Save PM2 process list
pm2 save

# Show complete backend info
pm2 show emploiplus-backend


# ╔════════════════════════════════════════════════════════════════╗
# ║  ✅ VERIFICATION CHECKLIST                                      ║
# ╚════════════════════════════════════════════════════════════════╝

# After deployment, run these checks:

# 1. Backend Process Status
bash /home/emploiplus-group.com/public_html/pm2-backend.sh status
# Expected: "online" with green status

# 2. Health Check
bash /home/emploiplus-group.com/public_html/pm2-backend.sh health
# Expected: "Backend en bonne santé (HTTP 200)"

# 3. Test API Endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/admin/stats
# Expected: JSON response with admin statistics

# 4. Check Logs for Errors
bash /home/emploiplus-group.com/public_html/pm2-backend.sh logs | grep ERROR
# Expected: No ERROR lines (or only INFO level)


# ╔════════════════════════════════════════════════════════════════╗
# ║  🆘 EMERGENCY COMMANDS                                          ║
# ╚════════════════════════════════════════════════════════════════╝

# Emergency stop (forceful)
pm2 stop emploiplus-backend

# Emergency delete and restart
pm2 delete emploiplus-backend
bash /home/emploiplus-group.com/public_html/pm2-backend.sh start

# Clear all PM2 processes
pm2 kill

# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9


# ╔════════════════════════════════════════════════════════════════╗
# ║  📝 TYPICAL WORKFLOW                                            ║
# ╚════════════════════════════════════════════════════════════════╝

# 1. After code changes, rebuild:
bash /home/emploiplus-group.com/public_html/build-backend.sh

# 2. Restart the service:
bash /home/emploiplus-group.com/public_html/pm2-backend.sh restart

# 3. Check status:
bash /home/emploiplus-group.com/public_html/pm2-backend.sh status

# 4. View logs if issues:
bash /home/emploiplus-group.com/public_html/pm2-backend.sh logs


# ╔════════════════════════════════════════════════════════════════╗
# ║  📁 IMPORTANT DIRECTORIES                                       ║
# ╚════════════════════════════════════════════════════════════════╝

# Frontend build output
# /home/emploiplus-group.com/public_html/frontend/dist/

# Backend build output
# /home/emploiplus-group.com/public_html/backend/dist/

# Backend logs
# /home/emploiplus-group.com/public_html/backend/logs/

# Database backups
# /home/emploiplus-group.com/public_html/backups/


###############################################################################
# NOTES:
# - All times are in seconds
# - All commands are idempotent (safe to run multiple times)
# - All scripts are located in: /home/emploiplus-group.com/public_html/
# - More detailed guide: READ BUILD_DEPLOY_GUIDE.md
###############################################################################
