# 🚀 Deployment Rehberi

Bu dosya, Ezan Vakitleri projesinin nasıl deploy edileceğini açıklar.

## Vercel'e Deploy (Önerilen)

### 1. Vercel Hesabı Oluşturun

[vercel.com](https://vercel.com) adresinden ücretsiz hesap oluşturun.

### 2. GitHub/GitLab'a Push Edin

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 3. Vercel'de Import Edin

1. Vercel dashboard'a gidin
2. "New Project" butonuna tıklayın
3. GitHub repo'nuzu seçin
4. Build ayarları otomatik algılanacak:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
5. "Deploy" butonuna tıklayın

### 4. Domain Ayarlayın

1. Vercel dashboard'da projenize gidin
2. Settings > Domains
3. Kendi domain'inizi ekleyin

## Netlify'a Deploy

### 1. Build Command

```bash
npm run build
```

### 2. Publish Directory

```
.next
```

### 3. Netlify.toml Ekleyin (Opsiyonel)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Kendi Sunucunuza Deploy

### 1. Production Build

```bash
npm run build
npm run start
```

### 2. PM2 ile Çalıştırma

```bash
npm install -g pm2
pm2 start npm --name "ezanvakti" -- start
pm2 save
pm2 startup
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name ezanvakti.com www.ezanvakti.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ezanvakti.com -d www.ezanvakti.com
```

## Docker ile Deploy

### Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Çalıştırma

```bash
docker-compose up -d
```

## Environment Variables (İhtiyaç Varsa)

Eğer gelecekte environment variable'lar kullanmanız gerekirse:

### .env.local (Geliştirme)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production

Vercel/Netlify dashboard'dan ekleyin:

```
NEXT_PUBLIC_SITE_URL=https://ezanvakti.com
```

## Performance Optimizasyonları

### 1. Image Optimization

Next.js otomatik olarak resimleri optimize eder. Vercel'de bu özellik built-in gelir.

### 2. CDN

Vercel otomatik olarak global CDN kullanır. Kendi sunucunuzda ise Cloudflare kullanabilirsiniz.

### 3. Caching

ISR (Incremental Static Regeneration) zaten aktif, her sayfa 1 saat cache'lenir.

## Monitoring

### Vercel Analytics

Vercel dashboard'da Analytics sekmesinden aktif edin (ücretsiz).

### Google Analytics (Opsiyonel)

`app/layout.tsx` dosyasına ekleyin:

```tsx
<script
  async
  src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
/>
```

## Sorun Giderme

### Build Hatası

```bash
# Node modüllerini temizle ve yeniden yükle
rm -rf node_modules .next
npm install
npm run build
```

### API Rate Limiting

Diyanet API'si rate limit uyguluyorsa, ISR cache süresini artırın:

```typescript
export const revalidate = 7200; // 2 saat
```

## Güncelleme

```bash
git pull origin main
npm install
npm run build
pm2 restart ezanvakti  # PM2 kullanıyorsanız
```

## Yedekleme

Veri tabanı olmadığı için sadece kod yedeklemesi yeterli. Git kullanıyorsanız zaten yedeklenmiş demektir.

---

Sorularınız için issue açabilirsiniz.
