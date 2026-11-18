// The market stall: selling the basket, buying seeds, sprinklers and farm upgrades.
import {
  CAN_CAPACITY, CROP_ORDER, CROPS, HOT_PICK_BONUS, PERFECT_BONUS, SEASON, SPRINKLER, UPGRADES,
} from './config.js';
import { takeJarsForSale } from './preserves.js';
import { hasPerk } from './skills.js';
import { emit } from './state.js';

/** What one crop sells for today at the stall. */
export function sellPrice(game, kind, perfect) {
  let price = CROPS[kind].price;
  if (game.hotPick === kind) price *= HOT_PICK_BONUS;
  if (perfect) price *= PERFECT_BONUS;
  if (hasPerk(game, 'haggle')) price *= 1.1;
  return Math.round(price);
}

export function basketValue(game) {
  let total = 0;
  for (const kind of CROP_ORDER) {
    const perfect = game.perfectBasket[kind];
    const plain = game.basket[kind] - perfect;
    total += perfect * sellPrice(game, kind, true) + plain * sellPrice(game, kind, false);
  }
  return total;
}

export function basketCount(game) {
  return CROP_ORDER.reduce((sum, kind) => sum + game.basket[kind], 0);
}

/** Take one crop out of the basket, a plain one first so Perfect ones are kept for selling. */
export function takeFromBasket(game, kind, count) {
  for (let i = 0; i < count; i += 1) {
    const plain = game.basket[kind] - game.perfectBasket[kind];
    if (plain <= 0) game.perfectBasket[kind] -= 1;
    game.basket[kind] -= 1;
  }
}

export function earn(game, amount) {
  game.coins += amount;
  game.earned += amount;
  game.stats.dayEarned += amount;
  if (!game.goalReached && game.earned >= SEASON.goal) {
    game.goalReached = true;
    emit(game, 'goal', 480, 200, 'Festival goal reached!');
  }
}

/** Sell every crop and jar of one kind (or all kinds when kind is null). Returns coins made. */
export function sellBasket(game, kind) {
  let made = 0;
  for (const k of kind ? [kind] : CROP_ORDER) {
    const perfect = game.perfectBasket[k];
    const plain = game.basket[k] - perfect;
    made += perfect * sellPrice(game, k, true) + plain * sellPrice(game, k, false);
    game.basket[k] = 0;
    game.perfectBasket[k] = 0;
  }
  made += takeJarsForSale(game, kind);
  if (made > 0) {
    earn(game, made);
    emit(game, 'sell', 0, 0, `+${made} coins`);
  }
  return made;
}

export function seedAvailable(game, kind) {
  const info = CROPS[kind];
  return game.day >= info.unlockDay && (!info.landmark || !!(game.restored && game.restored[info.landmark]));
}

export function buySeeds(game, kind, count) {
  const cost = CROPS[kind].seed * count;
  if (!seedAvailable(game, kind)) {
    const info = CROPS[kind];
    emit(game, 'error', 0, 0, info.landmark && game.day >= info.unlockDay ? `${info.name} seeds come once the bridge is fixed` : `${info.name} arrives on day ${info.unlockDay}`);
    return false;
  }
  if (game.coins < cost) {
    emit(game, 'error', 0, 0, 'Not enough coins');
    return false;
  }
  game.coins -= cost;
  game.seeds[kind] += count;
  emit(game, 'buy', 0, 0, `+${count} ${CROPS[kind].name} seeds`);
  return true;
}

export function buySprinkler(game) {
  if (game.sprinklersHeld + placedSprinklers(game) >= SPRINKLER.max) {
    emit(game, 'error', 0, 0, 'That is all the sprinklers we have');
    return false;
  }
  if (game.coins < SPRINKLER.price) {
    emit(game, 'error', 0, 0, 'Not enough coins');
    return false;
  }
  game.coins -= SPRINKLER.price;
  game.sprinklersHeld += 1;
  emit(game, 'buy', 0, 0, 'Sprinkler: pick it on the hotbar, place on tilled soil');
  return true;
}

export function placedSprinklers(game) {
  return game.plots.reduce((n, plot) => n + (plot && plot.sprinkler ? 1 : 0), 0);
}

/** The next price of an upgrade, or null once it is maxed. */
export function upgradePrice(game, key) {
  const prices = UPGRADES[key].prices;
  const level = game.levels[key];
  return level < prices.length ? prices[level] : null;
}

export function buyUpgrade(game, key) {
  const price = upgradePrice(game, key);
  if (price === null) {
    emit(game, 'error', 0, 0, 'Already the best');
    return false;
  }
  if (game.coins < price) {
    emit(game, 'error', 0, 0, 'Not enough coins');
    return false;
  }
  game.coins -= price;
  game.levels[key] += 1;
  if (key === 'can') game.water = CAN_CAPACITY[game.levels.can];
  emit(game, 'upgrade', 0, 0, `${UPGRADES[key].name} upgraded!`);
  return true;
}

/**
 * A farmer who gave everything away is never stuck: with no coins, seeds, crops or jars left, Hazel
 * spots them a few turnip seeds in the morning.
 */
export function helpingHand(game) {
  const growing = game.plots.some((plot) => plot && plot.crop);
  const seeds = CROP_ORDER.some((kind) => game.seeds[kind] > 0);
  const goods = CROP_ORDER.some((kind) => game.basket[kind] > 0 || game.goods[kind] > 0);
  if (growing || seeds || goods || game.coins >= CROPS.turnip.seed * 3) return;
  game.seeds.turnip += 4;
  emit(game, 'buy', 0, 0, 'Hazel left you 4 turnip seeds. Plant them!');
}

/** Pick the day's Hot Pick among the crops on sale, never the same twice in a row. */
export function rollHotPick(game) {
  const options = CROP_ORDER.filter((kind) => seedAvailable(game, kind) && kind !== game.hotPick);
  game.hotPick = game.rng.pick(options.length ? options : CROP_ORDER);
}
