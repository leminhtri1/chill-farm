// The game state: a fresh farm for a new season, and the map helpers every rule uses.
import { CAN_CAPACITY, COLS, CROP_ORDER, FIELD_LEVELS, PLACES, ROWS, SEASON, TILE, WORLD_Y } from './config.js';
import { createRandom } from './random.js';

/** Terrain kinds of the map's tiles. */
export const T_GRASS = 0;
export const T_HEDGE = 1;
export const T_PATH = 2;
export const T_BUILDING = 3;
export const T_WATER = 4;

export function createGame(seed) {
  const rng = createRandom(seed);
  const game = {
    seed,
    rng,
    time: 0,
    day: 1,
    /** Seconds into the current day. */
    clock: 0,
    weather: 'sunny',
    tomorrow: 'sunny',
    coins: SEASON.startCoins,
    earned: 0,
    goalReached: false,
    seeds: { turnip: 6, carrot: 0, berry: 0, pumpkin: 0, moonmelon: 0 },
    basket: { turnip: 0, carrot: 0, berry: 0, pumpkin: 0, moonmelon: 0 },
    perfectBasket: { turnip: 0, carrot: 0, berry: 0, pumpkin: 0, moonmelon: 0 },
    sprinklersHeld: 0,
    water: CAN_CAPACITY[0],
    levels: { field: 0, can: 0, compost: 0, scarecrow: 0, boots: 0 },
    selected: 0,
    hotPick: 'carrot',
    orders: [],
    plots: [],
    crows: [],
    butterflies: [],
    crowTimer: 14,
    player: {
      x: (PLACES.start.c + 0.5) * TILE,
      y: (PLACES.start.r + 0.5) * TILE + WORLD_Y,
      dir: 'down',
      walk: 0,
      moving: false,
      action: 0,
      actionKind: '',
      target: null,
      stuck: 0,
    },
    combo: { count: 0, timer: 0 },
    stats: { harvested: 0, perfect: 0, orders: 0, crows: 0, eaten: 0, bestDay: 0, dayEarned: 0, planted: 0, golden: 0, bestCombo: 0, dailyGoals: 0, rushFilled: 0, rushMissed: 0 },
    /** Today's coin goal, the open rush order and when today's next rush orders arrive. */
    daily: null,
    rush: null,
    rushPlan: [],
    /** Things that happened this step, for sounds, particles and toasts: { kind, x, y, text }. */
    events: [],
    terrain: [],
  };
  buildTerrain(game);
  return game;
}

function buildTerrain(game) {
  const t = [];
  for (let r = 0; r < ROWS; r += 1) {
    const row = [];
    for (let c = 0; c < COLS; c += 1) {
      const edge = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
      row.push(edge ? T_HEDGE : T_GRASS);
    }
    t.push(row);
  }
  for (let r = 3; r <= 9; r += 1) {
    t[r][4] = T_PATH;
    t[r][15] = T_PATH;
  }
  for (let c = 4; c <= 15; c += 1) t[9][c] = T_PATH;
  for (let c = 2; c <= 4; c += 1) t[3][c] = T_PATH;
  for (let c = 15; c <= 17; c += 1) t[3][c] = T_PATH;
  const block = (p, kind) => {
    for (let r = p.r; r < p.r + (p.h ?? 1); r += 1) for (let c = p.c; c < p.c + (p.w ?? 1); c += 1) t[r][c] = kind;
  };
  block(PLACES.house, T_BUILDING);
  block(PLACES.stall, T_BUILDING);
  block(PLACES.board, T_BUILDING);
  block(PLACES.well, T_BUILDING);
  block(PLACES.compost, T_BUILDING);
  block(PLACES.pond, T_WATER);
  game.terrain = t;
}

/** The plot record of a field tile (made on first use), or null when the tile is not open field. */
export function plotAt(game, c, r) {
  if (!inField(game, c, r)) return null;
  const key = r * COLS + c;
  let plot = game.plots[key];
  if (!plot) {
    plot = { c, r, tilled: false, wet: 0, crop: null, sprinkler: false, sprinkle: 0 };
    game.plots[key] = plot;
  }
  return plot;
}

export function inField(game, c, r) {
  const f = FIELD_LEVELS[game.levels.field];
  return c >= f.c0 && c <= f.c1 && r >= f.r0 && r <= f.r1;
}

/** Whether a tile is inside the field's largest size (for drawing the not-yet-open land). */
export function inFutureField(c, r) {
  const f = FIELD_LEVELS[FIELD_LEVELS.length - 1];
  return c >= f.c0 && c <= f.c1 && r >= f.r0 && r <= f.r1;
}

export function forEachPlot(game, fn) {
  for (const plot of game.plots) if (plot) fn(plot);
}

export function solidAt(game, c, r) {
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
  const kind = game.terrain[r][c];
  if (kind === T_HEDGE || kind === T_BUILDING || kind === T_WATER) return true;
  if (game.levels.scarecrow > 0 && c === PLACES.scarecrow.c && r === PLACES.scarecrow.r) return true;
  return false;
}

export function tileCenter(c, r) {
  return { x: (c + 0.5) * TILE, y: (r + 0.5) * TILE + WORLD_Y };
}

export function tileOf(x, y) {
  return { c: Math.floor(x / TILE), r: Math.floor((y - WORLD_Y) / TILE) };
}

/** The items on the hotbar: each seed kind, then sprinklers once bought. */
export function hotbarItems(game) {
  const items = CROP_ORDER.map((kind) => ({ kind: 'seed', crop: kind }));
  items.push({ kind: 'sprinkler' });
  return items;
}

export function selectedItem(game) {
  const items = hotbarItems(game);
  return items[Math.max(0, Math.min(items.length - 1, game.selected))];
}

export function emit(game, kind, x, y, text) {
  game.events.push({ kind, x, y, text });
}
