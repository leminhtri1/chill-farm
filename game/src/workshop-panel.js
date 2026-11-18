// The preserves workshop panel: big bubbling kettles, buttons to cook a batch of each crop, and the
// pantry of finished jars with what they are worth.
import { drawProduce } from './crop-art.js';
import { CROP_ORDER, CROPS, PRESERVES, VIEW } from './config.js';
import { FONT, text } from './hud.js';
import { BOX, bar, card } from './panel-kit.js';
import { jarPrice, kettleCount, loadKettle, pantryValue } from './preserves.js';
import { drawJar, drawKettle } from './workshop-art.js';

const KETTLE_Y = BOX.y + 160;
const LOAD_Y = BOX.y + 262;
const PANTRY_Y = BOX.y + 352;

export function workshopButtons(game, buttons) {
  CROP_ORDER.forEach((kind, i) => {
    buttons.push({
      x: BOX.x + 24 + i * 120, y: LOAD_Y, w: 110, h: 58, label: '', enabled: game.basket[kind] > 0 && kettleCount(game) > game.kettles.filter(Boolean).length,
      run: () => (loadKettle(game, kind) ? 'cook' : 'error'), crop: kind,
    });
  });
}

export function drawWorkshopPanel(ctx, game, t) {
  text(ctx, 'Preserves Workshop', BOX.x + 24, BOX.y + 30, { size: 24 });
  text(ctx, `Cook crops into jars worth ${PRESERVES.value}x. Kettles keep cooking overnight.`, BOX.x + 24, BOX.y + 58, { size: 14, color: '#7a5a44', weight: 'normal' });
  for (let i = 0; i < PRESERVES.maxKettles; i += 1) {
    const x = BOX.x + 120 + i * 200;
    const open = i < kettleCount(game);
    const kettle = game.kettles[i];
    card(ctx, x - 92, BOX.y + 76, 184, 172, open ? 'rgba(255, 226, 190, 0.6)' : 'rgba(220, 210, 195, 0.45)');
    ctx.globalAlpha = open ? 1 : 0.35;
    drawKettle(ctx, x, KETTLE_Y - 14, 112, kettle ? kettle.kind : null, kettle ? 1 - kettle.left / kettle.total : 0, t + i);
    ctx.globalAlpha = 1;
    if (kettle) {
      drawJar(ctx, x - 62, KETTLE_Y + 40, 34, PRESERVES.colors[kettle.kind], 1 - kettle.left / kettle.total);
      text(ctx, `${kettle.qty} x ${PRESERVES.goods[kettle.kind]}`, x + 8, KETTLE_Y + 50, { size: 14, align: 'center' });
      bar(ctx, x - 40, KETTLE_Y + 64, 100, 10, 1 - kettle.left / kettle.total);
    } else {
      text(ctx, open ? 'Empty: cook a batch!' : 'Extra Kettle perk', x, KETTLE_Y + 56, { size: 14, align: 'center', color: open ? '#7a5a44' : '#a8957a' });
    }
  }
  text(ctx, `Cook a batch (up to ${PRESERVES.batch} from your basket):`, BOX.x + 24, LOAD_Y - 14, { size: 14, color: '#7a5a44' });
  // pantry
  card(ctx, BOX.x + 16, PANTRY_Y, BOX.w - 32, 72, 'rgba(255, 241, 207, 0.9)');
  text(ctx, 'Pantry', BOX.x + 32, PANTRY_Y + 20, { size: 16 });
  text(ctx, `worth ${pantryValue(game)}c`, BOX.x + 32, PANTRY_Y + 44, { size: 14, color: '#a0660a' });
  text(ctx, 'sell at the stall', BOX.x + 32, PANTRY_Y + 60, { size: 12, color: '#a08a70', weight: 'normal' });
  CROP_ORDER.forEach((kind, i) => {
    const x = BOX.x + 190 + i * 88;
    const n = game.goods[kind];
    ctx.globalAlpha = n ? 1 : 0.3;
    drawJar(ctx, x, PANTRY_Y + 62, 50, PRESERVES.colors[kind], 1);
    drawProduce(ctx, kind, x, PANTRY_Y + 34, 14, t);
    ctx.globalAlpha = 1;
    ctx.font = `bold 18px ${FONT}`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff6e0';
    ctx.textAlign = 'left';
    ctx.strokeText(`${n}`, x + 22, PANTRY_Y + 34);
    text(ctx, `${n}`, x + 22, PANTRY_Y + 34, { size: 18, color: n ? '#4a3428' : '#a8957a' });
    text(ctx, `${jarPrice(game, kind)}c`, x + 22, PANTRY_Y + 56, { size: 12, color: '#a0660a' });
  });
  text(ctx, 'Esc to close', VIEW.width / 2 + BOX.w / 2 - 24, BOX.y + BOX.h - 12, { size: 12, align: 'right', color: '#a08a70', weight: 'normal' });
}

/** Drawn over the load buttons: each crop's produce, name and how many are in the basket. */
export function drawWorkshopOver(ctx, game, buttons, t) {
  for (const b of buttons) {
    if (!b.crop) continue;
    ctx.globalAlpha = b.enabled ? 1 : 0.45;
    drawProduce(ctx, b.crop, b.x + 26, b.y + 24, 32, t);
    text(ctx, CROPS[b.crop].name, b.x + 48, b.y + 20, { size: 13 });
    text(ctx, `have ${game.basket[b.crop]}`, b.x + 48, b.y + 40, { size: 12, color: '#7a5a44', weight: 'normal' });
    ctx.globalAlpha = 1;
  }
}
