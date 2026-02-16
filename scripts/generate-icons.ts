import { createCanvas, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate PWA icons for ezanvakti.site
 * 
 * Creates:
 * - icon-192x192.png (Android Chrome)
 * - icon-512x512.png (Android Chrome, splash screen)
 * - apple-icon.png (iOS Safari, 180x180)
 * - favicon.ico (Browser tab, 32x32)
 */

interface IconConfig {
  size: number;
  filename: string;
  description: string;
}

const ICONS: IconConfig[] = [
  { size: 192, filename: 'icon-192x192.png', description: 'Android Chrome' },
  { size: 512, filename: 'icon-512x512.png', description: 'Android Chrome / Splash' },
  { size: 180, filename: 'apple-icon.png', description: 'iOS Safari' },
  { size: 32, filename: 'favicon.ico', description: 'Browser Tab' },
];

function generateIcon(size: number, filename: string) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - Deep Navy Blue (brand color)
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(0, 0, size, size);
  
  // Golden accent circle (subtle background)
  const centerX = size / 2;
  const centerY = size / 2;
  const circleRadius = size * 0.42;
  
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, circleRadius);
  gradient.addColorStop(0, 'rgba(240, 192, 64, 0.15)');
  gradient.addColorStop(1, 'rgba(240, 192, 64, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Mosque emoji as icon symbol
  const emojiSize = size * 0.5;
  ctx.font = `${emojiSize}px Arial, "Segoe UI Emoji", "Apple Color Emoji"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f0c040'; // Gold color
  
  // Draw mosque emoji
  ctx.fillText('🕌', centerX, centerY);
  
  // Optional: Add subtle border
  ctx.strokeStyle = 'rgba(240, 192, 64, 0.3)';
  ctx.lineWidth = size * 0.01;
  ctx.strokeRect(0, 0, size, size);
  
  // Save to public folder
  const outputPath = path.join(process.cwd(), 'public', filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  return outputPath;
}

async function main() {
  console.log('🎨 PWA Icon Generator - ezanvakti.site\n');
  
  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Generate all icons
  for (const icon of ICONS) {
    const outputPath = generateIcon(icon.size, icon.filename);
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ ${icon.filename}`);
    console.log(`   Size: ${icon.size}x${icon.size}px`);
    console.log(`   File: ${fileSizeKB} KB`);
    console.log(`   Use: ${icon.description}`);
    console.log('');
  }
  
  console.log('✨ All icons generated successfully!\n');
  console.log('📋 Next steps:');
  console.log('   1. Check icons: http://localhost:3000/icon-192x192.png');
  console.log('   2. Verify manifest: Chrome DevTools → Application → Manifest');
  console.log('   3. Test PWA: Lighthouse → PWA audit');
}

main().catch((error) => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
