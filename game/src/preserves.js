// The preserves workshop: kettles cook a batch of one crop into jars (pickles, juice, jam, butter)
// that sell for more than the raw crop. A batch takes time and kettles are few, so each harvest asks:
// sell it now, or preserve it for later?
import { CROP_ORDER, CROPS, PLACES, PRESERVES, RESTORE, SKILLS, TILE, WORLD_Y } from './config.js';
import { takeFromBasket } from './market.js';
import { addXp, hasPerk } from './skills.js';
import { emit } from './state.js';

const DOOR = { x: (PLACES.workshop.c + 1.5) * TILE, y: PLACES.workshop.r * TILE + WORLD_Y + 30 };

export function kettleCount(game) {
  return Math.min(PRESERVES.maxKettles, PRESERVES.kettles + (hasPerk(game, 'kettle') ? 1 : 0));
}

/** What one jar sells for: the crop's price times the preserve value, the bakery and Jam Master. */
export function jarPrice(game, kind) {
  let price = CROPS[kind].price * PRESERVES.value;
  if (game.restored.bakery) price *= RESTORE.bakeryJars;
  if (hasPerk(game, 'jam')) price *= 1.2;
  return Math.round(price);
}

export function cookSeconds(game, qty) {
  return (PRESERVES.seconds + PRESERVES.perItem * qty) * (hasPerk(game, 'quick') ? 0.6 : 1);
}

export function freeKettle(game) {
  for (let i = 0; i < kettleCount(game); i += 1) if (!game.kettles[i]) return i;
  return -1;
}

export function busyKettles(game) {
  return game.kettles.filter(Boolean).length;
}

/** Put up to a batch of one crop from the basket into a free kettle. */
export function loadKettle(game, kind) {
  const i = freeKettle(game);
  if (i < 0) {
    emit(game, 'error', 0, 0, 'Every kettle is busy');
    return false;
  }
  const qty = Math.min(PRESERVES.batch, game.basket[kind]);
  if (qty <= 0) {
    emit(game, 'error', 0, 0, `No ${CROPS[kind].name} in your basket`);
    return false;
  }
  takeFromBasket(game, kind, qty);
  const time = cookSeconds(game, qty);
  game.kettles[i] = { kind, qty, left: time, total: time };
  emit(game, 'cook', DOOR.x, DOOR.y, `Cooking ${qty} ${PRESERVES.goods[kind]}`);
  return true;
}

/** Kettles bubble along; a finished batch goes into the pantry as jars. */
export function updateKettles(game, dt) {
  game.kettles.forEach((kettle, i) => {
    if (!kettle) return;
    kettle.left -= dt;
    if (kettle.left > 0) return;
    game.goods[kettle.kind] += kettle.qty;
    game.stats.processed += kettle.qty;
    game.kettles[i] = null;
    addXp(game, SKILLS.xp.batch);
    emit(game, 'jars', DOOR.x, DOOR.y, `${kettle.qty} ${PRESERVES.goods[kettle.kind]} ready!`);
  });
}

/** Kettles keep cooking while the farmer sleeps. */
export function cookOvernight(game) {
  updateKettles(game, 1e6);
}

export function pantryCount(game) {
  return CROP_ORDER.reduce((sum, kind) => sum + game.goods[kind], 0);
}

export function pantryValue(game) {
  return CROP_ORDER.reduce((sum, kind) => sum + game.goods[kind] * jarPrice(game, kind), 0);
}

/** Take every jar of one kind (or all kinds when kind is null) for sale. Returns their coins. */
export function takeJarsForSale(game, kind) {
  let made = 0;
  for (const k of kind ? [kind] : CROP_ORDER) {
    made += game.goods[k] * jarPrice(game, k);
    game.stats.jarsSold += game.goods[k];
    game.goods[k] = 0;
  }
  return made;
}
