// The preserves workshop and its goods: the little stone workshop with a jar sign and steam, glass
// jars of jam and juice (small on the shelf, big in the workshop panel) and the copper kettles.
import { ellipse, PALETTE, roundRect, shadow } from './draw-kit.js';
import { PRESERVES } from './config.js';

/** The workshop building at (x, y) with size w x h; jars on the shelf, steam when kettles cook. */
export function drawWorkshop(ctx, x, y, w, h, t, busy, jars) {
  shadow(ctx, x + w / 2, y + h + 2, w * 0.55, 8);
  // stone walls
  roundRect(ctx, x + 6, y + 26, w - 12, h - 26, 6);
  ctx.fillStyle = '#e9dcc6';
  ctx.fill();
  ctx.fillStyle = 'rgba(160, 130, 100, 0.35)';
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 6; i += 1) {
      const sx = x + 10 + i * 22 + (row % 2) * 11;
      if (sx + 16 < x + w - 8) {
        roundRect(ctx, sx, y + 36 + row * 16, 16, 10, 3);
        ctx.fill();
      }
    }
  }
  // green roof
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 32);
  ctx.lineTo(x + 18, y - 6);
  ctx.lineTo(x + w - 18, y - 6);
  ctx.lineTo(x + w + 4, y + 32);
  ctx.closePath();
  ctx.fillStyle = '#5fa86a';
  ctx.fill();
  ctx.fillStyle = '#4b8f57';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 8 + i * 6, y + 22 - i * 10, w - 16 - i * 12, 3);
  // chimney with steam while kettles cook
  ctx.fillStyle = '#a0756a';
  ctx.fillRect(x + 22, y - 18, 12, 18);
  if (busy) {
    for (let i = 0; i < 5; i += 1) {
      const p = (t * 0.45 + i / 5) % 1;
      ellipse(ctx, x + 28 + Math.sin(p * 7 + i) * 6, y - 22 - p * 50, 5 + p * 9, 4 + p * 8, `rgba(255, 255, 255, ${0.75 * (1 - p)})`);
    }
  }
  // door facing the path (east side)
  roundRect(ctx, x + w - 34, y + h - 38, 22, 38, 8);
  ctx.fillStyle = '#9b6238';
  ctx.fill();
  ellipse(ctx, x + w - 17, y + h - 19, 2, 2, PALETTE.gold);
  // a big jar sign hanging over the door
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w - 23, y + 22);
  ctx.lineTo(x + w - 23, y + 30);
  ctx.stroke();
  ellipse(ctx, x + w - 23, y + 40, 15, 13, '#fff1cf');
  ctx.strokeStyle = '#8a5a33';
  ctx.stroke();
  drawJar(ctx, x + w - 23, y + 42, 15, '#e8395a', 1);
  // window shelf with jars (the pantry)
  roundRect(ctx, x + 12, y + 44, w - 58, 30, 5);
  ctx.fillStyle = busy ? '#ffe7a8' : '#cfe8f2';
  ctx.fill();
  ctx.strokeStyle = '#fff6e0';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  const shown = Math.min(4, jars.length);
  for (let i = 0; i < shown; i += 1) drawJar(ctx, x + 22 + i * 13, y + 66, 13, jars[i], 1);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(x + 10, y + 72, w - 54, 5);
}

/** A glass jar of preserves: size is its height, fill 0..1 how full it is. */
export function drawJar(ctx, x, y, size, color, fill = 1) {
  const w = size * 0.78;
  const h = size;
  // glass body
  roundRect(ctx, x - w / 2, y - h * 0.8, w, h * 0.8, size * 0.18);
  ctx.fillStyle = 'rgba(230, 245, 255, 0.85)';
  ctx.fill();
  // contents
  const top = y - h * 0.8 * fill;
  ctx.save();
  roundRect(ctx, x - w / 2, y - h * 0.8, w, h * 0.8, size * 0.18);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, top, w, y - top);
  ctx.restore();
  roundRect(ctx, x - w / 2, y - h * 0.8, w, h * 0.8, size * 0.18);
  ctx.strokeStyle = 'rgba(90, 70, 60, 0.55)';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.stroke();
  // shine, label and gingham lid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(x - w * 0.36, y - h * 0.7, w * 0.12, h * 0.48);
  roundRect(ctx, x - w * 0.3, y - h * 0.42, w * 0.6, h * 0.22, size * 0.05);
  ctx.fillStyle = '#fff6e0';
  ctx.fill();
  roundRect(ctx, x - w * 0.58, y - h * 0.98, w * 1.16, h * 0.22, size * 0.08);
  ctx.fillStyle = '#e45b5b';
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x - w * 0.45 + i * w * 0.36, y - h * 0.96, w * 0.14, h * 0.18);
}

/** A big copper kettle bubbling with one crop's preserve; progress 0..1. */
export function drawKettle(ctx, x, y, size, kind, progress, t) {
  const color = kind ? PRESERVES.colors[kind] : '#d8c8b0';
  // fire under it while cooking
  if (kind) {
    for (let i = 0; i < 3; i += 1) {
      const f = Math.sin(t * 9 + i * 2) * 0.15 + 0.85;
      ellipse(ctx, x - size * 0.22 + i * size * 0.22, y + size * 0.42, size * 0.09, size * 0.16 * f, i === 1 ? '#ffcf40' : '#ff8a3c');
    }
  }
  ctx.fillStyle = '#6b4a3a';
  ctx.fillRect(x - size * 0.42, y + size * 0.3, size * 0.06, size * 0.22);
  ctx.fillRect(x + size * 0.36, y + size * 0.3, size * 0.06, size * 0.22);
  // pot
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.48, size * 0.4, 0, 0, Math.PI);
  ctx.lineTo(x - size * 0.48, y - size * 0.06);
  ctx.closePath();
  ctx.fillStyle = '#d7884a';
  ctx.fill();
  ellipse(ctx, x - size * 0.18, y + size * 0.12, size * 0.1, size * 0.16, 'rgba(255, 220, 170, 0.45)');
  // rim and the jam inside
  ellipse(ctx, x, y - size * 0.04, size * 0.5, size * 0.13, '#b86a32');
  ellipse(ctx, x, y - size * 0.03, size * 0.43, size * 0.1, kind ? color : '#7a5a44');
  if (kind) {
    for (let i = 0; i < 4; i += 1) {
      const p = (t * 1.6 + i * 0.27) % 1;
      ellipse(ctx, x - size * 0.25 + i * size * 0.17, y - size * 0.06 - p * size * 0.08, size * 0.035 * (1 - p) + 1, size * 0.035 * (1 - p) + 1, 'rgba(255, 255, 255, 0.7)');
    }
    for (let i = 0; i < 3; i += 1) {
      const p = (t * 0.6 + i / 3) % 1;
      ellipse(ctx, x - size * 0.15 + i * size * 0.15 + Math.sin(p * 6 + i) * 4, y - size * 0.18 - p * size * 0.5, size * 0.06 + p * size * 0.08, size * 0.05 + p * size * 0.07, `rgba(255, 255, 255, ${0.6 * (1 - p)})`);
    }
  }
  // progress ring
  if (kind) {
    ctx.beginPath();
    ctx.arc(x + size * 0.42, y - size * 0.42, size * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6e0';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.42, y - size * 0.42);
    ctx.arc(x + size * 0.42, y - size * 0.42, size * 0.13, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#7fcf6e';
    ctx.fill();
  }
}
