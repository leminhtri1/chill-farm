// The heads-up display: day, clock and weather, coins, the festival goal bar, the watering can,
// the basket, the seed hotbar, action hints and message toasts.
import { drawProduce, drawSeedPacket } from './crop-art.js';
import { PALETTE, roundRect } from './draw-kit.js';
import { drawCoin, drawDrop, drawSprinklerIcon } from './icon-art.js';
import { CAN_CAPACITY, CROPS, HOT_PICK_BONUS, SEASON, VIEW } from './config.js';
import { clockText } from './calendar.js';
import { basketCount, basketValue, seedAvailable } from './market.js';
import { hotbarItems } from './state.js';

export const FONT = '"Trebuchet MS", "Segoe UI", "Verdana", sans-serif';

export function panel(ctx, x, y, w, h, fill = 'rgba(255, 246, 224, 0.94)', r = 12) {
  ctx.save();
  ctx.shadowColor = 'rgba(60, 40, 20, 0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = 'rgba(138, 90, 51, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function text(ctx, str, x, y, { size = 16, color = PALETTE.ink, align = 'left', weight = 'bold', base = 'middle' } = {}) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

const WEATHER_LOOK = { sunny: { label: 'Sunny', icon: 'sun' }, rain: { label: 'Rainy', icon: 'rain' }, breeze: { label: 'Breezy', icon: 'breeze' } };

export function drawWeatherIcon(ctx, kind, x, y, r, t = 0) {
  if (kind === 'sun' || kind === 'sunny') {
    ctx.fillStyle = '#ffcf40';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + t * 0.5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - r * 0.5, y + r * 0.1, r * 0.6, 0, Math.PI * 2);
  ctx.arc(x + r * 0.2, y - r * 0.25, r * 0.75, 0, Math.PI * 2);
  ctx.arc(x + r * 0.8, y + r * 0.15, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 140, 170, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (kind === 'rain') {
    ctx.strokeStyle = '#5fb2e8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5 + i * r * 0.55, y + r * 0.8);
      ctx.lineTo(x - r * 0.7 + i * r * 0.55, y + r * 1.3);
      ctx.stroke();
    }
  } else if (kind === 'breeze') {
    ctx.strokeStyle = '#7fc8a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - r, y + r * 0.95);
    ctx.quadraticCurveTo(x, y + r * 0.7, x + r * 1.1, y + r * 1.05);
    ctx.stroke();
  }
}

export function drawHud(ctx, game, t) {
  // day, weather and clock
  panel(ctx, 8, 6, 214, 50);
  const look = WEATHER_LOOK[game.weather];
  drawWeatherIcon(ctx, look.icon, 34, 31, 11, t);
  text(ctx, `Day ${game.day} / ${SEASON.days}`, 56, 22, { size: 18 });
  text(ctx, `${look.label} · ${clockText(game)}`, 56, 42, { size: 13, color: '#7a5a44' });
  // clock dial
  const cx = 198;
  const cy = 31;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#e8f4ff';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, 15, -Math.PI / 2, -Math.PI / 2 + game.clock * Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = game.clock > 0.75 ? '#7d82d6' : '#ffcf40';
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.stroke();

  // coins
  panel(ctx, 230, 6, 132, 50);
  drawCoin(ctx, 256, 31, 13);
  text(ctx, `${game.coins}`, 276, 31, { size: 24 });

  // festival goal
  panel(ctx, 370, 6, 260, 50);
  const progress = Math.min(1, game.earned / SEASON.goal);
  text(ctx, game.goalReached ? 'Score · blue ribbon won! Gold next' : 'Score · Harvest Festival goal', 384, 20, { size: 13, color: '#7a5a44' });
  roundRect(ctx, 384, 31, 232, 16, 8);
  ctx.fillStyle = '#ead9b8';
  ctx.fill();
  if (progress > 0) {
    roundRect(ctx, 384, 31, Math.max(16, 232 * progress), 16, 8);
    ctx.fillStyle = game.goalReached ? '#5f9ff0' : '#7fcf6e';
    ctx.fill();
  }
  const target = game.goalReached ? SEASON.goldGoal : SEASON.goal;
  text(ctx, `${game.earned} / ${target}`, 500, 39.5, { size: 12, align: 'center', color: '#3c2a20' });

  // watering can
  panel(ctx, 638, 6, 150, 50);
  const cap = CAN_CAPACITY[game.levels.can];
  drawDrop(ctx, 660, 33, 8);
  text(ctx, 'Water', 676, 20, { size: 13, color: '#7a5a44' });
  roundRect(ctx, 676, 31, 100, 14, 7);
  ctx.fillStyle = '#d6e8f2';
  ctx.fill();
  if (game.water > 0) {
    roundRect(ctx, 676, 31, Math.max(14, (100 * game.water) / cap), 14, 7);
    ctx.fillStyle = game.water <= 2 ? '#f08a6a' : '#5fb2e8';
    ctx.fill();
  }
  text(ctx, `${game.water}/${cap}`, 726, 38.5, { size: 11, align: 'center', color: '#24445a' });

  // basket
  panel(ctx, 796, 6, 156, 50);
  ctx.save();
  ctx.translate(820, 32);
  ctx.fillStyle = '#d9a066';
  roundRect(ctx, -13, -6, 26, 16, 5);
  ctx.fill();
  ctx.strokeStyle = '#a8703c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -6, 10, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
  text(ctx, `Basket ${basketCount(game)}`, 840, 22, { size: 14 });
  text(ctx, `worth ${basketValue(game)}c`, 840, 41, { size: 13, color: '#7a5a44' });

  drawHotPick(ctx, game);
  drawHotbar(ctx, game, t);
}

function drawHotPick(ctx, game) {
  panel(ctx, 8, 62, 164, 30, 'rgba(255, 233, 160, 0.95)', 10);
  text(ctx, 'Hot pick today:', 18, 77, { size: 12, color: '#8a4a1a' });
  drawProduce(ctx, game.hotPick, 120, 72, 16);
  text(ctx, `x${HOT_PICK_BONUS}`, 134, 77, { size: 13, color: '#c0471a' });
}

/** Hotbar slots, as rectangles in logical pixels, so clicks can pick one. */
export function hotbarSlots(game) {
  const items = hotbarItems(game);
  const size = 50;
  const gap = 6;
  const width = items.length * size + (items.length - 1) * gap;
  const x0 = (VIEW.width - width) / 2;
  return items.map((item, i) => ({ item, x: x0 + i * (size + gap), y: VIEW.height - size - 8, w: size, h: size, index: i }));
}

function drawHotbar(ctx, game, t) {
  const slots = hotbarSlots(game);
  const first = slots[0];
  const last = slots[slots.length - 1];
  panel(ctx, first.x - 8, first.y - 8, last.x + last.w - first.x + 16, first.h + 14, 'rgba(255, 246, 224, 0.9)', 14);
  for (const slot of slots) {
    const selected = slot.index === game.selected;
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 10);
    ctx.fillStyle = selected ? '#fff9e8' : '#f1e0bd';
    ctx.fill();
    ctx.lineWidth = selected ? 3.5 : 1.5;
    ctx.strokeStyle = selected ? '#e0912a' : 'rgba(138, 90, 51, 0.5)';
    ctx.stroke();
    const cx = slot.x + slot.w / 2;
    const cy = slot.y + slot.h / 2 - 2;
    let count;
    let locked = false;
    if (slot.item.kind === 'seed') {
      const kind = slot.item.crop;
      locked = !seedAvailable(game, kind) && game.seeds[kind] === 0;
      ctx.globalAlpha = locked ? 0.35 : 1;
      drawSeedPacket(ctx, kind, cx, cy, 30);
      ctx.globalAlpha = 1;
      count = game.seeds[kind];
    } else {
      drawSprinklerIcon(ctx, cx, cy, 30, selected ? t : 0);
      count = game.sprinklersHeld;
    }
    text(ctx, `${slot.index + 1}`, slot.x + 6, slot.y + 9, { size: 11, color: '#a07a5a' });
    if (locked) {
      const day = CROPS[slot.item.crop].unlockDay;
      text(ctx, `Day ${day}`, cx, slot.y + slot.h - 8, { size: 10, align: 'center', color: '#a07a5a' });
    } else {
      ctx.font = `bold 14px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fff6e0';
      ctx.strokeText(`${count}`, slot.x + slot.w - 4, slot.y + slot.h - 9);
      text(ctx, `${count}`, slot.x + slot.w - 4, slot.y + slot.h - 9, { size: 14, align: 'right', color: count ? PALETTE.ink : '#c06050' });
    }
  }
  const sel = slots[game.selected];
  const name = sel.item.kind === 'seed' ? `${CROPS[sel.item.crop].name} seeds` : 'Sprinkler';
  text(ctx, name, VIEW.width / 2, first.y - 18, { size: 13, align: 'center', color: '#fff6e0' });
}

/** The hint under the pointer or the farmer: what clicking or Space will do there. */
export function drawActionHint(ctx, hint, x, y) {
  if (!hint) return;
  ctx.font = `bold 13px ${FONT}`;
  const w = ctx.measureText(hint).width + 18;
  const px = Math.min(VIEW.width - w - 4, Math.max(4, x - w / 2));
  roundRect(ctx, px, y, w, 22, 11);
  ctx.fillStyle = 'rgba(74, 52, 40, 0.85)';
  ctx.fill();
  text(ctx, hint, px + w / 2, y + 11.5, { size: 13, align: 'center', color: '#fff6e0' });
}

const TOAST_COLORS = { info: '#4a3428', good: '#2f7a3a', bad: '#a33a2a', gold: '#a0660a' };

export function drawToasts(ctx, fx) {
  fx.toasts.forEach((toast, i) => {
    ctx.globalAlpha = Math.min(1, toast.life * 2);
    ctx.font = `bold 15px ${FONT}`;
    const w = ctx.measureText(toast.text).width + 30;
    const x = VIEW.width / 2 - w / 2;
    const y = 100 + i * 34;
    panel(ctx, x, y, w, 28, 'rgba(255, 246, 224, 0.96)', 14);
    text(ctx, toast.text, VIEW.width / 2, y + 14.5, { size: 15, align: 'center', color: TOAST_COLORS[toast.tone] });
  });
  ctx.globalAlpha = 1;
}
