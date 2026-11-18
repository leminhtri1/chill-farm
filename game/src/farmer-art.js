// The farmer: straw hat, overalls, walking bob and the tool swung during an action.
import { ellipse, PALETTE, roundRect, shadow } from './draw-kit.js';

export function drawFarmer(ctx, x, y, dir, walk, moving, action, actionKind, t) {
  const bob = moving ? Math.abs(Math.sin(walk * 2)) * 2 : Math.sin(t * 2) * 0.6;
  const step = moving ? Math.sin(walk * 2) * 3 : 0;
  shadow(ctx, x, y + 21, 13, 4.5);
  // legs
  ellipse(ctx, x - 5, y + 17 + step * 0.4, 4, 4.5, '#5a3d2b');
  ellipse(ctx, x + 5, y + 17 - step * 0.4, 4, 4.5, '#5a3d2b');
  const by = y - bob;
  // body: shirt and overalls
  roundRect(ctx, x - 10, by + 2, 20, 16, 7);
  ctx.fillStyle = '#ffd36e';
  ctx.fill();
  roundRect(ctx, x - 8, by + 7, 16, 11, 5);
  ctx.fillStyle = '#5b8fd6';
  ctx.fill();
  if (dir !== 'up') {
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(x - 6, by + 5, 2, 5);
    ctx.fillRect(x + 4, by + 5, 2, 5);
    ellipse(ctx, x, by + 12, 2.2, 2, '#ffd36e');
  }
  // arms swing, or reach forward during an action
  const reach = action > 0 ? 4 : 0;
  const swing = moving ? Math.sin(walk * 2) * 3 : 0;
  const armX = dir === 'left' ? -reach : dir === 'right' ? reach : 0;
  ellipse(ctx, x - 11 + armX, by + 9 + swing, 3.5, 4.5, '#ffd9b0');
  ellipse(ctx, x + 11 + armX, by + 9 - swing, 3.5, 4.5, '#ffd9b0');
  // head
  const hy = by - 8;
  ellipse(ctx, x, hy, 11, 10, '#ffd9b0');
  if (dir !== 'up') {
    const look = dir === 'left' ? -3 : dir === 'right' ? 3 : 0;
    const blink = Math.sin(t * 1.3) > 0.97;
    ctx.fillStyle = PALETTE.ink;
    if (blink) {
      ctx.fillRect(x - 5 + look, hy + 1, 3, 1.2);
      ctx.fillRect(x + 2 + look, hy + 1, 3, 1.2);
    } else {
      ellipse(ctx, x - 3.6 + look, hy + 1, 1.6, 2, PALETTE.ink);
      ellipse(ctx, x + 3.6 + look, hy + 1, 1.6, 2, PALETTE.ink);
    }
    ellipse(ctx, x - 6.5 + look, hy + 4.5, 2.4, 1.5, 'rgba(255, 120, 120, 0.55)');
    ellipse(ctx, x + 6.5 + look, hy + 4.5, 2.4, 1.5, 'rgba(255, 120, 120, 0.55)');
    ctx.beginPath();
    ctx.arc(x + look, hy + 4.5, 2, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    ellipse(ctx, x, hy + 2, 9, 7, '#8a5a3b');
  }
  // straw hat
  ellipse(ctx, x, hy - 5, 16, 5.5, '#f2c65a');
  ctx.beginPath();
  ctx.ellipse(x, hy - 7, 9, 8, 0, Math.PI, 0);
  ctx.fillStyle = '#f7d77a';
  ctx.fill();
  ctx.fillStyle = '#e45b5b';
  ctx.fillRect(x - 9, hy - 9, 18, 3);
  // the tool in hand while acting
  if (action > 0) drawToolSwing(ctx, x, by, dir, actionKind, action);
}

function drawToolSwing(ctx, x, y, dir, kind, action) {
  const side = dir === 'left' ? -1 : 1;
  const hx = x + side * 15;
  const hy = y + 6;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(side * (0.6 - action * 5));
  if (kind === 'water' || kind === 'refill') {
    roundRect(ctx, -6, -6, 12, 10, 3);
    ctx.fillStyle = '#7fb6d9';
    ctx.fill();
    ctx.fillStyle = '#5e93b8';
    ctx.fillRect(side * 5, -4, side * 8, 3);
  } else if (kind === 'till') {
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(-1.5, -16, 3, 20);
    ctx.fillStyle = '#9aa4ad';
    ctx.fillRect(-6, -18, 12, 4);
  } else {
    ellipse(ctx, 0, 0, 6, 5, '#d9a066');
    ctx.strokeStyle = '#a8703c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -2, 5, Math.PI, 0);
    ctx.stroke();
  }
  ctx.restore();
}
