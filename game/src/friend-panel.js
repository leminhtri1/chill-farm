// A villager's panel: their portrait and hearts, what they love, and a gift a day from the basket
// or the pantry. Liked jars count double.
import { drawProduce } from './crop-art.js';
import { FRIENDS, PRESERVES, VILLAGERS } from './config.js';
import { text } from './hud.js';
import { BOX, card } from './panel-kit.js';
import { drawHeart, drawHeartRow, drawPortrait } from './villager-art.js';
import { giftName, giftOptions, giveGift } from './villagers.js';
import { drawJar } from './workshop-art.js';

const TALK = {
  fern: 'Oh, a visitor! My old knees love a turnip stew.',
  bo: 'Once the bakery reopens, I will bake with your jams!',
  pip: 'Carrots make you run fast! Moonmelons glow at night!',
};

export function friendButtons(game, ui, buttons) {
  giftOptions(game, ui.id).forEach((option, i) => {
    buttons.push({
      x: BOX.x + 220 + (i % 2) * 196, y: BOX.y + 214 + Math.floor(i / 2) * 76, w: 186, h: 66, label: '',
      enabled: !game.friends[ui.id].gifted && option.have > 0, gift: option,
      run: () => (giveGift(game, ui.id, option) ? 'gift' : 'error'),
    });
  });
}

export function drawFriendPanel(ctx, game, ui, t) {
  const id = ui.id;
  const look = VILLAGERS[id];
  const friend = game.friends[id];
  card(ctx, BOX.x + 20, BOX.y + 20, 180, 300, 'rgba(255, 233, 210, 0.7)');
  drawPortrait(ctx, id, BOX.x + 110, BOX.y + 110, 72, t);
  text(ctx, look.name, BOX.x + 110, BOX.y + 206, { size: 20, align: 'center' });
  drawHeartRow(ctx, BOX.x + 46, BOX.y + 240, 24, friend.hearts, FRIENDS.maxHearts, 32);
  text(ctx, friend.hearts >= FRIENDS.maxHearts ? 'Best friends!' : `${friend.hearts} / ${FRIENDS.maxHearts} hearts`, BOX.x + 110, BOX.y + 272, { size: 14, align: 'center', color: '#b8324e' });
  text(ctx, `Orders pay +${Math.round(friend.hearts * FRIENDS.orderBonus * 100)}%`, BOX.x + 110, BOX.y + 296, { size: 13, align: 'center', color: '#7a5a44', weight: 'normal' });
  // speech bubble
  card(ctx, BOX.x + 220, BOX.y + 24, BOX.w - 244, 64, '#fff9ec');
  text(ctx, `"${TALK[id]}"`, BOX.x + 236, BOX.y + 56, { size: 15, color: '#4a3428', weight: 'normal' });
  text(ctx, 'Loves:', BOX.x + 220, BOX.y + 116, { size: 15 });
  look.likes.forEach((kind, i) => {
    drawProduce(ctx, kind, BOX.x + 300 + i * 90, BOX.y + 110, 30, t);
    drawJar(ctx, BOX.x + 336 + i * 90, BOX.y + 130, 30, PRESERVES.colors[kind], 1);
  });
  text(ctx, friend.gifted ? 'Thank you for today\'s gift! Come back tomorrow.' : 'Give one gift a day. A liked jar counts double!', BOX.x + 220, BOX.y + 186, { size: 14, color: friend.gifted ? '#2f7a3a' : '#7a5a44' });
  text(ctx, 'Filling their orders earns hearts too (one for every two orders).', BOX.x + 24, BOX.y + BOX.h - 24, { size: 13, color: '#a08a70', weight: 'normal' });
}

export function drawFriendOver(ctx, game, buttons, t) {
  for (const b of buttons) {
    if (!b.gift) continue;
    const o = b.gift;
    ctx.globalAlpha = b.enabled ? 1 : 0.45;
    if (o.jar) drawJar(ctx, b.x + 30, b.y + 54, 40, PRESERVES.colors[o.kind], 1);
    else drawProduce(ctx, o.kind, b.x + 30, b.y + 30, 34, t);
    text(ctx, giftName(o), b.x + 58, b.y + 20, { size: 13 });
    drawHeart(ctx, b.x + 66, b.y + 44, 14);
    text(ctx, `+${o.hearts}`, b.x + 78, b.y + 45, { size: 14, color: '#b8324e' });
    text(ctx, `have ${o.have}`, b.x + b.w - 10, b.y + 45, { size: 12, align: 'right', color: '#7a5a44', weight: 'normal' });
    ctx.globalAlpha = 1;
  }
}
