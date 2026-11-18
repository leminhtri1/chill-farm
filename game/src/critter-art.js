// Animals: the crows that peck at crops and the butterflies that drift over the meadow.
import { ellipse, PALETTE, shadow } from './draw-kit.js';

export function drawCrow(ctx, x, y, face, flap, pecking) {
  shadow(ctx, x, y + 14, 10, 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  const peck = pecking ? Math.max(0, Math.sin(flap * 4)) * 4 : 0;
  ellipse(ctx, 0, 2, 11, 8, '#3a3550');
  ellipse(ctx, -9, 0, 6, 3, '#2c2840', -0.4);
  const wing = pecking ? 0 : Math.sin(flap) * 7;
  ctx.beginPath();
  ctx.ellipse(-1, -1 - wing * 0.5, 9, 4 + Math.abs(wing) * 0.5, -0.3 - wing * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#4b4566';
  ctx.fill();
  ellipse(ctx, 8, -4 + peck, 6, 5.5, '#3a3550');
  ellipse(ctx, 9.5, -5 + peck, 1.7, 1.7, '#fff');
  ellipse(ctx, 10, -5 + peck, 0.9, 0.9, '#111');
  ctx.beginPath();
  ctx.moveTo(13, -4 + peck);
  ctx.lineTo(19, -2 + peck);
  ctx.lineTo(13, -1 + peck);
  ctx.fillStyle = PALETTE.gold;
  ctx.fill();
  ctx.fillStyle = '#e8a33a';
  ctx.fillRect(-2, 9, 1.5, 4);
  ctx.fillRect(2, 9, 1.5, 4);
  ctx.restore();
}

export function drawButterfly(ctx, x, y, hue, t) {
  const flap = Math.abs(Math.sin(t * 12));
  ctx.fillStyle = `hsl(${hue}, 85%, 72%)`;
  ctx.beginPath();
  ctx.ellipse(x - 3 * flap, y, 4 * flap + 1, 3.5, -0.4, 0, Math.PI * 2);
  ctx.ellipse(x + 3 * flap, y, 4 * flap + 1, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(x - 0.6, y - 3, 1.2, 6);
}
