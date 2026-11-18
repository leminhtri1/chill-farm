// Small icons for the HUD and panels: sprinkler, coin, water drop and festival ribbon.
import { ellipse, PALETTE } from './draw-kit.js';

export function drawSprinklerIcon(ctx, x, y, size, t = 0) {
  const s = size / 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ellipse(ctx, 0, 8, 10, 4, '#7f8a95');
  ctx.fillStyle = '#a9b4bf';
  ctx.fillRect(-3, -6, 6, 14);
  ellipse(ctx, 0, -7, 6, 4, '#c9d3dc');
  ctx.rotate(t * 4);
  ctx.fillStyle = '#5aa6d6';
  ctx.fillRect(-9, -8, 18, 2);
  ctx.restore();
}

export function drawCoin(ctx, x, y, r) {
  ellipse(ctx, x, y, r, r, '#f2b632');
  ellipse(ctx, x, y, r * 0.75, r * 0.75, PALETTE.gold);
  ctx.fillStyle = '#e09a1c';
  ctx.font = `bold ${Math.round(r * 1.2)}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('c', x, y + 0.5);
}

export function drawDrop(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.5);
  ctx.quadraticCurveTo(x + r, y - r * 0.2, x + r, y + r * 0.3);
  ctx.arc(x, y + r * 0.3, r, 0, Math.PI);
  ctx.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.5);
  ctx.fillStyle = '#5fb2e8';
  ctx.fill();
  ellipse(ctx, x - r * 0.35, y, r * 0.25, r * 0.35, 'rgba(255,255,255,0.7)');
}

export function drawRibbon(ctx, x, y, size, color) {
  ctx.fillStyle = color === 'gold' ? '#e0a92a' : color === 'blue' ? '#3f7fd1' : '#5fae5a';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.15, y);
    ctx.lineTo(x + side * size * 0.45, y + size * 1.1);
    ctx.lineTo(x + side * size * 0.25, y + size * 0.95);
    ctx.lineTo(x + side * size * 0.1, y + size * 1.15);
    ctx.lineTo(x - side * size * 0.05, y + size * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  const petal = color === 'gold' ? '#ffcf40' : color === 'blue' ? '#5f9ff0' : '#7fcf6e';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * size * 0.42, y + Math.sin(a) * size * 0.42, size * 0.18, size * 0.18, petal);
  }
  ellipse(ctx, x, y, size * 0.38, size * 0.38, PALETTE.cream);
  ellipse(ctx, x, y, size * 0.3, size * 0.3, petal);
}
