// The field rules: tilling, planting, watering, growing, sprinklers and harvesting.
import {
  CAN_CAPACITY, COMBO, COMPOST_SPEED, CROPS, GOLDEN, PERFECT_DRY_LIMIT, PLACES, SPRINKLER, WATER_SECONDS,
} from './config.js';
import { earn } from './market.js';
import { emit, forEachPlot, plotAt, selectedItem, tileCenter } from './state.js';

export const STAGES = 4;

/** Growth stage 0..3 of a crop (3 is ripe). */
export function cropStage(crop) {
  if (crop.ripe) return STAGES - 1;
  return Math.min(STAGES - 2, Math.floor(crop.growth * (STAGES - 1)));
}

export function isWet(plot) {
  return plot.crop ? plot.crop.water > 0 : plot.wet > 0;
}

/** What a tile is: the house door, well, stall, board, a plot, or nothing to do. */
export function placeAt(game, c, r) {
  const inside = (p) => c >= p.c && c < p.c + (p.w ?? 1) && r >= p.r && r < p.r + (p.h ?? 1);
  if (inside(PLACES.house) || (c === PLACES.door.c && r === PLACES.door.r)) return 'house';
  if (inside(PLACES.well) || inside(PLACES.pond)) return 'well';
  if (inside(PLACES.stall)) return 'stall';
  if (inside(PLACES.board)) return 'board';
  if (plotAt(game, c, r)) return 'plot';
  return null;
}

/**
 * The one smart action on a tile, chosen by what is there: till bare field, plant (or place a
 * sprinkler) on tilled soil, water a thirsty crop, harvest a ripe one, refill at the well, or open
 * the stall, the order board or the house. Returns a short word for the main loop.
 */
export function actOnTile(game, c, r) {
  const place = placeAt(game, c, r);
  const at = tileCenter(c, r);
  if (place === 'well') {
    const cap = CAN_CAPACITY[game.levels.can];
    if (game.water >= cap) {
      emit(game, 'note', at.x, at.y, 'Can is full');
      return 'none';
    }
    game.water = cap;
    emit(game, 'refill', at.x, at.y, 'Refilled!');
    return 'refill';
  }
  if (place === 'stall' || place === 'board' || place === 'house') return place;
  if (place !== 'plot') return 'none';

  const plot = plotAt(game, c, r);
  if (!plot.tilled) {
    plot.tilled = true;
    plot.wet = game.weather === 'rain' ? 999 : 0;
    emit(game, 'till', at.x, at.y);
    return 'till';
  }
  if (plot.crop && plot.crop.ripe) return harvest(game, plot);
  if (plot.crop) return water(game, plot);
  if (plot.sprinkler) {
    emit(game, 'note', at.x, at.y, 'Sprinkler here');
    return 'none';
  }
  const item = selectedItem(game);
  if (item.kind === 'sprinkler') {
    if (game.sprinklersHeld <= 0) {
      emit(game, 'error', at.x, at.y, 'No sprinklers: buy at the stall');
      return 'none';
    }
    game.sprinklersHeld -= 1;
    plot.sprinkler = true;
    plot.sprinkle = 0.5;
    emit(game, 'place', at.x, at.y, 'Sprinkler placed');
    return 'place';
  }
  return plant(game, plot, item.crop);
}

function plant(game, plot, kind) {
  const at = tileCenter(plot.c, plot.r);
  if (game.seeds[kind] <= 0) {
    if (plot.wet <= 0 && game.water > 0) {
      game.water -= 1;
      plot.wet = WATER_SECONDS;
      emit(game, 'water', at.x, at.y);
      return 'water';
    }
    emit(game, 'error', at.x, at.y, `No ${CROPS[kind].name} seeds`);
    return 'none';
  }
  game.seeds[kind] -= 1;
  plot.crop = { kind, growth: 0, water: Math.max(0, plot.wet), dry: 0, ripe: false, harvests: 0, wiggle: 1 };
  plot.wet = 0;
  game.stats.planted += 1;
  emit(game, 'plant', at.x, at.y);
  return 'plant';
}

function water(game, plot) {
  const at = tileCenter(plot.c, plot.r);
  if (plot.crop.water > WATER_SECONDS * 0.6) {
    emit(game, 'note', at.x, at.y, 'Already watered');
    return 'none';
  }
  if (game.water <= 0) {
    emit(game, 'error', at.x, at.y, 'Can is empty: refill at the well');
    return 'none';
  }
  game.water -= 1;
  plot.crop.water = WATER_SECONDS;
  plot.crop.wiggle = 1;
  emit(game, 'water', at.x, at.y);
  return 'water';
}

function harvest(game, plot) {
  const at = tileCenter(plot.c, plot.r);
  const crop = plot.crop;
  const info = CROPS[crop.kind];
  const perfect = crop.dry < PERFECT_DRY_LIMIT;
  game.basket[crop.kind] += 1;
  if (perfect) game.perfectBasket[crop.kind] += 1;
  game.stats.harvested += 1;
  if (perfect) game.stats.perfect += 1;
  emit(game, perfect ? 'perfect' : 'harvest', at.x, at.y, perfect ? `Perfect ${info.name}!` : `+1 ${info.name}`);
  // quick harvests in a row build a combo that tips a few coins
  game.combo.count = game.combo.timer > 0 ? game.combo.count + 1 : 1;
  game.combo.timer = COMBO.window;
  game.stats.bestCombo = Math.max(game.stats.bestCombo, game.combo.count);
  if (game.combo.count >= 3) {
    const tip = game.combo.count * COMBO.coinsPerStep;
    earn(game, tip);
    emit(game, 'combo', at.x, at.y - 34, `Combo x${game.combo.count}  +${tip}`);
  }
  // now and then a crop comes up golden
  if (game.rng.chance(GOLDEN.chance)) {
    const bonus = Math.round(info.price * GOLDEN.bonus);
    earn(game, bonus);
    game.stats.golden += 1;
    emit(game, 'golden', at.x, at.y, `Golden ${info.name}! +${bonus}`);
  }
  if (info.regrow > 0 && crop.harvests < 4) {
    crop.harvests += 1;
    crop.ripe = false;
    crop.growth = 1 - info.regrow / info.growth;
    crop.dry = 0;
    crop.wiggle = 1;
  } else {
    plot.crop = null;
    plot.wet = 0;
  }
  return 'harvest';
}

/** A few words saying what acting on a tile would do, for the pointer and facing hints. */
export function describeTile(game, c, r) {
  const place = placeAt(game, c, r);
  if (place === 'well') return 'Refill watering can';
  if (place === 'stall') return "Open Hazel's market";
  if (place === 'board') return 'Read the order board';
  if (place === 'house') return 'Sleep until morning';
  if (place !== 'plot') return null;
  const plot = plotAt(game, c, r);
  if (!plot.tilled) return 'Till the soil';
  const crop = plot.crop;
  if (crop && crop.ripe) return `Harvest ${CROPS[crop.kind].name}`;
  if (crop) {
    const pct = Math.round(crop.growth * 100);
    return crop.water > 0 ? `${CROPS[crop.kind].name}: ${pct}% grown` : `Water ${CROPS[crop.kind].name}`;
  }
  if (plot.sprinkler) return 'Sprinkler';
  const item = selectedItem(game);
  if (item.kind === 'sprinkler') return game.sprinklersHeld ? 'Place sprinkler' : 'No sprinklers';
  return game.seeds[item.crop] > 0 ? `Plant ${CROPS[item.crop].name}` : `No ${CROPS[item.crop].name} seeds`;
}

/** Grow every crop one step: watered crops grow, dry ones wait (and stop being Perfect). */
export function updateField(game, dt) {
  const speed = COMPOST_SPEED[game.levels.compost];
  const raining = game.weather === 'rain';
  game.combo.timer = Math.max(0, game.combo.timer - dt);
  forEachPlot(game, (plot) => {
    if (plot.sprinkler) {
      plot.sprinkle -= dt;
      if (plot.sprinkle <= 0) {
        plot.sprinkle = SPRINKLER.interval;
        sprinkle(game, plot);
      }
    }
    if (plot.tilled && !plot.crop && plot.wet > 0) plot.wet -= dt;
    if (raining && plot.tilled && !plot.crop) plot.wet = 999;
    const crop = plot.crop;
    if (!crop) return;
    crop.wiggle = Math.max(0, crop.wiggle - dt * 2.5);
    if (raining) crop.water = Math.max(crop.water, WATER_SECONDS);
    if (crop.ripe) return;
    if (crop.water > 0) {
      crop.water -= dt;
      const before = cropStage(crop);
      crop.growth += (dt * speed) / CROPS[crop.kind].growth;
      if (crop.growth >= 1) {
        crop.growth = 1;
        crop.ripe = true;
        crop.wiggle = 1;
        const at = tileCenter(plot.c, plot.r);
        emit(game, 'ripe', at.x, at.y);
      } else if (cropStage(crop) !== before) {
        crop.wiggle = 1;
      }
    } else {
      crop.dry += dt;
    }
  });
}

/** A sprinkler waters the eight plots around it. */
function sprinkle(game, plot) {
  let any = false;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const near = plotAt(game, plot.c + dc, plot.r + dr);
      if (!near || !near.tilled) continue;
      if (near.crop && !near.crop.ripe) {
        near.crop.water = WATER_SECONDS;
        any = true;
      } else if (!near.crop) {
        near.wet = WATER_SECONDS;
      }
    }
  }
  const at = tileCenter(plot.c, plot.r);
  emit(game, any ? 'sprinkle' : 'sprinkle-quiet', at.x, at.y);
}

/** Overnight: wet soil dries a little, and rain tomorrow will soak everything again. */
export function overnight(game) {
  forEachPlot(game, (plot) => {
    if (plot.crop) plot.crop.water = Math.min(plot.crop.water, WATER_SECONDS * 0.5);
    else plot.wet = 0;
  });
}
