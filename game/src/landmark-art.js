// The village landmarks, before and after restoration: the lily pond (murky, then clear with ducks),
// the creek and its bridge (broken, then mended with bunting), and the bakery (boarded up, then open).
import { ellipse, PALETTE, roundRect, shadow } from './draw-kit.js';

/** The pond: murky and cluttered until cleaned, then clear blue with lilies and a family of ducks. */
export function drawPondLandmark(ctx, x, y, w, h, t, clean) {
  ellipse(ctx, x + w / 2, y + h / 2, w / 2 + 2, h / 2 - 2, clean ? '#5fae5a' : '#7f9a4a');
  ellipse(ctx, x + w / 2, y + h / 2, w / 2 - 4, h / 2 - 8, clean ? PALETTE.water : '#7d8a52');
  if (!clean) {
    // scum, an old crate and a boot
    for (const [px, py, r] of [[0.3, 0.4, 8], [0.62, 0.62, 10], [0.5, 0.3, 5]]) ellipse(ctx, x + w * px, y + h * py, r, r * 0.5, 'rgba(120, 140, 60, 0.8)');
    ctx.save();
    ctx.translate(x + w * 0.62, y + h * 0.45);
    ctx.rotate(0.3 + Math.sin(t) * 0.05);
    ctx.fillStyle = '#8a6a44';
    ctx.fillRect(-9, -7, 18, 14);
    ctx.strokeStyle = '#5e452c';
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -7, 18, 14);
    ctx.restore();
    ellipse(ctx, x + w * 0.32, y + h * 0.62, 7, 4, '#4a3a30');
    ctx.fillStyle = '#4a3a30';
    ctx.fillRect(x + w * 0.32 - 5, y + h * 0.62 - 9, 5, 8);
    // reeds
    ctx.strokeStyle = '#6a7a3a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 8 + i * 5, y + h - 14);
      ctx.lineTo(x + 6 + i * 6, y + h - 32 - (i % 2) * 6);
      ctx.stroke();
    }
    return;
  }
  ellipse(ctx, x + w / 2 - 12, y + h / 2 - 10, 14, 4, 'rgba(255,255,255,0.4)');
  for (const [px, py] of [[0.25, 0.62], [0.72, 0.36], [0.4, 0.3]]) {
    ellipse(ctx, x + w * px, y + h * py + Math.sin(t + px * 9) * 1.5, 8, 4.5, '#5fbf55');
  }
  ellipse(ctx, x + w * 0.72 + 3, y + h * 0.36 - 2, 3, 3, '#ff9fc0');
  ellipse(ctx, x + w * 0.25 - 2, y + h * 0.62 - 2, 3, 3, '#fff6e0');
  // ducks paddling round
  for (let i = 0; i < 3; i += 1) {
    const a = t * 0.5 + i * 0.55;
    const dx = x + w / 2 + Math.cos(a) * (w / 2 - 20);
    const dy = y + h / 2 + Math.sin(a) * (h / 2 - 22);
    drawDuck(ctx, dx, dy, i === 0 ? 1 : 0.65, Math.sin(a) > 0 ? -1 : 1);
  }
}

function drawDuck(ctx, x, y, s, face) {
  ellipse(ctx, x, y + 3 * s, 9 * s, 3 * s, 'rgba(255, 255, 255, 0.4)');
  ellipse(ctx, x, y, 8 * s, 5.5 * s, s > 0.8 ? '#fff6e0' : '#ffe36e');
  ellipse(ctx, x + face * 6 * s, y - 5 * s, 4 * s, 4 * s, s > 0.8 ? '#3f9a5a' : '#ffe36e');
  ellipse(ctx, x + face * 10 * s, y - 4 * s, 2.6 * s, 1.4 * s, '#ff9a3c');
  ellipse(ctx, x + face * 7 * s, y - 6 * s, 0.9 * s + 0.3, 0.9 * s + 0.3, PALETTE.ink);
}

/** The creek running down the east side (drawn once into the cached ground). */
export function drawCreek(ctx, x, y, w, rows) {
  const h = rows * w;
  ctx.fillStyle = '#5fae5a';
  roundRect(ctx, x + 2, y - 6, w - 4, h + 12, 12);
  ctx.fill();
  ctx.fillStyle = '#6cc3e6';
  roundRect(ctx, x + 8, y - 2, w - 16, h + 6, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < rows * 2; i += 1) ctx.fillRect(x + 14 + (i % 3) * 6, y + 8 + i * 24, 10, 2);
  for (let i = 0; i < rows; i += 1) {
    ellipse(ctx, x + 6, y + 20 + i * w, 5, 4, '#a9a39a');
    ellipse(ctx, x + w - 6, y + 36 + i * w, 4, 3, '#b8b2a8');
  }
}

/** The bridge over the creek: a gap with dangling planks until fixed, then sturdy with bunting. */
export function drawBridge(ctx, x, y, s, t, fixed) {
  if (!fixed) {
    ctx.fillStyle = '#7a5a3a';
    for (const px of [x - 2, x + s - 6]) {
      ctx.fillRect(px, y + 6, 8, s - 10);
    }
    ctx.save();
    ctx.translate(x + 6, y + s / 2 - 2);
    ctx.rotate(0.5 + Math.sin(t * 1.5) * 0.06);
    ctx.fillStyle = '#b07a4a';
    ctx.fillRect(0, -4, 20, 8);
    ctx.restore();
    ctx.save();
    ctx.translate(x + s - 4, y + s / 2 + 4);
    ctx.rotate(2.6 + Math.sin(t * 1.2) * 0.05);
    ctx.fillStyle = '#a06c40';
    ctx.fillRect(0, -4, 18, 8);
    ctx.restore();
    ctx.strokeStyle = '#8a6a44';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 8);
    ctx.quadraticCurveTo(x + s / 2, y + s * 0.7, x + s - 2, y + 8);
    ctx.stroke();
    return;
  }
  shadow(ctx, x + s / 2, y + s - 2, s * 0.6, 5);
  ctx.fillStyle = '#c68e58';
  roundRect(ctx, x - 8, y + 6, s + 16, s - 12, 6);
  ctx.fill();
  ctx.fillStyle = '#a8703c';
  for (let i = 0; i < 6; i += 1) ctx.fillRect(x - 6 + i * 11, y + 7, 2, s - 14);
  // rails and posts
  ctx.fillStyle = '#8a5a33';
  for (const py of [y + 2, y + s - 10]) {
    ctx.fillRect(x - 10, py, s + 20, 4);
    for (const px of [x - 10, x + s / 2 - 2, x + s + 6]) ctx.fillRect(px, py - 6, 5, 12);
  }
  // bunting
  const colors = ['#ff6f91', '#ffcf40', '#7fcf6e', '#5fb2e8'];
  for (let i = 0; i < 6; i += 1) {
    const bx = x - 6 + i * 11;
    const by = y - 3 + Math.sin(i / 5 * Math.PI) * 4 + Math.sin(t * 2 + i) * 0.8;
    ctx.fillStyle = colors[i % 4];
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + 9, by);
    ctx.lineTo(bx + 4.5, by + 9);
    ctx.closePath();
    ctx.fill();
  }
}

/** The village bakery: boarded up with a faded awning, or open with a striped awning and bread. */
export function drawBakery(ctx, x, y, w, h, t, open) {
  shadow(ctx, x + w / 2, y + h + 2, w * 0.55, 7);
  roundRect(ctx, x + 6, y + 26, w - 12, h - 26, 6);
  ctx.fillStyle = open ? '#ffe3c8' : '#d9c8b4';
  ctx.fill();
  // roof
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 30);
  ctx.lineTo(x + w / 2, y - 8);
  ctx.lineTo(x + w + 2, y + 30);
  ctx.closePath();
  ctx.fillStyle = open ? '#c8735a' : '#9a8478';
  ctx.fill();
  // chimney (smoke when baking)
  ctx.fillStyle = '#9a6a5a';
  ctx.fillRect(x + w - 30, y - 6, 10, 18);
  if (open) {
    for (let i = 0; i < 4; i += 1) {
      const p = (t * 0.3 + i / 4) % 1;
      ellipse(ctx, x + w - 25 + Math.sin(p * 6 + i) * 4, y - 10 - p * 40, 4 + p * 7, 4 + p * 6, `rgba(255,255,255,${0.6 * (1 - p)})`);
    }
  }
  // awning
  const stripes = 6;
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle = open ? (i % 2 ? '#fff6e0' : '#ff8fa8') : (i % 2 ? '#cfc4b4' : '#b9a89a');
    ctx.beginPath();
    const sx = x + 4 + (i * (w - 8)) / stripes;
    ctx.moveTo(sx, y + 34);
    ctx.lineTo(sx + (w - 8) / stripes, y + 34);
    ctx.lineTo(sx + (w - 8) / stripes, y + 44);
    ctx.arc(sx + (w - 8) / stripes / 2, y + 44, (w - 8) / stripes / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  // window and door
  roundRect(ctx, x + 12, y + 54, 30, 22, 4);
  ctx.fillStyle = open ? '#ffe7a8' : '#8a7a6a';
  ctx.fill();
  roundRect(ctx, x + w - 34, y + h - 32, 22, 32, 7);
  ctx.fillStyle = '#9b6238';
  ctx.fill();
  if (open) {
    // loaves in the window and a bread sign
    for (let i = 0; i < 3; i += 1) ellipse(ctx, x + 19 + i * 8, y + 70, 4.5, 3, '#d9903a');
    ellipse(ctx, x + w / 2, y + 16, 14, 8, '#e9a24a');
    ctx.fillStyle = '#c47a2a';
    for (let i = 0; i < 3; i += 1) ctx.fillRect(x + w / 2 - 7 + i * 6, y + 12, 2, 8);
  } else {
    // boards across the window and the door
    ctx.fillStyle = '#a07a52';
    ctx.save();
    ctx.translate(x + 27, y + 65);
    ctx.rotate(-0.35);
    ctx.fillRect(-20, -3, 40, 6);
    ctx.rotate(0.7);
    ctx.fillRect(-20, -3, 40, 6);
    ctx.restore();
    ctx.fillRect(x + w - 38, y + h - 22, 30, 6);
  }
}

/** A bobbing bubble over a landmark that still needs help: a hammer and a progress ring. */
export function drawRestoreMarker(ctx, x, y, progress, t, locked) {
  const by = y + Math.sin(t * 2.5) * 3;
  ctx.beginPath();
  ctx.arc(x, by, 15, 0, Math.PI * 2);
  ctx.fillStyle = locked ? 'rgba(255, 246, 224, 0.75)' : 'rgba(255, 246, 224, 0.96)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(138, 90, 51, 0.25)';
  ctx.stroke();
  if (progress > 0) {
    ctx.beginPath();
    ctx.arc(x, by, 15, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.strokeStyle = '#7fcf6e';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(x, by);
  ctx.rotate(-0.6 + Math.sin(t * 5) * 0.15);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(-1.8, -4, 3.6, 13);
  ctx.fillStyle = '#7d8a96';
  roundRect(ctx, -7, -9, 14, 6, 2);
  ctx.fill();
  ctx.restore();
}
