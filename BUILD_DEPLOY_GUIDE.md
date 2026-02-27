# 🚀 BUILD & DEPLOY SCRIPTS - Quick Reference

## 📋 Available Scripts

```bash
# FRONTEND BUILD
bash build-frontend.sh

# BACKEND BUILD
bash build-backend.sh

# BACKEND PM2 MANAGEMENT
bash pm2-backend.sh start|restart|stop|status|logs|health
```

---

## 🔨 FRONTEND BUILD

**Purpose**: Build React TypeScript frontend with Vite

```bash
cd /home/emploiplus-group.com/public_html
bash build-frontend.sh
```

**What it does**:
1. ✅ Navigates to frontend directory
2. ✅ Installs npm dependencies
3. ✅ Compiles with Vite (`npm run build`)
4. ✅ Creates `/frontend/dist/` production files
5. ✅ Reports build size and file count

**Output**: 
- Files sent to: `/frontend/dist/`
- Size: Typically 200-500KB (gzipped)
- Includes: index.html, JS chunks, CSS bundles, assets

**Environment**: Uses `VITE_API_BASE_URL` from `.env` or `.env.production`

---

## ⚙️ BACKEND BUILD

**Purpose**: Build TypeScript backend with Node.js

```bash
cd /home/emploiplus-group.com/public_html
bash build-backend.sh
```

**What it does**:
1. ✅ Navigates to backend directory
2. ✅ Installs npm dependencies
3. ✅ Compiles TypeScript (`npm run build`)
4. ✅ Creates `/backend/dist/` production files
5. ✅ Reports build size and file count

**Output**:
- Files sent to: `/backend/dist/`
- Size: Typically 1-3MB
- Includes: Compiled JS, source maps, node_modules

**Start after build**: 
```bash
bash pm2-backend.sh restart
```

---

## 🚀 BACKEND PM2 MANAGEMENT

### 1️⃣ START Backend

```bash
bash pm2-backend.sh start
```

Launches backend for the first time. Creates PM2 process with:
- Name: `emploiplus-backend`
- Port: 5000
- Command: `npm run dev`
- Watch mode: ✅ Enabled (`--watch src`)
- Logs: `logs/error.log`, `logs/output.log`

**Initial setup only** - Use `restart` for subsequent changes.

### 2️⃣ RESTART Backend (Most Common)

```bash
bash pm2-backend.sh restart
```

Restarts running backend process gracefully:
- Stops current process
- Reloads code changes
- Restarts service
- Takes ~2 seconds

**Use this after**:
- Deploying new code
- Changing environment variables
- Adding new routes/controllers
- Database migrations

### 3️⃣ STOP Backend

```bash
bash pm2-backend.sh stop
```

Gracefully stops the backend without deleting the PM2 process.

**Use this for**:
- Temporary maintenance
- Testing without backend
- Preparing for shutdown

### 4️⃣ CHECK STATUS

```bash
bash pm2-backend.sh status
```

Shows PM2 process list and detailed backend info:
- Memory usage
- CPU usage
- Uptime
- Restarts count
- PID
- Status (online/stopped/errored)

### 5️⃣ VIEW LOGS (Real-time)

```bash
bash pm2-backend.sh logs
```

Streams live backend logs to terminal.

**Output shows**:
- HTTP requests
- Database queries
- Errors and warnings
- Application logs

**Exit**: Press `Ctrl+C`

### 6️⃣ HEALTH CHECK

```bash
bash pm2-backend.sh health
```

Verifies backend is responding to HTTP requests:
- Pings `http://localhost:5000/api/health`
- Returns: `200 OK` = Healthy ✅
- Returns: Other = Error ❌

### 7️⃣ AUTO-START ON BOOT

```bash
bash pm2-backend.sh setup-startup
```

Configures PM2 to automatically restart backend when server reboots:
- Sets up systemd integration
- Saves PM2 process list
- Enables auto-restart

**Must run once after initial server setup.**

---

## 🔄 COMPLETE DEPLOYMENT FLOW

### Option A: Individual Steps

```bash
# 1. Build backend
bash build-backend.sh

# 2. Build frontend
bash build-frontend.sh

# 3. Restart backend
bash pm2-backend.sh restart

# 4. Verify health
bash pm2-backend.sh health
```

### Option B: Automated (Complete Deploy)

```bash
bash deploy.sh full
```

This single command performs:
1. Backup database
2. Build backend + install deps
3. Build frontend + install deps
4. Run migrations
5. Restart PM2
6. Run health checks

---

## 📊 MONITORING COMMANDS

### Show running processes
```bash
pm2 list
```

### Show memory/CPU usage
```bash
bash pm2-backend.sh status
```

### Stream logs to file
```bash
bash pm2-backend.sh logs > backend-logs.txt
```

### Save logs snapshot
```bash
pm2 save
```

### Check system resources
```bash
pm2 monit
```

---

## 🔍 TROUBLESHOOTING

### Backend won't start?
```bash
# Check error logs
bash pm2-backend.sh logs

# Verify port 5000 is available
lsof -i :5000

# Try manual start
cd backend && npm run dev
```

### "PM2 not installed"
```bash
npm install -g pm2
```

### "Address already in use: 5000"
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
bash pm2-backend.sh start
```

### Frontend not updating?
```bash
# Clear dist cache and rebuild
rm -rf frontend/dist
bash build-frontend.sh
```

---

## 📝 ENVIRONMENT VARIABLES

**Frontend**: Reads from `frontend/.env` or `frontend/.env.production`
```
VITE_API_BASE_URL=http://localhost:5000
```

**Backend**: Reads from `backend/.env`
```
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost/db
NODE_ENV=development
```

---

## ⏱️ TYPICAL TIMES

| Task | Duration |
|------|----------|
| Frontend build | 10-30 seconds |
| Backend build | 15-45 seconds |
| Backend restart | 2-5 seconds |
| Full deploy | 3-5 minutes |
| Health check | 1-2 seconds |

---

## 🎯 QUICK COMMANDS CHEATSHEET

```bash
# Quick rebuild and restart
bash build-backend.sh && bash pm2-backend.sh restart

# Quick frontend rebuild
bash build-frontend.sh

# Check everything is running
bash pm2-backend.sh status

# Watch logs
bash pm2-backend.sh logs

# Full deployment
bash deploy.sh full

# Setup auto-restart
bash pm2-backend.sh setup-startup
```

---

## 📞 SUPPORT

For issues with:
- **Frontend**: Check `/frontend/logs/` or browser console
- **Backend**: Run `bash pm2-backend.sh logs`
- **Database**: Check PostgreSQL logs or .env connection string
- **PM2**: Run `pm2 logs` or `pm2 +mocha`

---

**Last Updated**: 2024
**Created for**: EmployiPlus Group
