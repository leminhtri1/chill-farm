// The farm's buildings and fixtures: cottage, market stall, order board, well, compost, scarecrow and sprinklers.
import { ellipse, PALETTE, roundRect, shadow } from './draw-kit.js';
import { drawProduce } from './crop-art.js';
import { drawSprinklerIcon } from './icon-art.js';

export function drawHouse(ctx, x, y, w, h, night) {
  shadow(ctx, x + w / 2, y + h + 4, w * 0.55, 8);
  // walls
  roundRect(ctx, x + 8, y + 30, w - 16, h - 30, 6);
  ctx.fillStyle = '#fbe6c4';
  ctx.fill();
  ctx.fillStyle = '#e9cfa3';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(x + 8, y + 42 + i * 13, w - 16, 2);
  // roof
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 36);
  ctx.lineTo(x + w / 2, y - 10);
  ctx.lineTo(x + w + 4, y + 36);
  ctx.closePath();
  ctx.fillStyle = PALETTE.roof;
  ctx.fill();
  ctx.fillStyle = '#c9534a';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(x + 16 + i * 4, y + 22 - i * 10, w - 32 - i * 8, 3);
  }
  // chimney
  ctx.fillStyle = '#a65a4a';
  ctx.fillRect(x + w - 40, y - 2, 12, 22);
  // door and windows
  roundRect(ctx, x + w / 2 - 11, y + h - 34, 22, 34, 8);
  ctx.fillStyle = '#9b6238';
  ctx.fill();
  ellipse(ctx, x + w / 2 + 6, y + h - 16, 2, 2, PALETTE.gold);
  const glass = night ? '#ffe28a' : '#9ad7f0';
  for (const wx of [x + 22, x + w - 44]) {
    roundRect(ctx, wx, y + 50, 22, 18, 4);
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = '#fff6e0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff6e0';
    ctx.fillRect(wx + 10, y + 50, 2, 18);
  }
  // flower boxes
  for (const wx of [x + 22, x + w - 44]) {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(wx - 2, y + 68, 26, 5);
    for (let i = 0; i < 4; i += 1) ellipse(ctx, wx + 3 + i * 6, y + 66, 2.6, 2.6, i % 2 ? '#ff8fb1' : '#ffd84f');
  }
}

export function drawChimneySmoke(ctx, x, y, t) {
  for (let i = 0; i < 4; i += 1) {
    const p = (t * 0.25 + i / 4) % 1;
    ellipse(ctx, x + Math.sin(p * 6 + i) * 5, y - p * 46, 4 + p * 8, 4 + p * 7, `rgba(255,255,255,${0.55 * (1 - p)})`);
  }
}

export function drawStall(ctx, x, y, w, h, t) {
  shadow(ctx, x + w / 2, y + h + 2, w * 0.5, 7);
  // counter
  roundRect(ctx, x + 4, y + h - 40, w - 8, 40, 5);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.fillStyle = PALETTE.woodDark;
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 4, y + h - 30 + i * 11, w - 8, 2);
  // posts
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 8, y + 14, 5, h - 50);
  ctx.fillRect(x + w - 13, y + 14, 5, h - 50);
  // striped awning that flutters a little
  const stripes = 7;
  const sw = (w + 8) / stripes;
  for (let i = 0; i < stripes; i += 1) {
    const flutter = Math.sin(t * 3 + i) * 1.5;
    ctx.fillStyle = i % 2 ? '#fff6e0' : '#5fb6a8';
    ctx.beginPath();
    ctx.moveTo(x - 4 + i * sw, y + 4);
    ctx.lineTo(x - 4 + (i + 1) * sw, y + 4);
    ctx.lineTo(x - 4 + (i + 1) * sw, y + 26 + flutter);
    ctx.arc(x - 4 + (i + 0.5) * sw, y + 26 + flutter, sw / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  // produce crates on the counter
  const goods = ['turnip', 'carrot', 'pumpkin', 'berry'];
  goods.forEach((kind, i) => {
    const cx = x + 22 + i * ((w - 44) / 3);
    roundRect(ctx, cx - 12, y + h - 50, 24, 12, 3);
    ctx.fillStyle = '#c99a62';
    ctx.fill();
    drawProduce(ctx, kind, cx, y + h - 60, 20);
  });
  // sign
  roundRect(ctx, x + w / 2 - 30, y + h - 26, 60, 18, 5);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MARKET', x + w / 2, y + h - 17);
}

export function drawBoard(ctx, x, y, t, hasReady) {
  shadow(ctx, x + 24, y + 46, 18, 5);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 10, y + 20, 4, 26);
  ctx.fillRect(x + 34, y + 20, 4, 26);
  roundRect(ctx, x + 2, y + 2, 44, 30, 4);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  const notes = ['#fff1cf', '#ffe0ea', '#e2f4ff'];
  notes.forEach((c, i) => {
    ctx.save();
    ctx.translate(x + 10 + i * 13, y + 9);
    ctx.rotate((i - 1) * 0.12);
    ctx.fillStyle = c;
    ctx.fillRect(-1, 0, 11, 14);
    ctx.fillStyle = '#e45b5b';
    ctx.fillRect(3, 0, 3, 2);
    ctx.restore();
  });
  if (hasReady) {
    const b = Math.sin(t * 5) * 3;
    ellipse(ctx, x + 24, y - 12 + b, 9, 9, PALETTE.gold);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', x + 24, y - 11 + b);
  }
}

export function drawWell(ctx, x, y) {
  shadow(ctx, x + 24, y + 42, 22, 6);
  ellipse(ctx, x + 24, y + 30, 20, 12, '#9aa4ad');
  ellipse(ctx, x + 24, y + 27, 15, 8, '#3f6f8a');
  ellipse(ctx, x + 22, y + 26, 5, 2, 'rgba(255,255,255,0.4)');
  ctx.fillStyle = '#8a939c';
  ctx.fillRect(x + 4, y + 28, 40, 10);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 6, y - 2, 4, 32);
  ctx.fillRect(x + 38, y - 2, 4, 32);
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x + 24, y - 14);
  ctx.lineTo(x + 48, y + 2);
  ctx.closePath();
  ctx.fillStyle = PALETTE.roof;
  ctx.fill();
  roundRect(ctx, x + 18, y + 8, 12, 10, 2);
  ctx.fillStyle = '#7fb6d9';
  ctx.fill();
}

export function drawScarecrow(ctx, x, y, level, t) {
  shadow(ctx, x, y + 20, 12, 4);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x - 2, y - 12, 4, 32);
  ctx.fillRect(x - 18, y - 4, 36, 4);
  const wave = Math.sin(t * 2) * 2;
  roundRect(ctx, x - 9, y - 8, 18, 18, 4);
  ctx.fillStyle = level > 1 ? '#7a6bd1' : '#d0584c';
  ctx.fill();
  ellipse(ctx, x - 18, y - 2 + wave, 4, 3, '#f2c65a');
  ellipse(ctx, x + 18, y - 2 - wave, 4, 3, '#f2c65a');
  ellipse(ctx, x, y - 17, 8, 8, '#f6e2b0');
  ellipse(ctx, x - 3, y - 17, 1.4, 1.4, PALETTE.ink);
  ellipse(ctx, x + 3, y - 17, 1.4, 1.4, PALETTE.ink);
  ellipse(ctx, x, y - 23, 12, 3.5, '#c9973f');
  ctx.beginPath();
  ctx.ellipse(x, y - 24, 6, 6, 0, Math.PI, 0);
  ctx.fillStyle = '#d9a84f';
  ctx.fill();
  if (level > 1) {
    // a sleepy owl friend on the arm
    ellipse(ctx, x + 15, y - 12, 6, 7, '#a7845e');
    ellipse(ctx, x + 13, y - 14, 2, 2, '#fff6e0');
    ellipse(ctx, x + 17, y - 14, 2, 2, '#fff6e0');
  }
}

export function drawCompost(ctx, x, y, level) {
  shadow(ctx, x + 24, y + 42, 20, 5);
  roundRect(ctx, x + 4, y + 10, 40, 30, 4);
  ctx.fillStyle = level > 0 ? '#8a5a33' : '#a8835e';
  ctx.fill();
  ctx.fillStyle = '#6e4628';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 4, y + 16 + i * 8, 40, 2);
  if (level > 0) {
    ellipse(ctx, x + 24, y + 10, 16, 7, '#5e3b26');
    ellipse(ctx, x + 18, y + 7, 4, 3, '#6cc35a');
    ellipse(ctx, x + 30, y + 8, 3, 2, '#f28c28');
  }
}

export function drawSprinkler(ctx, x, y, t, spraying) {
  drawSprinklerIcon(ctx, x, y - 4, 26, t);
  if (spraying > 0) {
    ctx.strokeStyle = `rgba(150, 215, 255, ${Math.min(1, spraying) * 0.7})`;
    ctx.lineWidth = 2;
    const r = 30 + (1 - spraying) * 40;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
