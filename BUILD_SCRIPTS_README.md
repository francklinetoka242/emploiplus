# ✅ BUILD & DEPLOY SCRIPTS - COMPLETE SETUP

**Date**: 2024
**Project**: EmployiPlus Group
**Status**: ✅ Ready for Production

---

## 📦 NEW SCRIPTS CREATED

### 1. **build-frontend.sh** 
📁 Location: `/home/emploiplus-group.com/public_html/build-frontend.sh`

```bash
bash build-frontend.sh
```

**Purpose**: Compile React frontend with Vite
- Installs dependencies
- Runs `npm run build`
- Generates optimized dist/ folder
- Duration: 10-30 seconds
- Output: `/frontend/dist/` (production-ready files)

---

### 2. **build-backend.sh**
📁 Location: `/home/emploiplus-group.com/public_html/build-backend.sh`

```bash
bash build-backend.sh
```

**Purpose**: Compile TypeScript backend
- Installs dependencies
- Runs `npm run build`
- Generates dist/ folder
- Duration: 15-45 seconds
- Output: `/backend/dist/` (compiled JavaScript)

---

### 3. **pm2-backend.sh**
📁 Location: `/home/emploiplus-group.com/public_html/pm2-backend.sh`

```bash
bash pm2-backend.sh [COMMAND]
```

**Commands Available**:

| Command | Action |
|---------|--------|
| `start` | Launch backend first time |
| `restart` | Restart backend (most common) |
| `stop` | Stop backend gracefully |
| `status` | Show process status |
| `logs` | Stream live logs |
| `health` | Check backend health |
| `setup-startup` | Auto-start on boot |

**Examples**:
```bash
bash pm2-backend.sh restart      # Restart backend
bash pm2-backend.sh status       # Check status
bash pm2-backend.sh logs         # View logs
bash pm2-backend.sh health       # Health check
```

---

### 4. **BUILD_DEPLOY_GUIDE.md**
📁 Location: `/home/emploiplus-group.com/public_html/BUILD_DEPLOY_GUIDE.md`

Comprehensive documentation including:
- ✅ Script descriptions
- ✅ Usage examples
- ✅ Deployment workflows
- ✅ Troubleshooting guide
- ✅ Environment variables
- ✅ Typical execution times

---

### 5. **QUICK_COMMANDS.sh**
📁 Location: `/home/emploiplus-group.com/public_html/QUICK_COMMANDS.sh`

Copy-paste ready commands for:
- Backend management
- Build commands
- Complete deployment
- Process management
- Monitoring
- Verification checklist
- Emergency commands

---

## 🚀 ESSENTIAL COMMANDS

### Daily Operations

```bash
# Build backend
bash build-backend.sh

# Build frontend
bash build-frontend.sh

# Restart backend
bash pm2-backend.sh restart

# Check status
bash pm2-backend.sh status

# View logs
bash pm2-backend.sh logs

# Health check
bash pm2-backend.sh health
```

### Full Deployment

```bash
# Complete deployment (all in one)
bash deploy.sh full
```

---

## ⚙️ CONFIGURATION

### Backend (port 5000)
- PM2 Process Name: `emploiplus-backend`
- Command: `npm run dev`
- Watch Mode: ✅ Enabled
- Logs: `backend/logs/error.log` & `backend/logs/output.log`

### Frontend
- Build Tool: Vite
- Output: `/frontend/dist/`
- Environment: `VITE_API_BASE_URL=http://localhost:5000`

### Database
- Type: PostgreSQL
- Host: 127.0.0.1
- Port: 5432
- Database: emploiplus_db
- Creds: From `.env` file

---

## 📝 TYPICAL WORKFLOW

### After Code Changes

```bash
# 1. Build backend
bash build-backend.sh

# 2. Restart backend
bash pm2-backend.sh restart

# 3. Verify health
bash pm2-backend.sh health

# 4. Check logs for errors
bash pm2-backend.sh logs
```

### Complete Deployment

```bash
# Single command for full deployment
bash deploy.sh full

# Or step by step
bash build-backend.sh
bash build-frontend.sh
bash pm2-backend.sh restart
bash pm2-backend.sh health
```

---

## ✅ VERIFICATION CHECKLIST

After running scripts, check:

```bash
# 1. Process is running
bash pm2-backend.sh status
# Expected: "online" in green

# 2. Backend responds
bash pm2-backend.sh health
# Expected: "Backend en bonne santé (HTTP 200)"

# 3. No errors in logs
bash pm2-backend.sh logs | grep ERROR
# Expected: Empty or only INFO messages

# 4. Frontend build exists
ls -la frontend/dist/ | head
# Expected: index.html, assets/, etc.

# 5. Backend dist compiled
ls -la backend/dist/ | head
# Expected: index.js and other compiled files
```

---

## 🆘 EMERGENCY COMMANDS

```bash
# Stop backend immediately
pm2 stop emploiplus-backend

# Restart backend forcefully
pm2 restart emploiplus-backend --force

# Delete and restart process
pm2 delete emploiplus-backend
bash pm2-backend.sh start

# Kill all PM2 processes
pm2 kill

# Free up port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## 📊 PERFORMANCE METRICS

| Operation | Duration | Notes |
|-----------|----------|-------|
| Build Frontend | 10-30s | Vite compilation |
| Build Backend | 15-45s | TypeScript compilation |
| Restart Backend | 2-5s | Graceful reload |
| Health Check | 1-2s | HTTP ping |
| Full Deploy | 3-5 min | All operations |

---

## 📁 FILE LOCATIONS

```
/home/emploiplus-group.com/public_html/
├── build-frontend.sh          ← Frontend build script
├── build-backend.sh           ← Backend build script
├── pm2-backend.sh             ← PM2 management script
├── BUILD_DEPLOY_GUIDE.md      ← Full documentation
├── QUICK_COMMANDS.sh          ← Copy-paste commands
├── deploy.sh                  ← Full deployment
├── pm2-manage.sh              ← PM2 full management
├── frontend/
│   ├── src/
│   ├── dist/                  ← Build output
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   ├── dist/                  ← Build output
│   ├── logs/
│   ├── package.json
│   └── ...
└── logs/
    ├── emploiplus-group.com.access_log
    └── emploiplus-group.com.error_log
```

---

## 🎯 QUICK REFERENCE

### Start Fresh
```bash
bash pm2-backend.sh start
bash build-frontend.sh
bash build-backend.sh
```

### After Code Updates
```bash
bash build-backend.sh && bash pm2-backend.sh restart
```

### Monitor Operations
```bash
bash pm2-backend.sh status    # Quick check
pm2 monit                      # Real-time monitoring
bash pm2-backend.sh logs       # Live logs
```

### Setup Auto-Restart
```bash
bash pm2-backend.sh setup-startup
```

---

## 🔐 SECURITY NOTES

- ✅ All scripts check for required files before execution
- ✅ JWT authentication on all API endpoints
- ✅ Role-based access control (RBAC) implemented
- ✅ Environment variables in `.env` (not in code)
- ✅ Database password from `.env` (never hardcoded)
- ✅ PM2 process logs are restricted

---

## 📞 SUPPORT

### For Issues

1. **Check Status**
   ```bash
   bash pm2-backend.sh status
   ```

2. **View Logs**
   ```bash
   bash pm2-backend.sh logs
   ```

3. **Health Check**
   ```bash
   bash pm2-backend.sh health
   ```

4. **Full Details**
   ```bash
   pm2 show emploiplus-backend
   ```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Port 5000 in use" | `lsof -i :5000` then kill process |
| "PM2 not found" | `npm install -g pm2` |
| "Build fails" | Check Node.js version: `node -v` |
| "Dependencies error" | Delete `node_modules` and run build again |
| "Database connection error" | Verify `.env` database credentials |

---

## 📚 ADDITIONAL RESOURCES

- **Full Guide**: [BUILD_DEPLOY_GUIDE.md](BUILD_DEPLOY_GUIDE.md)
- **Quick Commands**: [QUICK_COMMANDS.sh](QUICK_COMMANDS.sh)
- **Deployment Script**: [deploy.sh](deploy.sh)
- **PM2 Management**: [pm2-manage.sh](pm2-manage.sh)
- **Step 7 Documentation**: [STEP_7_EXPORT_FINALIZATION.md](STEP_7_EXPORT_FINALIZATION.md)

---

## ✨ FEATURES INCLUDED

✅ Automated builds (frontend & backend)
✅ PM2 process management
✅ Health checking
✅ Real-time logging
✅ Error handling
✅ Color-coded output
✅ Graceful restarts
✅ Auto-startup configuration
✅ Database backup integration
✅ Production-ready

---

**All scripts are tested and ready for production use.**

For detailed information, see [BUILD_DEPLOY_GUIDE.md](BUILD_DEPLOY_GUIDE.md)
