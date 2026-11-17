// Chill Farm balance and layout: every number the rules use lives here, so tuning is one file.

/** The logical canvas: everything is drawn at this size and scaled to the window. */
export const VIEW = { width: 960, height: 540 };
export const TILE = 48;
export const COLS = 20;
export const ROWS = 11;
/** The world is drawn this far down so row 0 (hedges) sits under the HUD bar. */
export const WORLD_Y = 6;

/** One simulation step: the game runs at a fixed 60 steps a second. */
export const STEP = 1 / 60;

export const SEASON = {
  days: 10,
  /** Real seconds in one farm day (06:00 to 22:00). */
  daySeconds: 90,
  startHour: 6,
  endHour: 22,
  /** Coins earned (sales + orders) needed for the Harvest Festival blue ribbon. */
  goal: 4000,
  /** Earned coins for the gold ribbon. */
  goldGoal: 10000,
  startCoins: 40,
};

export const PLAYER = {
  speed: 150,
  bootsSpeed: 205,
  /** How far (pixels from the farmer's centre to a tile's centre) an action can reach. */
  reach: 80,
  actionTime: 0.16,
};

/**
 * The crops. growth: seconds of watered growing to ripen; regrow: seconds to fruit again after a
 * harvest (strawberries keep giving); unlockDay: the day the seed seller starts stocking it.
 */
export const CROPS = {
  turnip: { name: 'Turnip', seed: 10, price: 24, growth: 18, regrow: 0, unlockDay: 1, color: '#e9d7f2' },
  carrot: { name: 'Carrot', seed: 20, price: 44, growth: 28, regrow: 0, unlockDay: 1, color: '#f28c28' },
  berry: { name: 'Sunberry', seed: 50, price: 22, growth: 30, regrow: 12, unlockDay: 2, color: '#ff4f6d' },
  pumpkin: { name: 'Pumpkin', seed: 60, price: 130, growth: 62, regrow: 0, unlockDay: 3, color: '#f6a23a' },
  moonmelon: { name: 'Moonmelon', seed: 120, price: 250, growth: 96, regrow: 0, unlockDay: 5, color: '#9fd8ff' },
};
export const CROP_ORDER = ['turnip', 'carrot', 'berry', 'pumpkin', 'moonmelon'];

/** Seconds of moisture one splash of the watering can gives a plot. */
export const WATER_SECONDS = 34;
/** A crop that spent less than this many seconds dry while growing is Perfect (worth more). */
export const PERFECT_DRY_LIMIT = 4;
export const PERFECT_BONUS = 1.25;
/** The day's Hot Pick sells for this much more at the stall. */
export const HOT_PICK_BONUS = 1.5;

/** Harvests less than `window` seconds apart build a combo; from x3 each pays a small tip. */
export const COMBO = { window: 2.2, coinsPerStep: 2 };
/** The chance a harvest comes up golden, and the extra coins (times the crop's price) it pays. */
export const GOLDEN = { chance: 0.05, bonus: 2 };

export const SPRINKLER ={ price: 160, max: 6, interval: 12 };

/** Upgrades: each level's price, bought in order at the stall. */
export const UPGRADES = {
  field: { name: 'Bigger Field', prices: [250, 650, 1400], about: 'More plots to plant' },
  can: { name: 'Watering Can', prices: [180, 520], about: 'Holds more water' },
  compost: { name: 'Compost Heap', prices: [380, 950], about: 'Crops grow 25% faster' },
  scarecrow: { name: 'Scarecrow', prices: [220, 600], about: 'Fewer crows, and they flee faster' },
  boots: { name: 'Comfy Boots', prices: [260], about: 'Walk faster' },
};
export const CAN_CAPACITY = [10, 22, 40];
export const COMPOST_SPEED = [1, 1.25, 1.5];

/** Field plots per level: column and row ranges, inclusive. */
export const FIELD_LEVELS = [
  { c0: 8, c1: 11, r0: 5, r1: 7 },
  { c0: 7, c1: 12, r0: 4, r1: 7 },
  { c0: 6, c1: 13, r0: 4, r1: 8 },
  { c0: 5, c1: 14, r0: 3, r1: 8 },
];

/** Fixed places on the farm, in tile coordinates. */
export const PLACES = {
  house: { c: 1, r: 1, w: 3, h: 2 },
  door: { c: 2, r: 3 },
  well: { c: 2, r: 6 },
  pond: { c: 1, r: 8, w: 2, h: 2 },
  stall: { c: 16, r: 1, w: 3, h: 2 },
  board: { c: 15, r: 1 },
  scarecrow: { c: 4, r: 6 },
  compost: { c: 17, r: 8 },
  start: { c: 6, r: 3 },
};

export const CROWS = {
  /** Mean seconds between crow visits, by scarecrow level. */
  interval: [16, 30, 52],
  /** Seconds a crow pecks before it eats the crop, by scarecrow level. */
  peck: [7, 5, 3.5],
  /** Coins for shooing one. */
  shooReward: 4,
};

export const ORDERS = {
  slots: 3,
  /** An order pays this many times the stall price, plus a tip. */
  markup: 1.4,
  tip: 15,
  days: 3,
};

export const WEATHER = {
  /** Chance of each weather on a new day (after day 1, which is always sunny). */
  rainChance: 0.24,
  breezeChance: 0.26,
};
