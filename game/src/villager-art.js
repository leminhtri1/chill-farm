// The villagers in the field (with a heart badge), their big portraits for panels, hearts, and the
// icons on the perk cards.
import { ellipse, PALETTE, roundRect, shadow, star } from './draw-kit.js';
import { drawCoin } from './icon-art.js';
import { drawCrow } from './critter-art.js';
import { drawJar, drawKettle } from './workshop-art.js';
import { VILLAGERS } from './config.js';

export function drawHeart(ctx, x, y, size, fill = '#ff5d7a', stroke = '#b8324e') {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.8, y - s * 1.2, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.8, y - s * 1.2, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.strokeStyle = stroke;
  ctx.stroke();
  if (fill !== '#e8d8c0') ellipse(ctx, x - s * 0.4, y - s * 0.35, s * 0.18, s * 0.12, 'rgba(255,255,255,0.7)');
}

/** A row of hearts, filled up to `hearts` of `max`. */
export function drawHeartRow(ctx, x, y, size, hearts, max, gap = size * 1.15) {
  for (let i = 0; i < max; i += 1) {
    drawHeart(ctx, x + i * gap, y, size, i < hearts ? '#ff5d7a' : '#e8d8c0', i < hearts ? '#b8324e' : '#c8b498');
  }
}

/** A villager standing at (x, y), bobbing gently, with a heart badge over the head. */
export function drawVillager(ctx, id, x, y, t, hearts) {
  const look = VILLAGERS[id];
  const s = look.small ? 0.85 : 1;
  const bob = Math.sin(t * 2 + x) * 0.8;
  shadow(ctx, x, y + 20 * s, 12 * s, 4);
  ctx.save();
  ctx.translate(x, y + 20 * s);
  ctx.scale(s, s);
  ctx.translate(0, -20);
  ellipse(ctx, -5, 17, 4, 4.5, '#5a3d2b');
  ellipse(ctx, 5, 17, 4, 4.5, '#5a3d2b');
  roundRect(ctx, -11, 1 - bob, 22, 18, 8);
  ctx.fillStyle = look.shirt;
  ctx.fill();
  if (id === 'bo') {
    roundRect(ctx, -7, 6 - bob, 14, 13, 4);
    ctx.fillStyle = '#fff6e0';
    ctx.fill();
  }
  ellipse(ctx, -12, 9 - bob, 3.5, 4.5, look.skin);
  ellipse(ctx, 12, 9 - bob, 3.5, 4.5, look.skin);
  drawHead(ctx, id, 0, -9 - bob, 1, t);
  ctx.restore();
  if (hearts > 0) {
    roundRect(ctx, x - 17, y - 44, 34, 18, 9);
    ctx.fillStyle = 'rgba(255, 246, 224, 0.95)';
    ctx.fill();
    drawHeart(ctx, x - 7, y - 35, 11);
    ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#b8324e';
    ctx.fillText(`${hearts}`, x + 1, y - 34.5);
  }
}

/** A villager's head at scale k (1 = field size), used by the sprite and the portraits. */
function drawHead(ctx, id, x, y, k, t) {
  const look = VILLAGERS[id];
  // hair behind
  if (id === 'fern') ellipse(ctx, x, y - 9 * k, 7 * k, 6 * k, look.hair);
  if (id === 'pip') {
    ellipse(ctx, x - 11 * k, y + 2 * k, 4 * k, 6 * k, look.hair);
    ellipse(ctx, x + 11 * k, y + 2 * k, 4 * k, 6 * k, look.hair);
  }
  ellipse(ctx, x, y, 11 * k, 10 * k, look.skin);
  // hair on top
  ctx.beginPath();
  ctx.ellipse(x, y - 3 * k, 11.5 * k, 8 * k, 0, Math.PI, 0);
  ctx.fillStyle = look.hair;
  ctx.fill();
  const blink = Math.sin(t * 1.1 + x) > 0.97;
  ctx.fillStyle = PALETTE.ink;
  if (blink) {
    ctx.fillRect(x - 5 * k, y + 1 * k, 3 * k, 1.2 * k);
    ctx.fillRect(x + 2 * k, y + 1 * k, 3 * k, 1.2 * k);
  } else {
    ellipse(ctx, x - 3.6 * k, y + 1 * k, 1.6 * k, 2 * k, PALETTE.ink);
    ellipse(ctx, x + 3.6 * k, y + 1 * k, 1.6 * k, 2 * k, PALETTE.ink);
  }
  ellipse(ctx, x - 6.5 * k, y + 4.5 * k, 2.4 * k, 1.5 * k, 'rgba(255, 120, 120, 0.6)');
  ellipse(ctx, x + 6.5 * k, y + 4.5 * k, 2.4 * k, 1.5 * k, 'rgba(255, 120, 120, 0.6)');
  ctx.beginPath();
  ctx.arc(x, y + 4.5 * k, 2 * k, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.2 * k;
  ctx.stroke();
  if (id === 'fern') {
    // round glasses
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = 1 * k;
    ctx.beginPath();
    ctx.arc(x - 3.6 * k, y + 1 * k, 3 * k, 0, Math.PI * 2);
    ctx.moveTo(x + 6.6 * k, y + 1 * k);
    ctx.arc(x + 3.6 * k, y + 1 * k, 3 * k, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (look.hat) {
    // a puffy baker's hat
    ellipse(ctx, x, y - 13 * k, 10 * k, 6 * k, '#ffffff');
    ellipse(ctx, x - 5 * k, y - 15 * k, 5 * k, 5 * k, '#ffffff');
    ellipse(ctx, x + 5 * k, y - 15 * k, 5 * k, 5 * k, '#ffffff');
    ctx.fillStyle = '#f0ece4';
    ctx.fillRect(x - 9 * k, y - 11 * k, 18 * k, 4 * k);
  }
  if (id === 'pip') ellipse(ctx, x + 7 * k, y - 9 * k, 3 * k, 2.4 * k, '#ff6f91');
}

/** A big round portrait for panels: the villager's head and shoulders in a frame. */
export function drawPortrait(ctx, id, x, y, r, t) {
  const look = VILLAGERS[id];
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = { fern: '#e9e0f6', bo: '#ffe9cf', pip: '#dff1ff' }[id];
  ctx.fill();
  ctx.clip();
  const k = r / 20;
  ellipse(ctx, x, y + r * 0.95, r * 0.75, r * 0.5, look.shirt);
  drawHead(ctx, id, x, y + r * 0.05, k, t);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.strokeStyle = '#c98d55';
  ctx.stroke();
}

/** The big icon on a perk card. */
export function drawPerkIcon(ctx, icon, x, y, size, t) {
  const s = size;
  if (icon === 'sprout') {
    ellipse(ctx, x, y + s * 0.32, s * 0.36, s * 0.12, '#8b5c3a');
    ctx.fillStyle = '#4fa84a';
    ctx.fillRect(x - s * 0.03, y - s * 0.1, s * 0.06, s * 0.42);
    ellipse(ctx, x - s * 0.18, y - s * 0.12, s * 0.2, s * 0.1, '#6fd062', -0.5);
    ellipse(ctx, x + s * 0.18, y - s * 0.24, s * 0.22, s * 0.11, '#5fbf55', 0.5);
  } else if (icon === 'coin') {
    drawCoin(ctx, x - s * 0.12, y + s * 0.08, s * 0.26);
    drawCoin(ctx, x + s * 0.14, y - s * 0.12, s * 0.26);
  } else if (icon === 'jar') {
    drawJar(ctx, x - s * 0.16, y + s * 0.4, s * 0.62, '#e8395a', 0.85);
    drawJar(ctx, x + s * 0.2, y + s * 0.42, s * 0.5, '#ff9a3c', 0.7);
  } else if (icon === 'clock') {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.36, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6e0';
    ctx.fill();
    ctx.lineWidth = s * 0.06;
    ctx.strokeStyle = '#d7884a';
    ctx.stroke();
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - s * 0.24);
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * 0.16 * Math.cos(t * 3), y + s * 0.16 * Math.sin(t * 3));
    ctx.strokeStyle = PALETTE.ink;
    ctx.stroke();
    ctx.lineCap = 'butt';
  } else if (icon === 'kettle') {
    drawKettle(ctx, x, y + s * 0.05, s * 0.8, 'berry', 0.6, t);
  } else if (icon === 'star') {
    ctx.fillStyle = '#ffcf40';
    star(ctx, x, y, s * 0.4);
    ctx.fillStyle = '#fff3a8';
    star(ctx, x - s * 0.04, y - s * 0.04, s * 0.18);
  } else if (icon === 'crow') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 40, s / 40);
    drawCrow(ctx, 0, 0, 1, 0, true);
    ctx.restore();
    ctx.strokeStyle = '#e04a4a';
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.42, 0, Math.PI * 2);
    ctx.moveTo(x - s * 0.3, y - s * 0.3);
    ctx.lineTo(x + s * 0.3, y + s * 0.3);
    ctx.stroke();
  } else if (icon === 'heart') {
    drawHeart(ctx, x, y, s * 0.7);
  }
}
