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
 * harvest (strawberries keep giving); unlockDay: the day the seed seller starts stocking it; landmark: a restoration it also needs.
 */
export const CROPS = {
  turnip: { name: 'Turnip', seed: 10, price: 24, growth: 18, regrow: 0, unlockDay: 1, color: '#e9d7f2' },
  carrot: { name: 'Carrot', seed: 20, price: 44, growth: 28, regrow: 0, unlockDay: 1, color: '#f28c28' },
  berry: { name: 'Sunberry', seed: 50, price: 22, growth: 30, regrow: 12, unlockDay: 2, color: '#ff4f6d' },
  pumpkin: { name: 'Pumpkin', seed: 60, price: 130, growth: 62, regrow: 0, unlockDay: 3, color: '#f6a23a' },
  moonmelon: { name: 'Moonmelon', seed: 120, price: 250, growth: 96, regrow: 0, unlockDay: 3, landmark: 'bridge', color: '#9fd8ff' },
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
  /** The preserves workshop, the creek bridge, and the bakery across the creek. */
  workshop: { c: 1, r: 4, w: 3, h: 2 },
  bridge: { c: 16, r: 6 },
  bakery: { c: 17, r: 4, w: 2, h: 2 },
};

export const CROWS = {
  /** Mean seconds between crow visits, by scarecrow level. */
  interval: [16, 30, 52],
  /** Seconds a crow pecks before it eats the crop, by scarecrow level. */
  peck: [7, 5, 3.5],
  /** Coins for shooing one. */
  shooReward: 4,
  /** From this day crows may arrive in flocks, and flocks grow later in the season. */
  flockFromDay: 4,
  flockChance: 0.3,
};

/**
 * Daily goals: each morning sets a target for the coins earned that day, rising through the
 * season (goal = base + perDay * day + perDaySq * day^2). Meeting it pays a share of the goal.
 */
export const DAILY = { base: 40, perDay: 50, perDaySq: 14, bonusShare: 0.12 };

/**
 * Rush orders: a neighbour needs crops right now. They start on day 2, come more often later, and
 * pay half as much again, but only for a short time (game seconds: base + perItem for each crop asked).
 */
export const RUSH = {
  perDay: [0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  markup: 1.5,
  tip: 10,
  seconds: 30,
  perItem: 7,
  maxQty: 4,
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

/**
 * The preserves workshop: a kettle cooks a batch of one crop into jars that sell for `value` times
 * the crop's price. Kettles keep cooking overnight. Each crop makes its own kind of jar.
 */
export const PRESERVES = {
  kettles: 2,
  maxKettles: 3,
  batch: 5,
  /** Game seconds a batch cooks, plus a little more for each crop in it. */
  seconds: 26,
  perItem: 4,
  value: 1.6,
  goods: { turnip: 'Turnip Pickles', carrot: 'Carrot Juice', berry: 'Sunberry Jam', pumpkin: 'Pumpkin Butter', moonmelon: 'Moonmelon Jam' },
  colors: { turnip: '#c99ae0', carrot: '#ff9a3c', berry: '#e8395a', pumpkin: '#f0a040', moonmelon: '#7cc8f0' },
};

/**
 * Village landmarks to restore by donating produce. Each need is a crop, or a jar of it (jar: true).
 * Restoring one changes the map and unlocks something new.
 */
export const LANDMARKS = {
  pond: {
    name: 'Lily Pond',
    job: 'Clean the pond',
    needs: [{ kind: 'turnip', qty: 6 }, { kind: 'carrot', qty: 3 }],
    unlock: 'Ducks come home and chase crows: half as many crows',
  },
  bridge: {
    name: 'Creek Bridge',
    job: 'Fix the bridge',
    needs: [{ kind: 'carrot', qty: 5 }, { kind: 'berry', qty: 6 }],
    unlock: 'The seed merchant crosses: Moonmelon seeds on sale',
  },
  bakery: {
    name: 'Village Bakery',
    job: 'Reopen the bakery',
    needs: [{ kind: 'pumpkin', qty: 3 }, { kind: 'berry', qty: 4, jar: true }],
    unlock: 'The baker buys preserves: every jar sells for 25% more',
  },
};
export const LANDMARK_ORDER = ['pond', 'bridge', 'bakery'];
/** What restoring pays out: the crow slow-down from the pond and the jar bonus from the bakery. */
export const RESTORE = { pondCrows: 2, bakeryJars: 1.25 };

/** Villagers who post orders, take gifts and grow fond of the farmer (hearts 0..max). */
export const VILLAGERS = {
  fern: { name: 'Granny Fern', likes: ['turnip', 'pumpkin'], hair: '#e8e4f0', shirt: '#9b7fd1', skin: '#f2c9a0', spot: { c: 3, r: 8 } },
  bo: { name: 'Baker Bo', likes: ['berry', 'carrot'], hair: '#7a4a2a', shirt: '#f2f2f2', skin: '#d9a273', spot: { c: 13, r: 2 }, hat: true },
  pip: { name: 'Little Pip', likes: ['carrot', 'moonmelon'], hair: '#f0b040', shirt: '#5fb2e8', skin: '#f6d2b0', spot: { c: 15, r: 8 }, small: true },
};
export const VILLAGER_ORDER = ['fern', 'bo', 'pip'];
export const FRIENDS = {
  maxHearts: 5,
  /** Hearts for a liked crop, a liked jar, and every second filled order from that villager. */
  crop: 1,
  jar: 2,
  order: 1,
  /** A villager's orders pay this much more for each heart. */
  orderBonus: 0.06,
  /** A best friend (max hearts) sends a thank-you hamper worth this many coins. */
  hamper: 120,
};

/** Farmer skill: experience from farm work, and the total needed for each level-up (pick a perk). */
export const SKILLS = {
  xp: { harvest: 1, batch: 3, donate: 2, gift: 3, order: 4, restore: 12 },
  levels: [20, 55, 105, 170, 250, 350, 470],
};

/** The perks offered two at a time on a level-up. */
export const PERKS = {
  green: { name: 'Green Thumb', about: 'Crops grow 15% faster', icon: 'sprout' },
  haggle: { name: 'Haggler', about: 'Crops sell for 10% more', icon: 'coin' },
  jam: { name: 'Jam Master', about: 'Jars sell for 20% more', icon: 'jar' },
  quick: { name: 'Quick Kettle', about: 'Preserves cook 40% faster', icon: 'clock' },
  kettle: { name: 'Extra Kettle', about: 'One more kettle in the workshop', icon: 'kettle' },
  golden: { name: 'Golden Touch', about: 'Golden crops twice as often', icon: 'star' },
  crows: { name: 'Crow Charm', about: 'Crows peck 40% slower', icon: 'crow' },
  sweet: { name: 'Sweet Talker', about: 'Gifts give one extra heart', icon: 'heart' },
};
