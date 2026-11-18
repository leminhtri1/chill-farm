// The level-up panel: two big perk cards to pick one from, and the village friends with their hearts.
import { FRIENDS, PERKS, VILLAGER_ORDER, VILLAGERS, VIEW } from './config.js';
import { roundRect } from './draw-kit.js';
import { text } from './hud.js';
import { BOX, card } from './panel-kit.js';
import { choosePerk } from './skills.js';
import { drawHeartRow, drawPerkIcon, drawPortrait } from './villager-art.js';

const CARD = { w: 236, h: 236, y: BOX.y + 84 };

export function perkButtons(game, buttons) {
  if (!game.perkOffer) return;
  game.perkOffer.forEach((id, i) => {
    buttons.push({
      x: VIEW.width / 2 - 256 + i * 276, y: CARD.y, w: CARD.w, h: CARD.h, label: '', enabled: true, perk: id,
      run: () => {
        choosePerk(game, i);
        return game.perkOffer ? 'perk' : 'close';
      },
    });
  });
}

export function drawPerkPanel(ctx, game, t) {
  text(ctx, `Level ${game.level - Math.max(0, game.pendingLevels - 1)}!`, VIEW.width / 2, BOX.y + 34, { size: 32, align: 'center', color: '#a0660a' });
  text(ctx, 'Pick one perk to keep for the season', VIEW.width / 2, BOX.y + 64, { size: 15, align: 'center', color: '#7a5a44' });
  // the village friends along the bottom
  card(ctx, BOX.x + 20, BOX.y + 336, BOX.w - 40, 84, 'rgba(255, 233, 210, 0.7)');
  VILLAGER_ORDER.forEach((id, i) => {
    const x = BOX.x + 40 + i * 200;
    drawPortrait(ctx, id, x + 30, BOX.y + 378, 32, t);
    text(ctx, VILLAGERS[id].name, x + 72, BOX.y + 358, { size: 14 });
    drawHeartRow(ctx, x + 80, BOX.y + 390, 21, game.friends[id].hearts, FRIENDS.maxHearts, 25);
  });
}

/** The perk cards, drawn over their buttons: a big icon, the name and what it does. */
export function drawPerkOver(ctx, game, buttons, t) {
  for (const b of buttons) {
    if (!b.perk) continue;
    const perk = PERKS[b.perk];
    const lift = Math.sin(t * 2.4 + b.x) * 3;
    roundRect(ctx, b.x, b.y + lift, b.w, b.h, 18);
    ctx.fillStyle = '#fff9ec';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e0a84a';
    ctx.stroke();
    roundRect(ctx, b.x + 14, b.y + 14 + lift, b.w - 28, 124, 14);
    ctx.fillStyle = 'rgba(255, 220, 150, 0.5)';
    ctx.fill();
    drawPerkIcon(ctx, perk.icon, b.x + b.w / 2, b.y + 76 + lift, 104, t);
    text(ctx, perk.name, b.x + b.w / 2, b.y + 166 + lift, { size: 22, align: 'center' });
    text(ctx, perk.about, b.x + b.w / 2, b.y + 198 + lift, { size: 14, align: 'center', color: '#7a5a44' });
  }
}
