# VideoForge Deployment Guide - Hostinger VPS (No Docker)

This guide provides step-by-step instructions to deploy VideoForge onto an Ubuntu 22.04 VPS (e.g., Hostinger) using Nginx, Supervisor, Python 3.12, and Node.js 20.

## 1. Connect to your VPS via SSH
Open your terminal and connect to the VPS as root:
```bash
ssh root@<YOUR_VPS_IP>
```

## 2. Copy code & Run Setup Script
Get your code onto the VPS:
```bash
# Clone directly if using git
git clone https://github.com/yourusername/videoforge.git /var/www/videoforge

# Navigate to the project directory
cd /var/www/videoforge

# Make deployment scripts executable
chmod +x deploy/setup.sh
chmod +x deploy/deploy.sh

# Run the setup script
./deploy/setup.sh
```

## 3. Setup Environment Variables
Copy the production environment example and fill in your keys:
```bash
cp .env.production .env
nano .env
```
Add your Anthropic API Key, Gemini API key, and configure your domain.

## 4. Setup Nginx Configuration
Symlink the Nginx configuration to standard directories and enable it:
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/videoforge
ln -s /etc/nginx/sites-available/videoforge /etc/nginx/sites-enabled/

# Remove default nginx site
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## 5. Setup Supervisor Configuration
Link the Supervisor configuration for managing the FastAPI backend:
```bash
cp deploy/supervisor.conf /etc/supervisor/conf.d/videoforge.conf

# Reload Supervisor configuration
supervisorctl reread
supervisorctl update
supervisorctl status videoforge-api
```

## 6. Setup SSL via Certbot (HTTPS)
```bash
apt install -y python3-certbot-nginx
certbot --nginx -d tumhara-domain.com -d www.tumhara-domain.com
```
*Note: Make sure your DNS A-records are pointing to your VPS IP before running this.*

## 7. Run Initial Deployment
Run the deployment script to build the frontend, install pip dependencies, and restart services:
```bash
./deploy/deploy.sh
```

## 8. Confirm Website is Live
Open your browser and navigate to `https://tumhara-domain.com`. The frontend should load, and API calls to `/api/...` will automatically route to your FastAPI backend.
