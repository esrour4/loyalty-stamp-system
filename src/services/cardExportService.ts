import QRCode from 'qrcode';
import { Customer, StoreSettings } from '../types';

export class CardExportService {
  /**
   * Render digital stamp card to high-res Canvas and download as PNG
   */
  static async downloadCardImage(customer: Customer, settings: StoreSettings): Promise<void> {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw rounded card background with luxury coffee gradient
    const radius = 36;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(1000 - radius, 0);
    ctx.quadraticCurveTo(1000, 0, 1000, radius);
    ctx.lineTo(1000, 600 - radius);
    ctx.quadraticCurveTo(1000, 600, 1000 - radius, 600);
    ctx.lineTo(radius, 600);
    ctx.quadraticCurveTo(0, 600, 0, 600 - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    // Background gradient based on primary color
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 600);
    bgGrad.addColorStop(0, '#1c130e');
    bgGrad.addColorStop(0.5, '#2e1c14');
    bgGrad.addColorStop(1, '#150d09');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 600);

    // Subtle decorative arcs
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(900, 100, 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100, 500, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Top gold accent bar
    const goldBar = ctx.createLinearGradient(0, 0, 1000, 0);
    goldBar.addColorStop(0, '#d97706');
    goldBar.addColorStop(0.5, '#fef08a');
    goldBar.addColorStop(1, '#b45309');
    ctx.fillStyle = goldBar;
    ctx.fillRect(0, 0, 1000, 12);

    // 2. Store Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Plus Jakarta Sans", "Cairo", sans-serif';
    const shopTitle = settings.shopNameEn || 'Artisan Coffee Roasters';
    ctx.fillText(shopTitle.toUpperCase(), 60, 80);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '20px "Plus Jakarta Sans", "Cairo", sans-serif';
    ctx.fillText(settings.sloganEn || 'STAMP & LOYALTY REWARDS CLUB', 60, 114);

    // Tier badge
    ctx.fillStyle = '#37271e';
    ctx.beginPath();
    ctx.roundRect(760, 50, 180, 48, 24);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${customer.tier.toUpperCase()} TIER`, 850, 81);
    ctx.textAlign = 'left';

    // 3. Customer Info Section
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MEMBER NAME', 60, 175);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Plus Jakarta Sans", "Cairo", sans-serif';
    ctx.fillText(customer.name, 60, 215);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CARD NUMBER', 60, 270);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(customer.cardNumber, 60, 308);

    // 4. Stamps Grid
    const maxStamps = settings.stampsForFreeDrink || 8;
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`COLLECTED STAMPS (${customer.currentStamps} / ${maxStamps})`, 60, 365);

    const startX = 60;
    const startY = 385;
    const gap = 16;
    const size = 52;

    for (let i = 0; i < maxStamps; i++) {
      const x = startX + (i % 4) * (size + gap);
      const y = startY + Math.floor(i / 4) * (size + gap);
      const isStamped = i < customer.currentStamps;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, 14);
      if (isStamped) {
        ctx.fillStyle = '#d97706';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☕', x + size / 2, y + size / 2 + 8);
      } else {
        ctx.fillStyle = '#261b14';
        ctx.fill();
        ctx.strokeStyle = '#452e21';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, x + size / 2, y + size / 2 + 6);
      }
      ctx.textAlign = 'left';
    }

    // 5. Generate & Draw QR Code on right side
    try {
      const qrDataUrl = await QRCode.toDataURL(customer.cardNumber, {
        margin: 1,
        width: 220,
        color: {
          dark: '#1c130e',
          light: '#ffffff',
        },
      });

      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });

      // White container for QR
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(720, 160, 220, 220, 20);
      ctx.fill();

      // Draw QR image
      ctx.drawImage(qrImg, 730, 170, 200, 200);

      // Scan instruction
      ctx.fillStyle = '#d1d5db';
      ctx.font = '14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN AT BARISTA COUNTER', 830, 410);
      ctx.textAlign = 'left';
    } catch (e) {
      console.error('Failed to draw QR on canvas:', e);
    }

    // 6. Bottom footer details
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Points: ${customer.totalPoints} pts • Referral Code: ${customer.referralCode} • NFC Enabled`, 60, 560);

    ctx.restore();

    // Trigger file download
    const link = document.createElement('a');
    link.download = `${customer.name.replace(/\s+/g, '_')}_Coffee_Loyalty_Card.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
