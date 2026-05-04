#!/bin/bash

# Exit on error
set -e

echo "=================================================="
echo "  VideoForge - Hostinger VPS Setup Script"
echo "  OS: Ubuntu 22.04"
echo "=================================================="

# 1. System Update
echo "[1/9] Updating system packages..."
apt update && apt upgrade -y

# 2. Install Python 3.12 and tools
echo "[2/9] Installing Python 3.12, pip, and virtualenv..."
apt install -y software-properties-common
add-apt-repository -y ppa:deadsnakes/ppa
apt update
apt install -y python3.12 python3.12-venv python3.12-dev python3-pip

# 3. Install Node.js 20, npm, and pm2
echo "[3/9] Installing Node.js 20, npm, and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2 npm@latest

# 4. Install FFmpeg
echo "[4/9] Installing FFmpeg..."
apt install -y ffmpeg

# 5. Install Nginx
echo "[5/9] Installing Nginx..."
apt install -y nginx

# 6. Install Git
echo "[6/9] Installing Git..."
apt install -y git

# 7. Create project directory and set permissions
echo "[7/9] Creating project folder (/var/www/videoforge)..."
mkdir -p /var/www/videoforge
chown -R $USER:$USER /var/www/videoforge

# 8. Create Python virtual environment
echo "[8/9] Creating Python virtual environment..."
cd /var/www/videoforge
if [ ! -d "venv" ]; then
    python3.12 -m venv venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# 9. Install Supervisor
echo "[9/9] Installing Supervisor..."
apt install -y supervisor

# Create log directories
echo "[+] Creating log directories..."
mkdir -p /var/log/videoforge
chown -R $USER:www-data /var/log/videoforge
chmod -R 775 /var/log/videoforge

echo "=================================================="
echo "  Setup Complete!"
echo "  Next steps:"
echo "  1. Clone your project: git clone <repo> /var/www/videoforge"
echo "  2. Configure .env file"
echo "  3. Run deploy.sh"
echo "=================================================="
