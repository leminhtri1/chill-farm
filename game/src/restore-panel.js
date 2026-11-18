// The restoration panel: the landmark now and restored side by side, what it still needs (with how
// many the farmer carries), what restoring it unlocks, and the Donate button.
import { drawProduce } from './crop-art.js';
import { LANDMARKS, PRESERVES } from './config.js';
import { text } from './hud.js';
import { drawBakery, drawBridge, drawPondLandmark } from './landmark-art.js';
import { BOX, bar, card } from './panel-kit.js';
import { canDonate, donate, haveFor, needLeft, needName, reachable, restoreProgress } from './restoration.js';
import { drawJar } from './workshop-art.js';

export function restoreButtons(game, ui, buttons) {
  if (game.restored[ui.id]) return;
  buttons.push({
    x: BOX.x + BOX.w - 230, y: BOX.y + BOX.h - 70, w: 200, h: 48, label: 'Donate', hot: true, enabled: canDonate(game, ui.id),
    run: () => (donate(game, ui.id) ? 'donate' : 'error'),
  });
}

/** A landmark drawn at a panel's scale, restored or not. */
function drawLandmarkAt(ctx, id, x, y, restored, t) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'pond') {
    ctx.scale(1.25, 1.25);
    drawPondLandmark(ctx, -48, -48, 96, 96, t, restored);
  } else if (id === 'bridge') {
    ctx.fillStyle = '#8fcf6e';
    ctx.fillRect(-60, -46, 120, 92);
    ctx.fillStyle = '#6cc3e6';
    ctx.fillRect(-26, -46, 52, 92);
    ctx.scale(1.6, 1.6);
    drawBridge(ctx, -24, -24, 48, t, restored);
  } else {
    ctx.scale(1.15, 1.15);
    drawBakery(ctx, -48, -50, 96, 96, t, restored);
  }
  ctx.restore();
}

export function drawRestorePanel(ctx, game, ui, t) {
  const id = ui.id;
  const info = LANDMARKS[id];
  const restored = game.restored[id];
  text(ctx, restored ? `${info.name}: restored!` : info.job, BOX.x + 24, BOX.y + 30, { size: 24 });
  text(ctx, 'Donate produce to bring the village back to life.', BOX.x + 24, BOX.y + 58, { size: 14, color: '#7a5a44', weight: 'normal' });
  // before -> after
  card(ctx, BOX.x + 20, BOX.y + 78, 136, 150, 'rgba(220, 210, 195, 0.6)');
  card(ctx, BOX.x + 196, BOX.y + 78, 136, 150, 'rgba(214, 240, 200, 0.75)');
  ctx.save();
  ctx.beginPath();
  ctx.rect(BOX.x + 20, BOX.y + 78, 312, 150);
  ctx.clip();
  drawLandmarkAt(ctx, id, BOX.x + 88, BOX.y + 150, restored, t);
  drawLandmarkAt(ctx, id, BOX.x + 264, BOX.y + 150, true, t);
  ctx.restore();
  text(ctx, restored ? 'Now' : 'Today', BOX.x + 88, BOX.y + 214, { size: 13, align: 'center', color: '#7a5a44' });
  text(ctx, 'Restored', BOX.x + 264, BOX.y + 214, { size: 13, align: 'center', color: '#2f7a3a' });
  ctx.fillStyle = '#e0912a';
  ctx.beginPath();
  ctx.moveTo(BOX.x + 162, BOX.y + 140);
  ctx.lineTo(BOX.x + 190, BOX.y + 153);
  ctx.lineTo(BOX.x + 162, BOX.y + 166);
  ctx.closePath();
  ctx.fill();
  // needs
  text(ctx, 'Needs', BOX.x + 352, BOX.y + 92, { size: 16 });
  info.needs.forEach((need, i) => {
    const y = BOX.y + 108 + i * 62;
    card(ctx, BOX.x + 348, y, BOX.w - 372, 54, 'rgba(255, 241, 207, 0.95)');
    if (need.jar) drawJar(ctx, BOX.x + 376, y + 46, 38, PRESERVES.colors[need.kind], 1);
    else drawProduce(ctx, need.kind, BOX.x + 376, y + 22, 34, t);
    const left = needLeft(game, id, need);
    text(ctx, `${need.qty - left} / ${need.qty} ${needName(need)}`, BOX.x + 404, y + 18, { size: 15 });
    bar(ctx, BOX.x + 404, y + 32, 150, 10, (need.qty - left) / need.qty);
    text(ctx, `have ${haveFor(game, need)}`, BOX.x + 566, y + 37, { size: 12, color: haveFor(game, need) && left ? '#2f7a3a' : '#a08a70', weight: 'normal' });
  });
  // unlock
  card(ctx, BOX.x + 20, BOX.y + 246, BOX.w - 40, 64, 'rgba(255, 233, 160, 0.7)');
  text(ctx, restored ? 'Unlocked:' : 'Unlocks:', BOX.x + 36, BOX.y + 266, { size: 14, color: '#8a4a1a' });
  text(ctx, info.unlock, BOX.x + 36, BOX.y + 290, { size: 16 });
  const progress = restoreProgress(game, id);
  bar(ctx, BOX.x + 24, BOX.y + 336, BOX.w - 48, 16, progress, restored ? '#5fbf55' : '#ffb347');
  text(ctx, `${Math.round(progress * 100)}% restored`, BOX.x + BOX.w / 2, BOX.y + 344.5, { size: 12, align: 'center', color: '#3c2a20' });
  if (!reachable(game, id)) {
    text(ctx, 'Across the creek: fix the bridge first', BOX.x + 24, BOX.y + BOX.h - 46, { size: 15, color: '#c0471a' });
  } else if (!restored) {
    text(ctx, 'Donating gives everything useful you carry.', BOX.x + 24, BOX.y + BOX.h - 46, { size: 13, color: '#7a5a44', weight: 'normal' });
  }
}
