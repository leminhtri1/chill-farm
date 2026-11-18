// Things drawn over the farm while playing: the tutorial tip, the hint under the pointer or in
// front of the farmer, a big combo badge during quick harvests, and the sleepy "Zz" at bedtime.
import { app, ctx, input } from './app.js';
import { PLACES, VIEW } from './config.js';
import { describeTile } from './farm.js';
import { drawActionHint, FONT, panel, text } from './hud.js';
import { facingTile } from './player.js';
import { tutorialTip } from './tutorial.js';

export function drawPlayOverlays(game, hover) {
  const tip = tutorialTip(game);
  if (tip && !app.fx.toasts.length) {
    ctx.font = `bold 15px ${FONT}`;
    const w = ctx.measureText(tip).width + 40;
    panel(ctx, VIEW.width / 2 - w / 2, 100, w, 32, 'rgba(255, 233, 160, 0.97)', 16);
    text(ctx, `Tip: ${tip}`, VIEW.width / 2, 116.5, { size: 15, align: 'center', color: '#6a3a10' });
  }
  drawComboBadge(game);
  if (hover) {
    const hint = describeTile(game, hover.c, hover.r);
    drawActionHint(ctx, hover.near ? `Click: ${hint}` : `Walk to: ${hint}`, input.mouse.x, input.mouse.y + 22);
  } else if (!game.player.moving) {
    const tile = facingTile(game);
    const hint = describeTile(game, tile.c, tile.r);
    if (hint) drawActionHint(ctx, `Space: ${hint}`, game.player.x, game.player.y - 58);
  }
  if (game.clock > 0.86) {
    const door = PLACES.door;
    text(ctx, 'Zz', door.c * 48 + 30, door.r * 48 - 6 + Math.sin(app.t * 3) * 3, { size: 16, color: '#fff6e0' });
  }
}

/** Quick harvests in a row: a bouncy "x5 COMBO!" over the farmer while the combo window is open. */
function drawComboBadge(game) {
  const combo = game.combo;
  if (combo.count < 2 || combo.timer <= 0) return;
  const p = game.player;
  const pop = 1 + Math.max(0, combo.timer - 1.8) * 0.8;
  ctx.save();
  ctx.translate(p.x, p.y - 82);
  ctx.scale(pop, pop);
  ctx.globalAlpha = Math.min(1, combo.timer * 1.5);
  const label = `x${combo.count} COMBO!`;
  ctx.font = `bold 26px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#8a3a10';
  ctx.strokeText(label, 0, 0);
  ctx.fillStyle = combo.count >= 5 ? '#ffe066' : '#ffb347';
  ctx.fillText(label, 0, 0);
  ctx.restore();
}
