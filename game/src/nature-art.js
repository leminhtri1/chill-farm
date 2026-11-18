// The countryside: the pond, hedges, apple trees and meadow flowers.
import { ellipse, PALETTE, shadow } from './draw-kit.js';

export function drawPond(ctx, x, y, w, h, t) {
  ellipse(ctx, x + w / 2, y + h / 2, w / 2 + 2, h / 2 - 2, '#5fae5a');
  ellipse(ctx, x + w / 2, y + h / 2, w / 2 - 4, h / 2 - 8, PALETTE.water);
  ellipse(ctx, x + w / 2 - 12, y + h / 2 - 10, 14, 4, 'rgba(255,255,255,0.35)');
  for (const [px, py] of [[0.3, 0.6], [0.7, 0.4]]) {
    ellipse(ctx, x + w * px, y + h * py + Math.sin(t + px * 9) * 1.5, 7, 4, '#5fbf55');
  }
  ellipse(ctx, x + w * 0.7 + 3, y + h * 0.4 - 2, 2.5, 2.5, '#ff9fc0');
}

export function drawHedge(ctx, x, y, size, seed) {
  const r = size * 0.42;
  ellipse(ctx, x + size / 2, y + size * 0.62, r + 4, r * 0.9, PALETTE.hedgeDark);
  ellipse(ctx, x + size / 2 - 6, y + size * 0.48, r * 0.75, r * 0.7, PALETTE.hedge);
  ellipse(ctx, x + size / 2 + 7, y + size * 0.52, r * 0.7, r * 0.65, '#5aa854');
  if (seed % 3 === 0) ellipse(ctx, x + size / 2 + 4, y + size * 0.4, 3, 3, seed % 2 ? '#ff8fb1' : '#fff6e0');
}

export function drawTree(ctx, x, y, size, t) {
  shadow(ctx, x, y + size * 0.42, size * 0.4, 7);
  ctx.fillStyle = '#8a5a3b';
  ctx.fillRect(x - 5, y, 10, size * 0.42);
  const sway = Math.sin(t * 0.8 + x) * 1.5;
  ellipse(ctx, x + sway, y - size * 0.15, size * 0.45, size * 0.38, '#4a9a48');
  ellipse(ctx, x - 10 + sway, y - size * 0.25, size * 0.28, size * 0.25, '#5cb357');
  ellipse(ctx, x + 12 + sway, y - size * 0.05, size * 0.25, size * 0.22, '#3f8a40');
  ellipse(ctx, x + 6 + sway, y - size * 0.3, 4, 4, '#ff6f6f');
  ellipse(ctx, x - 12 + sway, y - size * 0.05, 4, 4, '#ff6f6f');
}

export function drawFlower(ctx, x, y, color) {
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2.2, 2.2, color);
  }
  ellipse(ctx, x, y, 1.6, 1.6, '#ffe36e');
}
