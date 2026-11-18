// The five crops at every growth stage, golden crops, and their produce for the hotbar, basket and shop.
import { ellipse, leaf, PALETTE, roundRect, sparkle, star } from './draw-kit.js';

/** A crop growing on a plot centred at (x, y); stage 0..3, 3 ripe. A golden crop glows and twinkles. */
export function drawCrop(ctx, kind, stage, x, y, t, wiggle = 0, golden = false) {
  if (golden && stage === 3) drawGoldenHalo(ctx, x, y, t);
  const sway = Math.sin(t * 2 + x * 0.05) * 0.05 + Math.sin(wiggle * 12) * wiggle * 0.25;
  // ripe crops stand a little taller and fuller, so a ready field reads at a glance
  const scale = (stage === 3 ? 1.18 : 1) + wiggle * 0.15;
  ctx.save();
  ctx.translate(x, y + 10);
  ctx.scale(scale, scale);
  ctx.rotate(sway);
  if (stage === 0) {
    ellipse(ctx, 0, 0, 7, 3, '#7a4f31');
    leaf(ctx, 0, 0, 7, 3, -0.4, '#7fd36a');
    leaf(ctx, 0, 0, 6, 3, 0.5, '#6cc35a');
    ctx.restore();
    return;
  }
  const grow = stage === 1 ? 0.55 : stage === 2 ? 0.8 : 1;
  CROP_DRAW[kind](ctx, grow, stage === 3, t);
  ctx.restore();
  if (stage === 3) sparkle(ctx, x + 13, y - 14, 4, t + x);
  if (golden && stage === 3) {
    for (let i = 0; i < 3; i += 1) {
      const a = t * 1.8 + i * 2.1;
      sparkle(ctx, x + Math.cos(a) * 20, y - 2 + Math.sin(a) * 12, 3.5, t * 1.3 + i);
    }
  }
}

/** The warm glow behind a golden crop, so it stands out across the field. */
function drawGoldenHalo(ctx, x, y, t) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 4 + x);
  const glow = ctx.createRadialGradient(x, y + 2, 2, x, y + 2, 30);
  glow.addColorStop(0, `rgba(255, 236, 120, ${0.95 * pulse})`);
  glow.addColorStop(0.55, `rgba(255, 196, 40, ${0.55 * pulse})`);
  glow.addColorStop(1, 'rgba(255, 196, 40, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y + 2, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 215, 64, ${0.9 * pulse})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 19, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
}

const CROP_DRAW = {
  turnip(ctx, g, ripe) {
    if (ripe) {
      ellipse(ctx, 0, -4, 10, 9, '#f6eefa');
      ctx.beginPath();
      ctx.ellipse(0, -8, 10, 6, 0, Math.PI, 0);
      ctx.fillStyle = '#b679d1';
      ctx.fill();
      ellipse(ctx, -3, -3, 3, 4, 'rgba(255,255,255,0.7)');
    }
    const base = ripe ? -12 : 0;
    leaf(ctx, 0, base, 20 * g, 7 * g, -0.5, '#5fbf55');
    leaf(ctx, 0, base, 24 * g, 8 * g, 0.1, '#6fd062');
    leaf(ctx, 0, base, 19 * g, 7 * g, 0.6, '#55ad4c');
  },
  carrot(ctx, g, ripe) {
    if (ripe) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.quadraticCurveTo(0, 8, 8, -4);
      ctx.quadraticCurveTo(0, -10, -8, -4);
      ctx.fillStyle = '#f28c28';
      ctx.fill();
      ctx.fillStyle = '#d96f14';
      ctx.fillRect(-4, -3, 5, 1.5);
      ctx.fillRect(1, 0, 4, 1.5);
    }
    const base = ripe ? -7 : 0;
    for (let i = -2; i <= 2; i += 1) leaf(ctx, i * 2, base, (18 + (2 - Math.abs(i)) * 5) * g, 3.5 * g, i * 0.3, i % 2 ? '#4fb34a' : '#66c75a');
  },
  berry(ctx, g, ripe) {
    ellipse(ctx, 0, -10 * g, 15 * g, 12 * g, '#4fa84a');
    ellipse(ctx, -5 * g, -14 * g, 9 * g, 7 * g, '#62bd58');
    ellipse(ctx, 6 * g, -8 * g, 8 * g, 6 * g, '#459a42');
    const dots = ripe ? [[-8, -8], [6, -13], [0, -4], [9, -3], [-4, -16]] : g > 0.7 ? [[-6, -8], [5, -12]] : [];
    for (const [dx, dy] of dots) {
      if (ripe) {
        ellipse(ctx, dx, dy, 4.5, 4, '#ff4f6d');
        ellipse(ctx, dx - 1.2, dy - 1.2, 1.3, 1, '#ffd0d8');
      } else {
        ellipse(ctx, dx, dy, 2.5, 2.5, '#ffffff');
      }
    }
  },
  pumpkin(ctx, g, ripe) {
    leaf(ctx, -4, 0, 16 * g, 9 * g, -1.1, '#4e9f45');
    leaf(ctx, 4, 0, 16 * g, 9 * g, 1.1, '#5cb352');
    if (ripe || g > 0.7) {
      const s = ripe ? 1 : 0.5;
      const color = ripe ? '#f6a23a' : '#c8d65a';
      ellipse(ctx, -7 * s, -7 * s, 8 * s, 9 * s, ripe ? '#e88f2a' : color);
      ellipse(ctx, 7 * s, -7 * s, 8 * s, 9 * s, ripe ? '#e88f2a' : color);
      ellipse(ctx, 0, -7 * s, 9 * s, 10 * s, color);
      ctx.fillStyle = '#6b8e2f';
      ctx.fillRect(-1.5, -19 * s, 3, 5 * s);
      if (ripe) ellipse(ctx, -3, -11, 2.5, 3.5, 'rgba(255,255,255,0.35)');
    } else {
      leaf(ctx, 0, 0, 20 * g, 6 * g, 0, '#6cc35a');
    }
  },
  moonmelon(ctx, g, ripe, t) {
    leaf(ctx, -3, 0, 15 * g, 8 * g, -0.9, '#3f8f72');
    leaf(ctx, 3, 0, 15 * g, 8 * g, 0.9, '#4aa383');
    if (ripe) {
      const glow = 0.25 + 0.15 * Math.sin(t * 3);
      ellipse(ctx, 0, -9, 20, 17, `rgba(170, 230, 255, ${glow})`);
      ellipse(ctx, 0, -9, 13, 11, '#9fd8ff');
      ellipse(ctx, -4, -13, 4, 3, 'rgba(255,255,255,0.7)');
      ctx.fillStyle = '#fff8c2';
      for (const [dx, dy] of [[5, -12], [-6, -6], [3, -4]]) star(ctx, dx, dy, 2.6);
    } else if (g > 0.7) {
      ellipse(ctx, 0, -6, 6, 5, '#bfe6c9');
    } else {
      leaf(ctx, 0, 0, 18 * g, 5 * g, 0, '#5cb895');
    }
  },
};

/** A crop's produce alone, for the hotbar, basket and shop. */
export function drawProduce(ctx, kind, x, y, size, t = 0) {
  ctx.save();
  ctx.translate(x, y + size * 0.35);
  const s = size / 30;
  ctx.scale(s, s);
  if (kind === 'turnip') CROP_DRAW.turnip(ctx, 0.55, true);
  else if (kind === 'carrot') {
    ctx.rotate(-0.6);
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.quadraticCurveTo(0, 14, 6, -16);
    ctx.closePath();
    ctx.fillStyle = '#f28c28';
    ctx.fill();
    leaf(ctx, 0, -16, 10, 3, -0.3, '#5fbf55');
    leaf(ctx, 0, -16, 10, 3, 0.3, '#4fb34a');
  } else if (kind === 'berry') {
    ellipse(ctx, 0, -8, 9, 10, '#ff4f6d');
    ellipse(ctx, -3, -11, 2.5, 2, '#ffd0d8');
    leaf(ctx, 0, -17, 6, 4, -0.8, '#4fa84a');
    leaf(ctx, 0, -17, 6, 4, 0.8, '#4fa84a');
  } else if (kind === 'pumpkin') CROP_DRAW.pumpkin(ctx, 0.01, true);
  else CROP_DRAW.moonmelon(ctx, 0.01, true, t);
  ctx.restore();
}

/** A little paper seed packet with the produce on it. */
export function drawSeedPacket(ctx, kind, x, y, size) {
  roundRect(ctx, x - size * 0.42, y - size * 0.5, size * 0.84, size, 4);
  ctx.fillStyle = PALETTE.paper;
  ctx.fill();
  ctx.strokeStyle = '#d9b77a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  drawProduce(ctx, kind, x, y - size * 0.1, size * 0.62);
}
