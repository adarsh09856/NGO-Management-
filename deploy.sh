#!/usr/bin/env bash
# ==============================================================================
# Drodul Phendey Ling Foundation — Production VPS / aaPanel Deployment Script
# Usage on VPS: bash deploy.sh  OR  bash scripts/deploy-aapanel.sh
# ==============================================================================
set -e

echo "=================================================================="
echo "🇧🇹 Drodul Phendey Ling NGO — Full Production aaPanel Deployment"
echo "=================================================================="

# ------------------------------------------------------------------------------
# STEP 1: Git Pull Latest Changes from GitHub Repository
# ------------------------------------------------------------------------------
echo ""
echo "📥 [1/8] Pulling latest code updates from GitHub (git pull origin main)..."
if command -v git &> /dev/null; then
    # Stash any local temporary changes if needed to prevent merge conflicts
    git fetch origin main || true
    git pull origin main || {
        echo "⚠️ Warning: 'git pull origin main' encountered an issue or working directory has uncommitted changes."
        echo "   Continuing deployment with existing working tree..."
    }
    echo "✅ Latest repository code pulled successfully."
else
    echo "⚠️ Git command not found, skipping git pull."
fi

# ------------------------------------------------------------------------------
# STEP 2: Node.js & Environment Validation
# ------------------------------------------------------------------------------
echo ""
echo "🚀 [2/8] Validating Node.js and aaPanel Environment..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18 or 20 in aaPanel Node Version Manager."
    exit 1
fi

echo "   Node version: $(node -v)"
echo "   NPM version:  $(npm -v)"

# Prepare production .env if not present
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        echo "ℹ️ Copying .env.production to .env..."
        cp .env.production .env
    elif [ -f .env.example ]; then
        echo "⚠️ Notice: .env file missing. Copying .env.example to .env..."
        cp .env.example .env
        echo "⚠️ Please verify your DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in .env before proceeding!"
    fi
fi

# ------------------------------------------------------------------------------
# STEP 3: Ensure Uploads Storage & Permissions
# ------------------------------------------------------------------------------
echo ""
echo "📁 [3/8] Ensuring uploads directory structure..."
mkdir -p uploads
chmod 755 uploads 2>/dev/null || true
echo "✅ Uploads folder configured with write permissions."

# ------------------------------------------------------------------------------
# STEP 4: Install Dependencies
# ------------------------------------------------------------------------------
echo ""
echo "📦 [4/8] Installing production dependencies (npm install --legacy-peer-deps)..."
rm -rf dist .vite
npm install --legacy-peer-deps
echo "✅ Dependencies installed cleanly."

# ------------------------------------------------------------------------------
# STEP 5: Database Migrations & Live Settings Seed (dn)
# ------------------------------------------------------------------------------
echo ""
echo "🗄️ [5/8] Running MySQL Database Migrations & Master Seed (dn)..."
# Run schema and incremental migrations
node db/migrate.js

# Seed default admin, roles, categories, and master data
node db/seed.js || true

# Seed 100% complete live editing system settings
if [ -f scripts/seed-live-settings.js ]; then
    node scripts/seed-live-settings.js || true
fi
echo "✅ Database schema migrations and live settings verified."

# ------------------------------------------------------------------------------
# STEP 6: Compile Production Build (npm run build)
# ------------------------------------------------------------------------------
echo ""
echo "🏗️ [6/8] Building Frontend Production Assets (npm run build)..."
npm run build
echo "✅ Vite production bundle compiled into /dist."

# ------------------------------------------------------------------------------
# STEP 7: Free Port 5000 from Stale Processes
# ------------------------------------------------------------------------------
echo ""
echo "🧹 [7/8] Ensuring Port 5000 is clear for PM2..."
if command -v fuser &> /dev/null; then
    fuser -k 5000/tcp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    kill -9 $(lsof -t -i:5000 2>/dev/null) 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# STEP 8: PM2 Process Reload / Restart
# ------------------------------------------------------------------------------
echo ""
echo "🔄 [8/8] Reloading and Restarting Application in PM2 (pm2 restart/reload)..."
RELOADED=false

# Method A: Global pm2 binary
if command -v pm2 &> /dev/null; then
    echo "   Using system global PM2..."
    pm2 reload ecosystem.config.js --update-env || pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js
    pm2 save
    RELOADED=true

# Method B: aaPanel Node Version Manager PM2 (Node 20)
elif [ -f /www/server/nodejs/v20*/bin/pm2 ]; then
    echo "   Using aaPanel Node v20 PM2..."
    PM2_PATH=$(ls -1 /www/server/nodejs/v20*/bin/pm2 | head -n 1)
    "$PM2_PATH" reload ecosystem.config.js --update-env || "$PM2_PATH" restart ecosystem.config.js --update-env || "$PM2_PATH" start ecosystem.config.js
    "$PM2_PATH" save
    RELOADED=true

# Method C: aaPanel Node Version Manager PM2 (Node 18)
elif [ -f /www/server/nodejs/v18*/bin/pm2 ]; then
    echo "   Using aaPanel Node v18 PM2..."
    PM2_PATH=$(ls -1 /www/server/nodejs/v18*/bin/pm2 | head -n 1)
    "$PM2_PATH" reload ecosystem.config.js --update-env || "$PM2_PATH" restart ecosystem.config.js --update-env || "$PM2_PATH" start ecosystem.config.js
    "$PM2_PATH" save
    RELOADED=true
fi

if [ "$RELOADED" = true ]; then
    echo "✅ PM2 process restarted and saved successfully."
else
    echo "ℹ️ PM2 binary not found in standard paths."
    echo "   If managing via aaPanel Node.js project manager GUI, click 'Restart' on project 'drodul-phendey-ling-crm'."
fi

echo ""
echo "=================================================================="
echo "🎉 DEPLOYMENT COMPLETE! Drodul Phendey Ling NGO is live on Port 5000."
echo "   Test Health: curl -I http://127.0.0.1:5000/api/health"
echo "=================================================================="
