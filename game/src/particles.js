// Little bits of feedback: soil crumbs, water drops, leaves, sparkles, rain and floating "+50" text.
import { VIEW } from './config.js';

export function createEffects() {
  return { bits: [], texts: [], rain: [], toasts: [] };
}

export function burst(fx, x, y, kind, count) {
  const looks = {
    soil: { colors: ['#8b5c3a', '#a8754d', '#6b452c'], speed: 70, up: 90, size: 3, life: 0.5, gravity: 400 },
    water: { colors: ['#7fc8f2', '#a9dcff', '#5fb2e8'], speed: 60, up: 110, size: 2.5, life: 0.6, gravity: 420 },
    leaf: { colors: ['#6fd062', '#8fe07a', '#55ad4c'], speed: 90, up: 120, size: 3, life: 0.7, gravity: 300 },
    star: { colors: ['#fff6a8', '#ffcf40', '#ffffff'], speed: 120, up: 140, size: 3, life: 0.8, gravity: 200 },
    coin: { colors: ['#ffcf40', '#f2b632'], speed: 140, up: 220, size: 4, life: 0.9, gravity: 520 },
    feather: { colors: ['#3a3550', '#4b4566'], speed: 80, up: 60, size: 3, life: 1, gravity: 80 },
  }[kind];
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = looks.speed * (0.4 + Math.random() * 0.8);
    fx.bits.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s * 0.5 - looks.up * (0.5 + Math.random() * 0.6),
      size: looks.size * (0.6 + Math.random() * 0.8),
      color: looks.colors[i % looks.colors.length],
      life: looks.life * (0.7 + Math.random() * 0.6),
      gravity: looks.gravity,
      star: kind === 'star',
    });
  }
}

export function floatText(fx, x, y, text, color = '#fff6e0') {
  fx.texts.push({ x, y, text, color, life: 1.3 });
}

/** A message in the banner under the HUD: tips, warnings and good news. */
export function toast(fx, text, tone = 'info') {
  if (fx.toasts.length && fx.toasts[fx.toasts.length - 1].text === text) {
    fx.toasts[fx.toasts.length - 1].life = 2.6;
    return;
  }
  fx.toasts.push({ text, tone, life: 2.6 });
  if (fx.toasts.length > 3) fx.toasts.shift();
}

export function updateEffects(fx, dt, raining) {
  for (const b of fx.bits) {
    b.life -= dt;
    b.vy += b.gravity * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  fx.bits = fx.bits.filter((b) => b.life > 0);
  for (const t of fx.texts) {
    t.life -= dt;
    t.y -= 34 * dt;
  }
  fx.texts = fx.texts.filter((t) => t.life > 0);
  for (const t of fx.toasts) t.life -= dt;
  fx.toasts = fx.toasts.filter((t) => t.life > 0);
  if (raining) {
    while (fx.rain.length < 260) fx.rain.push({ x: Math.random() * (VIEW.width + 200), y: Math.random() * -VIEW.height, s: 0.7 + Math.random() * 0.6 });
  }
  for (const d of fx.rain) {
    d.y += 520 * d.s * dt;
    d.x -= 120 * d.s * dt;
    if (d.y > VIEW.height) {
      if (raining) {
        d.y = -10;
        d.x = Math.random() * (VIEW.width + 200);
      } else d.dead = true;
    }
  }
  fx.rain = fx.rain.filter((d) => !d.dead);
}

export function drawEffects(ctx, fx) {
  for (const b of fx.bits) {
    ctx.globalAlpha = Math.min(1, b.life * 2);
    ctx.fillStyle = b.color;
    if (b.star) {
      ctx.fillRect(b.x - b.size, b.y - 0.6, b.size * 2, 1.2);
      ctx.fillRect(b.x - 0.6, b.y - b.size, 1.2, b.size * 2);
    } else {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.font = 'bold 16px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const t of fx.texts) {
    ctx.globalAlpha = Math.min(1, t.life * 1.5);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(74, 52, 40, 0.85)';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

export function drawRain(ctx, fx) {
  ctx.strokeStyle = 'rgba(214, 234, 255, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const d of fx.rain) {
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + 7 * d.s, d.y - 20 * d.s);
  }
  ctx.stroke();
}
