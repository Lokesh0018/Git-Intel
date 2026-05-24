# GitIntel Manual Deployment Guide

This guide details how to manually deploy the GitIntel platform to a Linux Virtual Private Server (VPS) / EC2 instance running Ubuntu, utilizing Nginx as a reverse proxy, PM2 for process management, and a self-hosted MongoDB database.

---

## 1. PM2 Ecosystem Configuration

Create a file named `ecosystem.config.cjs` in the root of your project to manage the backend application:

```javascript
module.exports = {
  apps: [
    {
      name: 'gitintel-api',
      script: './backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
```

---

## 2. Nginx Reverse Proxy Configuration

Configure Nginx to serve the compiled React frontend statically, proxy `/api` and `/health` requests to the Node/Express backend, and configure SSL certifications.

Create a configuration file at `/etc/nginx/sites-available/gitintel`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (Managed by Certbot / Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Static file serving for React Frontend
    root /var/www/gitintel/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node/Express Backend
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
        proxy_set_header Host $host;
    }
}
```

Enable the site configuration by creating a symlink:
```bash
sudo ln -s /etc/nginx/sites-available/gitintel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 3. VPS Step-by-Step Installation

### Step A: System Update & Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential nginx
```

### Step B: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -y -g pm2
```

### Step C: Install MongoDB
Follow MongoDB official guidelines to install community edition:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 4. Building & Running the Application

1. Clone your repository to `/var/www/gitintel`:
   ```bash
   git clone https://github.com/your-username/gitintel.git /var/www/gitintel
   cd /var/www/gitintel
   ```

2. Setup Backend environment variables:
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env # Configure GITHUB_TOKEN, OPENAI_API_KEY, JWT_SECRET, MONGODB_URI
   ```

3. Install root workspace and rebuild projects:
   ```bash
   npm install
   npm run build --workspaces
   ```

4. Launch the Express backend using PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```

5. Setup SSL via Certbot (Let's Encrypt):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
