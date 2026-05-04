#!/bin/bash

# Exit on error
set -e

echo "=================================================="
echo "  Deploying VideoForge"
echo "=================================================="

PROJECT_DIR="/var/www/videoforge"

cd $PROJECT_DIR

# 1. Pull latest code (Assume git is already set up)
echo "[1/7] Pulling latest code..."
git pull origin main || echo "Git pull skipped or failed, continuing deployment..."

# 2. Python dependencies
echo "[2/7] Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# 3. Build Frontend
echo "[3/7] Building Frontend (React/Vite)..."
npm install
npm run build

# 4. Database Migrations (Optional, assuming you use Alembic)
echo "[4/7] Running database migrations..."
if [ -f "alembic.ini" ]; then
    alembic upgrade head
else
    echo "No alembic.ini found, skipping migrations."
fi

# 5. Restart Supervisor (FastAPI Backend)
echo "[5/7] Restarting backend (Supervisor)..."
supervisorctl stop videoforge-api || true
supervisorctl start videoforge-api

# 6. Reload Nginx
echo "[6/7] Reloading Nginx..."
nginx -t
systemctl reload nginx

echo "=================================================="
echo "  Deployment Successful! 🎉"
echo "=================================================="
