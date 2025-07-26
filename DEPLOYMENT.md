# 🚀 Deployment Guide - Virtual Building Empire

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Copy `.env.example` to `.env` and configure all variables
- [ ] Update contract addresses for your deployed smart contracts
- [ ] Configure RPC URLs for your target networks
- [ ] Set up IPFS gateway for NFT metadata
- [ ] Configure API endpoints

### ✅ Build Verification
- [ ] Run `npm run build` successfully
- [ ] Test production build locally
- [ ] Verify all assets load correctly
- [ ] Test wallet connection functionality
- [ ] Verify responsive design on mobile/tablet

### ✅ Smart Contract Deployment
- [ ] Deploy character NFT contract
- [ ] Deploy marketplace contract
- [ ] Deploy job assignment contract
- [ ] Verify contracts on block explorer
- [ ] Update contract addresses in environment

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Why Vercel:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions support
- Perfect for React apps

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file

5. **Custom Domain (Optional)**
   - Add your domain in Vercel Dashboard
   - Update DNS records as instructed

### 2. Netlify

**Steps:**

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=build
   ```

3. **Or Deploy via Git**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Configure environment variables in Netlify dashboard

### 3. AWS S3 + CloudFront

**Steps:**

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

3. **Upload build files**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

4. **Configure CloudFront distribution**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages for SPA routing

### 4. Traditional Web Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload build folder**
   - Upload contents of `build/` folder to your web server
   - Configure server for SPA routing (see server configuration below)

## ⚙️ Server Configuration

### Apache (.htaccess)

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Enable GZIP compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
```

### Nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name virtualbuilding.game www.virtualbuilding.game;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name virtualbuilding.game www.virtualbuilding.game;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    root /var/www/virtualbuilding/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain application/xml text/css application/javascript;
    gzip_min_length 1000;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 Security Configuration

### Environment Variables Security

**Never commit sensitive data to Git:**
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

**Use different values for different environments:**
- Development: Use testnets and demo data
- Staging: Use testnets with production-like data
- Production: Use mainnets with real data

### Content Security Policy

Add to your HTML or server configuration:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https: wss:;">
```

## 📊 Performance Optimization

### Build Optimization

1. **Analyze bundle size**
   ```bash
   npm run analyze
   ```

2. **Optimize images**
   - Use WebP format where possible
   - Compress images before deployment
   - Use appropriate image sizes

3. **Code splitting**
   ```javascript
   // Already implemented in the app
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

### CDN Configuration

For better performance, serve static assets via CDN:

```javascript
// In package.json
"homepage": "https://cdn.yoursite.com"
```

## 🌍 Multi-Environment Setup

### Development
```bash
# .env.development
REACT_APP_DEMO_MODE=true
REACT_APP_DEBUG_MODE=true
REACT_APP_CHAIN_ID=5  # Goerli testnet
```

### Staging
```bash
# .env.staging
REACT_APP_DEMO_MODE=false
REACT_APP_DEBUG_MODE=true
REACT_APP_CHAIN_ID=5  # Goerli testnet
```

### Production
```bash
# .env.production
REACT_APP_DEMO_MODE=false
REACT_APP_DEBUG_MODE=false
REACT_APP_CHAIN_ID=1  # Ethereum mainnet
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --passWithNoTests
    
    - name: Build application
      run: npm run build
      env:
        REACT_APP_DEMO_MODE: false
        REACT_APP_DEBUG_MODE: false
        # Add other production environment variables
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📱 Mobile App Deployment

### Progressive Web App (PWA)

The app is already configured as a PWA. To enhance mobile experience:

1. **Update manifest.json**
   ```json
   {
     "name": "Virtual Building Empire",
     "short_name": "VBE",
     "theme_color": "#667eea",
     "background_color": "#ffffff",
     "display": "standalone",
     "start_url": "/",
     "icons": [...]
   }
   ```

2. **Test PWA features**
   - Install prompt
   - Offline functionality
   - Push notifications

### React Native (Future)

For native mobile apps:

1. **Extract business logic to shared hooks**
2. **Create React Native project**
3. **Implement native Web3 integration**
4. **Deploy to App Store/Google Play**

## 🔍 Monitoring & Analytics

### Error Tracking

1. **Sentry integration**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Performance monitoring**
   ```javascript
   // In index.js
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.REACT_APP_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### Analytics

1. **Google Analytics 4**
   ```javascript
   // gtag integration already configured
   gtag('config', process.env.REACT_APP_GA_TRACKING_ID);
   ```

2. **Custom events tracking**
   ```javascript
   // Track user actions
   gtag('event', 'character_minted', {
     'event_category': 'engagement',
     'value': 1
   });
   ```

## 🆘 Troubleshooting

### Common Issues

1. **Routing issues on production**
   - Configure server for SPA routing
   - Check PUBLIC_URL environment variable

2. **Wallet connection fails**
   - Verify HTTPS is enabled
   - Check if MetaMask is installed
   - Verify network configuration

3. **Environment variables not working**
   - Ensure variables start with REACT_APP_
   - Restart development server after changes
   - Check Vercel/Netlify dashboard for production

4. **Performance issues**
   - Run bundle analyzer
   - Enable compression
   - Optimize images
   - Use CDN for static assets

### Health Checks

Add health check endpoints:

```javascript
// In public folder: health.json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

## 📈 Post-Deployment

### Launch Checklist

- [ ] Test all core features
- [ ] Verify wallet connections
- [ ] Test character minting
- [ ] Verify marketplace functionality
- [ ] Test on multiple devices/browsers
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test backup/recovery procedures

### Monitoring Setup

1. **Uptime monitoring**
2. **Performance monitoring**
3. **Error rate tracking**
4. **User behavior analytics**
5. **Smart contract event monitoring**

---

**Your Virtual Building Empire is ready to launch! 🚀**

For additional support, check the main README.md or contact the development team.