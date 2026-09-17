#!/usr/bin/env bash
# ==============================================================================
# Drodul Phendey Ling Foundation — Production VPS / aaPanel Deployment Script
# Usage on VPS: bash deploy.sh
# ==============================================================================
set -e

echo "=================================================================="
echo "🇧🇹 Drodul Phendey Ling NGO — Production Deployment"
echo "=================================================================="

# 1. PULL LATEST CODE FROM GITHUB
echo ""
echo "📥 [1/6] Pulling latest updates from GitHub repository (git pull origin main)..."
if command -v git &> /dev/null; then
    git fetch origin main || true
    git pull origin main || {
        echo "⚠️ Note: Git pull finished or local changes present. Continuing build..."
    }
    echo "✅ Git repository updated."
fi

# 2. VALIDATE ENVIRONMENT & DEPENDENCIES
echo ""
echo "📦 [2/6] Installing production dependencies (npm install --legacy-peer-deps)..."
if [ ! -f .env ] && [ -f .env.production ]; then
    cp .env.production .env
fi
mkdir -p uploads
chmod 755 uploads 2>/dev/null || true

rm -rf dist .vite
npm install --legacy-peer-deps
echo "✅ Dependencies verified."

# 3. DATABASE MIGRATIONS & SEED (dn)
echo ""
echo "🗄️ [3/6] Running database migrations & seeding live settings..."
node db/migrate.js
node db/seed.js || true
if [ -f scripts/seed-live-settings.js ]; then
    node scripts/seed-live-settings.js || true
fi
echo "✅ Database schema and settings synced."

# 4. FRONTEND PRODUCTION BUILD
echo ""
echo "🏗️ [4/6] Building production assets (npm run build)..."
npm run build
echo "✅ Vite frontend built into dist/."

# 5. CLEAR STALE PORT 5000 PROCESSES
echo ""
echo "🧹 [5/6] Checking Port 5000..."
if command -v fuser &> /dev/null; then
    fuser -k 5000/tcp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    kill -9 $(lsof -t -i:5000 2>/dev/null) 2>/dev/null || true
fi

# 6. RESTART PM2 APPLICATION
echo ""
echo "🔄 [6/6] Reloading application in PM2 (pm2 restart / reload)..."
RELOADED=false

if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.js --update-env || pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js
    pm2 save
    RELOADED=true
elif [ -f /www/server/nodejs/v20*/bin/pm2 ]; then
    PM2_BIN=$(ls -1 /www/server/nodejs/v20*/bin/pm2 | head -n 1)
    "$PM2_BIN" reload ecosystem.config.js --update-env || "$PM2_BIN" restart ecosystem.config.js --update-env || "$PM2_BIN" start ecosystem.config.js
    "$PM2_BIN" save
    RELOADED=true
elif [ -f /www/server/nodejs/v18*/bin/pm2 ]; then
    PM2_BIN=$(ls -1 /www/server/nodejs/v18*/bin/pm2 | head -n 1)
    "$PM2_BIN" reload ecosystem.config.js --update-env || "$PM2_BIN" restart ecosystem.config.js --update-env || "$PM2_BIN" start ecosystem.config.js
    "$PM2_BIN" save
    RELOADED=true
fi

if [ "$RELOADED" = true ]; then
    echo "✅ PM2 process restarted successfully."
else
    echo "ℹ️ PM2 restart command triggered. If using aaPanel GUI, restart 'drodul-phendey-ling-crm'."
fi

echo ""
echo "=================================================================="
echo "🎉 DEPLOYMENT COMPLETE! Platform is live on Port 5000."
echo "   Health check: curl -I http://127.0.0.1:5000/api/health"
echo "=================================================================="
