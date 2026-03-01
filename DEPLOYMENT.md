# Hostinger VPS Deployment Guide

Complete guide to deploy your AI Resume Builder on Hostinger VPS.

## Prerequisites

- Hostinger VPS account
- Domain name (optional but recommended)
- SSH access to your VPS

## Step 1: Initial VPS Setup

### Connect to VPS
```bash
ssh root@your-vps-ip
```

### Update System
```bash
apt update && apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
node --version
npm --version
```

### Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
systemctl status mongod
```

### Install Git
```bash
apt-get install -y git
```

## Step 2: Deploy Backend

### Clone Repository
```bash
cd /var/www
git clone <your-repository-url> resume-builder
cd resume-builder/server
```

### Install Dependencies
```bash
npm install
```

### Setup Environment Variables
```bash
nano .env
```

Add your production variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Save with `Ctrl+X`, then `Y`, then `Enter`

### Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Start Application
```bash
pm2 start server.js --name resume-api
pm2 startup
pm2 save
```

### Check Status
```bash
pm2 status
pm2 logs resume-api
```

## Step 3: Setup Nginx

### Install Nginx
```bash
apt-get install -y nginx
```

### Configure Nginx for Backend
```bash
nano /etc/nginx/sites-available/resume-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # or your-vps-ip

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site
```bash
ln -s /etc/nginx/sites-available/resume-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 4: Deploy Frontend

### Build Frontend Locally
On your local machine:
```bash
cd client
npm run build
```

### Update API URL
Before building, update `client/src/api.js`:
```javascript
const API_URL = 'http://api.yourdomain.com/api';  // or http://your-vps-ip:5000/api
```

### Upload to VPS
```bash
scp -r dist/* root@your-vps-ip:/var/www/html/resume-builder
```

Or use Git:
```bash
# On VPS
cd /var/www/html
git clone <your-repository-url> resume-builder-frontend
cd resume-builder-frontend/client
npm install
npm run build
```

### Configure Nginx for Frontend
```bash
nano /etc/nginx/sites-available/resume-frontend
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # or your-vps-ip

    root /var/www/html/resume-builder-frontend/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

### Enable Site
```bash
ln -s /etc/nginx/sites-available/resume-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 5: Setup SSL (HTTPS)

### Install Certbot
```bash
apt-get install -y certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Follow the prompts and select option 2 to redirect HTTP to HTTPS.

### Auto-renewal
```bash
certbot renew --dry-run
```

## Step 6: Setup Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

## Step 7: Monitoring & Maintenance

### View Logs
```bash
# Application logs
pm2 logs resume-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Restart Services
```bash
# Restart application
pm2 restart resume-api

# Restart Nginx
systemctl restart nginx

# Restart MongoDB
systemctl restart mongod
```

### Update Application
```bash
cd /var/www/resume-builder
git pull
cd server
npm install
pm2 restart resume-api
```

## Step 8: Backup Setup

### Create Backup Script
```bash
nano /root/backup-resume.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --out=$BACKUP_DIR/mongodb_$DATE

# Backup Application
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/resume-builder

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable:
```bash
chmod +x /root/backup-resume.sh
```

### Schedule Daily Backups
```bash
crontab -e
```

Add:
```
0 2 * * * /root/backup-resume.sh
```

## Troubleshooting

### Application Not Starting
```bash
pm2 logs resume-api
# Check for errors in environment variables or dependencies
```

### Nginx 502 Bad Gateway
```bash
# Check if application is running
pm2 status

# Check Nginx configuration
nginx -t

# Check logs
tail -f /var/log/nginx/error.log
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
systemctl restart mongod
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## Performance Optimization

### Enable Nginx Caching
Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    # ... other proxy settings
}
```

### PM2 Cluster Mode
```bash
pm2 start server.js -i max --name resume-api
```

### MongoDB Optimization
```bash
# Enable authentication
mongo
use admin
db.createUser({user: "admin", pwd: "password", roles: ["root"]})
```

Update `.env`:
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/resume-builder?authSource=admin
```

## Security Best Practices

1. **Change default SSH port**
2. **Disable root login**
3. **Use SSH keys instead of passwords**
4. **Keep system updated**
5. **Use strong passwords**
6. **Enable MongoDB authentication**
7. **Regular backups**
8. **Monitor logs regularly**

## Useful Commands

```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check CPU usage
top

# Check running processes
ps aux | grep node

# Check open ports
netstat -tulpn

# Check system logs
journalctl -xe
```

## Support

For Hostinger-specific issues, contact Hostinger support.
For application issues, check the main README.md file.

---

🎉 Congratulations! Your AI Resume Builder is now live on Hostinger VPS!
