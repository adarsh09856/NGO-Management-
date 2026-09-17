#!/usr/bin/env bash

# 1. Pull latest code from GitHub
echo "📥 Pulling latest code..."
git fetch origin main || true
git pull origin main || true

# 2. Setup environment and install dependencies
echo "📦 Installing dependencies..."
if [ ! -f .env ] && [ -f .env.production ]; then
    cp .env.production .env
fi
mkdir -p uploads
chmod 755 uploads 2>/dev/null || true
rm -rf dist .vite
npm install --legacy-peer-deps

# 3. Database migrations & seed (dn)
echo "🗄️ Running database migrations & seed..."
node db/migrate.js || true
node db/seed.js || true
if [ -f scripts/seed-live-settings.js ]; then
    node scripts/seed-live-settings.js || true
fi

# 4. Frontend build
echo "🏗️ Building frontend..."
npm run build

# 5. Clear port 5000 if occupied
if command -v fuser &> /dev/null; then
    fuser -k 5000/tcp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    kill -9 $(lsof -t -i:5000 2>/dev/null) 2>/dev/null || true
fi

# 6. PM2 reload / restart
echo "🔄 Reloading PM2 process..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.js --update-env || pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js
    pm2 save
elif [ -f /www/server/nodejs/v20*/bin/pm2 ]; then
    PM2_BIN=$(ls -1 /www/server/nodejs/v20*/bin/pm2 | head -n 1)
    "$PM2_BIN" reload ecosystem.config.js --update-env || "$PM2_BIN" restart ecosystem.config.js --update-env || "$PM2_BIN" start ecosystem.config.js
    "$PM2_BIN" save
elif [ -f /www/server/nodejs/v18*/bin/pm2 ]; then
    PM2_BIN=$(ls -1 /www/server/nodejs/v18*/bin/pm2 | head -n 1)
    "$PM2_BIN" reload ecosystem.config.js --update-env || "$PM2_BIN" restart ecosystem.config.js --update-env || "$PM2_BIN" start ecosystem.config.js
    "$PM2_BIN" save
fi

echo "✅ Deployment complete! Platform running on port 5000."
