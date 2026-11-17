// Pop-up panels: Hazel's market stall (sell, seeds, upgrades), the order board, help and pause.
// Each panel is a list of buttons, clickable with the mouse or walked with the arrow keys + Enter.
import { drawProduce, drawSeedPacket, drawSprinklerIcon, PALETTE, roundRect } from './art.js';
import { CAN_CAPACITY, CROP_ORDER, CROPS, HOT_PICK_BONUS, PERFECT_BONUS, SPRINKLER, UPGRADES, VIEW } from './config.js';
import {
  buySeeds, buySprinkler, buyUpgrade, placedSprinklers, seedAvailable, sellBasket, sellPrice, upgradePrice, basketValue,
} from './market.js';
import { canFill, fillOrder } from './orders.js';
import { FONT, panel, text } from './hud.js';

const BOX = { x: 160, y: 66, w: 640, h: 438 };
const SHOP_TABS = ['Sell', 'Seeds', 'Upgrades'];

export function openPanel(kind) {
  return { kind, tab: 0, cursor: 0 };
}

/** The buttons of the open panel: { x, y, w, h, label, enabled, run, hot }. */
export function panelButtons(game, ui) {
  const buttons = [];
  const close = { x: BOX.x + BOX.w - 44, y: BOX.y + 10, w: 32, h: 32, label: 'x', enabled: true, run: () => 'close', close: true };
  if (ui.kind === 'shop') {
    SHOP_TABS.forEach((name, i) => {
      buttons.push({ x: BOX.x + 20 + i * 132, y: BOX.y + 58, w: 124, h: 34, label: name, enabled: true, tab: i, run: () => { ui.tab = i; ui.cursor = 0; return 'tab'; } });
    });
    if (ui.tab === 0) sellButtons(game, buttons);
    if (ui.tab === 1) seedButtons(game, buttons);
    if (ui.tab === 2) upgradeButtons(game, buttons);
  } else if (ui.kind === 'board') {
    game.orders.forEach((order, i) => {
      buttons.push({ x: BOX.x + 30 + i * 196, y: BOX.y + 318, w: 176, h: 40, label: 'Deliver', enabled: canFill(game, order), run: () => (fillOrder(game, i) ? 'order' : 'error') });
    });
  } else if (ui.kind === 'pause') {
    const labels = [['Resume', 'close'], ['How to play', 'help'], ['Sound on / off', 'mute'], ['Quit to title', 'quit']];
    labels.forEach(([label, result], i) => {
      buttons.push({ x: VIEW.width / 2 - 130, y: BOX.y + 110 + i * 58, w: 260, h: 46, label, enabled: true, run: () => result });
    });
  } else if (ui.kind === 'help') {
    buttons.push({ x: VIEW.width / 2 - 110, y: BOX.y + BOX.h - 62, w: 220, h: 44, label: 'Got it!', enabled: true, run: () => 'close' });
  }
  if (ui.kind !== 'pause') buttons.push(close);
  return buttons;
}

function row(i) {
  return BOX.y + 106 + i * 50;
}

function sellButtons(game, buttons) {
  const total = basketValue(game);
  buttons.push({ x: BOX.x + BOX.w - 230, y: BOX.y + 58, w: 210, h: 34, label: `Sell all  +${total}`, enabled: total > 0, hot: true, run: () => (sellBasket(game, null) ? 'sell' : 'error') });
  CROP_ORDER.forEach((kind, i) => {
    const count = game.basket[kind];
    const value = game.perfectBasket[kind] * sellPrice(game, kind, true) + (count - game.perfectBasket[kind]) * sellPrice(game, kind, false);
    buttons.push({ x: BOX.x + BOX.w - 150, y: row(i) + 6, w: 130, h: 36, label: count ? `Sell +${value}` : 'Sell', enabled: count > 0, run: () => (sellBasket(game, kind) ? 'sell' : 'error'), crop: kind });
  });
}

function seedButtons(game, buttons) {
  CROP_ORDER.forEach((kind, i) => {
    const open = seedAvailable(game, kind);
    const cost = CROPS[kind].seed;
    buttons.push({ x: BOX.x + BOX.w - 268, y: row(i) + 6, w: 118, h: 36, label: open ? `1 for ${cost}` : `Day ${CROPS[kind].unlockDay}`, enabled: open && game.coins >= cost, run: () => (buySeeds(game, kind, 1) ? 'buy' : 'error'), crop: kind });
    buttons.push({ x: BOX.x + BOX.w - 142, y: row(i) + 6, w: 122, h: 36, label: open ? `5 for ${cost * 5}` : '', enabled: open && game.coins >= cost * 5, run: () => (buySeeds(game, kind, 5) ? 'buy' : 'error'), crop: kind });
  });
  const left = SPRINKLER.max - game.sprinklersHeld - placedSprinklers(game);
  buttons.push({ x: BOX.x + BOX.w - 268, y: row(5) + 6, w: 248, h: 36, label: left > 0 ? `Sprinkler for ${SPRINKLER.price}` : 'Sold out', enabled: left > 0 && game.coins >= SPRINKLER.price, run: () => (buySprinkler(game) ? 'buy' : 'error'), sprinkler: true });
}

const UPGRADE_KEYS = ['field', 'can', 'compost', 'scarecrow', 'boots'];

function upgradeButtons(game, buttons) {
  UPGRADE_KEYS.forEach((key, i) => {
    const price = upgradePrice(game, key);
    buttons.push({ x: BOX.x + BOX.w - 160, y: row(i) + 6, w: 140, h: 36, label: price === null ? 'Maxed' : `Buy ${price}`, enabled: price !== null && game.coins >= price, run: () => (buyUpgrade(game, key) ? 'upgrade' : 'error'), upgrade: key });
  });
}

function drawButton(ctx, b, focused) {
  const isTab = b.tab !== undefined;
  roundRect(ctx, b.x, b.y, b.w, b.h, b.close ? 16 : 10);
  let fill = b.enabled ? (b.hot ? '#7fcf6e' : '#f6c25a') : '#e6d8bf';
  if (isTab) fill = b.selected ? '#fff9e8' : '#ead3a6';
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = focused ? 3.5 : 2;
  ctx.strokeStyle = focused ? '#e0612a' : 'rgba(138, 90, 51, 0.6)';
  ctx.stroke();
  if (b.label) text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, { size: b.close ? 18 : 15, align: 'center', color: b.enabled ? PALETTE.ink : '#a8957a' });
}

export function drawPanel(ctx, game, ui, t) {
  ctx.fillStyle = 'rgba(40, 30, 50, 0.38)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const buttons = panelButtons(game, ui);
  if (ui.kind === 'pause') {
    panel(ctx, VIEW.width / 2 - 170, BOX.y + 30, 340, 330, 'rgba(255, 246, 224, 0.98)', 18);
    text(ctx, 'Taking a breather', VIEW.width / 2, BOX.y + 70, { size: 26, align: 'center' });
  } else {
    panel(ctx, BOX.x, BOX.y, BOX.w, BOX.h, 'rgba(255, 246, 224, 0.98)', 18);
  }
  if (ui.kind === 'shop') drawShop(ctx, game, ui, t, buttons);
  if (ui.kind === 'board') drawBoardPanel(ctx, game, t);
  if (ui.kind === 'help') drawHelp(ctx);
  const focusable = buttons.filter((b) => b.tab === undefined && !b.close);
  buttons.forEach((b) => {
    if (b.tab !== undefined) b.selected = b.tab === ui.tab;
    drawButton(ctx, b, focusable[ui.cursor] === b);
  });
}

function drawShop(ctx, game, ui, t) {
  text(ctx, "Hazel's Market Stall", BOX.x + 24, BOX.y + 30, { size: 24 });
  text(ctx, `Coins: ${game.coins}`, BOX.x + BOX.w - 60, BOX.y + 30, { size: 16, align: 'right', color: '#a0660a' });
  CROP_ORDER.forEach((kind, i) => {
    const y = row(i);
    roundRect(ctx, BOX.x + 16, y, BOX.w - 32, 46, 10);
    ctx.fillStyle = i % 2 ? 'rgba(234, 211, 166, 0.35)' : 'rgba(234, 211, 166, 0.6)';
    if (ui.tab !== 2) ctx.fill();
  });
  if (ui.tab === 0) {
    CROP_ORDER.forEach((kind, i) => {
      const y = row(i) + 23;
      drawProduce(ctx, kind, BOX.x + 46, y - 6, 28, t);
      const hot = game.hotPick === kind ? `  HOT x${HOT_PICK_BONUS}` : '';
      text(ctx, `${CROPS[kind].name}${hot}`, BOX.x + 76, y - 8, { size: 16, color: hot ? '#c0471a' : PALETTE.ink });
      const perfect = game.perfectBasket[kind];
      text(ctx, `${game.basket[kind]} in basket${perfect ? `, ${perfect} perfect` : ''}  ·  ${sellPrice(game, kind, false)}c each`, BOX.x + 76, y + 11, { size: 13, color: '#7a5a44', weight: 'normal' });
    });
    text(ctx, `Perfect crops (never left dry) sell for ${PERFECT_BONUS}x.`, BOX.x + 24, BOX.y + BOX.h - 20, { size: 13, color: '#7a5a44', weight: 'normal' });
  } else if (ui.tab === 1) {
    CROP_ORDER.forEach((kind, i) => {
      const y = row(i) + 23;
      const info = CROPS[kind];
      ctx.globalAlpha = seedAvailable(game, kind) ? 1 : 0.4;
      drawSeedPacket(ctx, kind, BOX.x + 46, y, 34);
      text(ctx, `${info.name}  (have ${game.seeds[kind]})`, BOX.x + 76, y - 8, { size: 16 });
      const regrow = info.regrow ? ', fruits again' : '';
      text(ctx, `Sells ${info.price}c · ripe in ${info.growth}s of water${regrow}`, BOX.x + 76, y + 11, { size: 13, color: '#7a5a44', weight: 'normal' });
      ctx.globalAlpha = 1;
    });
    const y = row(5) + 23;
    drawSprinklerIcon(ctx, BOX.x + 46, y, 30, t);
    text(ctx, `Sprinkler (have ${game.sprinklersHeld})`, BOX.x + 76, y - 8, { size: 16 });
    text(ctx, 'Waters the 8 plots around it', BOX.x + 76, y + 11, { size: 13, color: '#7a5a44', weight: 'normal' });
  } else {
    UPGRADE_KEYS.forEach((key, i) => {
      const y = row(i);
      roundRect(ctx, BOX.x + 16, y, BOX.w - 32, 46, 10);
      ctx.fillStyle = i % 2 ? 'rgba(234, 211, 166, 0.35)' : 'rgba(234, 211, 166, 0.6)';
      ctx.fill();
      const up = UPGRADES[key];
      text(ctx, up.name, BOX.x + 32, y + 15, { size: 16 });
      let about = up.about;
      if (key === 'can') about = `${up.about} (${CAN_CAPACITY.join(' / ')} drops)`;
      text(ctx, about, BOX.x + 32, y + 34, { size: 13, color: '#7a5a44', weight: 'normal' });
      for (let l = 0; l < up.prices.length; l += 1) {
        ctx.beginPath();
        ctx.arc(BOX.x + 360 + l * 18, y + 23, 6, 0, Math.PI * 2);
        ctx.fillStyle = l < game.levels[key] ? '#7fcf6e' : '#e6d8bf';
        ctx.fill();
        ctx.strokeStyle = 'rgba(138, 90, 51, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }
  text(ctx, 'Tab / arrows to browse · Enter to buy · Esc to close', BOX.x + BOX.w - 24, BOX.y + BOX.h - 20, { size: 12, align: 'right', color: '#a08a70', weight: 'normal' });
}

function drawBoardPanel(ctx, game, t) {
  text(ctx, 'Village Order Board', BOX.x + 24, BOX.y + 30, { size: 24 });
  text(ctx, 'Neighbours pay extra for these. Orders leave when their days run out.', BOX.x + 24, BOX.y + 58, { size: 14, color: '#7a5a44', weight: 'normal' });
  game.orders.forEach((order, i) => {
    const x = BOX.x + 30 + i * 196;
    const y = BOX.y + 84;
    ctx.save();
    ctx.translate(x + 88, y + 110);
    ctx.rotate((i - 1) * 0.02);
    roundRect(ctx, -88, -110, 176, 220, 10);
    ctx.fillStyle = ['#fff1cf', '#ffe6ee', '#e6f4ff'][i % 3];
    ctx.fill();
    ctx.strokeStyle = 'rgba(138, 90, 51, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e45b5b';
    ctx.beginPath();
    ctx.arc(0, -102, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    text(ctx, order.from, x + 88, y + 26, { size: 16, align: 'center' });
    drawProduce(ctx, order.kind, x + 88, y + 62, 40, t);
    text(ctx, `${order.qty} x ${CROPS[order.kind].name}`, x + 88, y + 118, { size: 17, align: 'center' });
    text(ctx, `have ${game.basket[order.kind]}`, x + 88, y + 140, { size: 13, align: 'center', color: canFill(game, order) ? '#2f7a3a' : '#a07a5a', weight: 'normal' });
    text(ctx, `Pays ${order.reward}c`, x + 88, y + 168, { size: 18, align: 'center', color: '#a0660a' });
    text(ctx, order.days > 1 ? `${order.days} days left` : 'Last day!', x + 88, y + 192, { size: 13, align: 'center', color: order.days > 1 ? '#7a5a44' : '#c0471a', weight: 'normal' });
  });
  if (!game.orders.length) text(ctx, 'All done! New orders arrive tomorrow morning.', VIEW.width / 2, BOX.y + 200, { size: 18, align: 'center' });
}

const HELP_LINES = [
  ['Move', 'WASD or arrow keys, or click a tile to walk there'],
  ['Act', 'Space / E or click a tile: till, plant, water, harvest. Hold and sweep for rows'],
  ['Seeds', '1-6, Q / R or the mouse wheel pick seeds or a sprinkler'],
  ['Water', 'Thirsty crops show a drop. Refill your can at the well'],
  ['Sell', 'Visit the market stall: sell, buy seeds and upgrades'],
  ['Orders', 'The board by the stall pays extra for crops'],
  ['Crows', 'Click them or walk up to shoo them off your crops'],
  ['Sleep', 'Click the cottage door to end the day early'],
  ['Pause', 'Esc or P pauses · M mutes the music'],
];

function drawHelp(ctx) {
  text(ctx, 'How to farm', BOX.x + 24, BOX.y + 30, { size: 24 });
  text(ctx, 'Earn coins over 10 days. Reach the Harvest Festival goal for a ribbon!', BOX.x + 24, BOX.y + 60, { size: 15, color: '#7a5a44' });
  HELP_LINES.forEach(([key, line], i) => {
    const y = BOX.y + 92 + i * 30;
    roundRect(ctx, BOX.x + 24, y - 11, 74, 22, 8);
    ctx.fillStyle = '#f6c25a';
    ctx.fill();
    text(ctx, key, BOX.x + 61, y + 0.5, { size: 13, align: 'center' });
    text(ctx, line, BOX.x + 112, y, { size: 14, weight: 'normal' });
  });
}

/** Run a click on the panel; returns what happened or null when nothing was hit. */
export function clickPanel(game, ui, x, y) {
  for (const b of panelButtons(game, ui)) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      if (!b.enabled) return 'disabled';
      return b.run();
    }
  }
  const inside = ui.kind === 'pause' ? Math.abs(x - VIEW.width / 2) < 170 && y > BOX.y + 30 && y < BOX.y + 360 : x >= BOX.x && x <= BOX.x + BOX.w && y >= BOX.y && y <= BOX.y + BOX.h;
  return inside ? null : 'close';
}

/** Keyboard on a panel: arrows move the focus, Enter presses, Tab and left/right change tab. */
export function keyPanel(game, ui, key) {
  const focusable = panelButtons(game, ui).filter((b) => b.tab === undefined && !b.close);
  if (key === 'Escape') return 'close';
  if (ui.kind === 'shop' && (key === 'Tab' || key === 'ArrowRight' || key === 'ArrowLeft')) {
    const dir = key === 'ArrowLeft' ? -1 : 1;
    ui.tab = (ui.tab + dir + SHOP_TABS.length) % SHOP_TABS.length;
    ui.cursor = 0;
    return 'tab';
  }
  if (!focusable.length) return null;
  if (key === 'ArrowDown' || key === 's' || key === 'S' || ((key === 'ArrowRight' || key === 'Tab') && ui.kind !== 'shop')) {
    ui.cursor = (ui.cursor + 1) % focusable.length;
    return 'move';
  }
  if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'ArrowLeft') {
    ui.cursor = (ui.cursor - 1 + focusable.length) % focusable.length;
    return 'move';
  }
  if (key === 'Enter' || key === ' ') {
    const b = focusable[Math.min(ui.cursor, focusable.length - 1)];
    return b.enabled ? b.run() : 'disabled';
  }
  return null;
}

