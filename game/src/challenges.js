// The season's growing challenge: a daily coin goal that rises each morning, timed rush orders from
// the neighbours that come more often as the festival nears, and crows that grow bolder.
import { CROPS, CROWS, DAILY, RUSH } from './config.js';
import { earn, takeFromBasket } from './market.js';
import { emit, forEachPlot } from './state.js';

const RUSH_NEIGHBOURS = ['Granny Fern', 'Baker Bo', 'Little Pip', 'Chef Marlo', 'Auntie Juniper', 'Mayor Wren'];

/** The day's coin goal, rounded to tens. */
export function dailyGoal(day) {
  return Math.round((DAILY.base + DAILY.perDay * day + DAILY.perDaySq * day * day) / 10) * 10;
}

/** A new morning: set the day's goal and plan when today's rush orders will be posted. */
export function startChallenges(game) {
  const goal = dailyGoal(game.day);
  game.daily = { goal, bonus: Math.round((goal * DAILY.bonusShare) / 5) * 5, done: false };
  game.rush = null;
  const count = RUSH.perDay[Math.min(RUSH.perDay.length - 1, game.day - 1)];
  // spread the day's rush orders between 9am and 6pm (as fractions of the day)
  game.rushPlan = [];
  for (let i = 0; i < count; i += 1) game.rushPlan.push(0.18 + ((i + game.rng.range(0.1, 0.8)) / count) * 0.55);
}

/** Every step: check the daily goal, post planned rush orders and count down the open one. */
export function updateChallenges(game, dt) {
  if (game.daily && !game.daily.done && game.stats.dayEarned >= game.daily.goal) {
    game.daily.done = true;
    game.stats.dailyGoals += 1;
    earn(game, game.daily.bonus);
    emit(game, 'daily', 480, 200, `Day goal met! Bonus +${game.daily.bonus}`);
  }
  if (game.rush) {
    game.rush.timer -= dt;
    if (game.rush.timer <= 0) {
      emit(game, 'rush-missed', 0, 0, `${game.rush.from}'s rush order ran out of time`);
      game.stats.rushMissed += 1;
      game.rush = null;
    }
  } else if (game.rushPlan && game.rushPlan.length && game.clock >= game.rushPlan[0]) {
    const rush = makeRush(game);
    if (rush) {
      game.rushPlan.shift();
      game.rush = rush;
      emit(game, 'rush', 0, 0, `Rush order! ${rush.from} needs ${rush.qty} ${CROPS[rush.kind].name} fast`);
    } else {
      // nothing growing to ask for yet: try again a little later
      game.rushPlan[0] += 0.04;
    }
  }
}

/** A rush order for a crop the farmer is growing or carrying, so it can always be met in time. */
function makeRush(game) {
  const have = {};
  forEachPlot(game, (plot) => {
    if (plot.crop && plot.crop.growth > 0.4) have[plot.crop.kind] = (have[plot.crop.kind] ?? 0) + 1;
  });
  for (const kind of Object.keys(game.basket)) if (game.basket[kind]) have[kind] = (have[kind] ?? 0) + game.basket[kind];
  const kinds = Object.keys(have);
  if (!kinds.length) return null;
  const kind = game.rng.pick(kinds);
  const qty = Math.max(1, Math.min(RUSH.maxQty, Math.floor(have[kind] * 0.6), 1 + Math.floor(game.day / 3)));
  const seconds = RUSH.seconds + RUSH.perItem * qty;
  return {
    kind,
    qty,
    reward: Math.round(qty * CROPS[kind].price * RUSH.markup + RUSH.tip),
    timer: seconds,
    total: seconds,
    from: game.rng.pick(RUSH_NEIGHBOURS),
  };
}

export function canFillRush(game) {
  return !!game.rush && game.basket[game.rush.kind] >= game.rush.qty;
}

export function fillRush(game) {
  const rush = game.rush;
  if (!rush) return false;
  if (!canFillRush(game)) {
    emit(game, 'error', 0, 0, `Need ${rush.qty} ${CROPS[rush.kind].name} for the rush order`);
    return false;
  }
  takeFromBasket(game, rush.kind, rush.qty);
  earn(game, rush.reward);
  game.stats.orders += 1;
  game.stats.rushFilled += 1;
  game.rush = null;
  emit(game, 'order', 0, 0, `Rush delivered! ${rush.from} paid ${rush.reward} coins`);
  return true;
}

/** How bold the crows are today: 1 (calm), 2 (busy) or 3 (bold), shown on the HUD. */
export function crowThreat(game) {
  if (game.day >= 7) return 3;
  if (game.day >= CROWS.flockFromDay) return 2;
  return 1;
}

/** How many crows arrive together: from mid-season they may come as a flock. */
export function flockSize(game) {
  if (game.day < CROWS.flockFromDay) return 1;
  let size = 1;
  const extra = crowThreat(game) - 1;
  for (let i = 0; i < extra; i += 1) if (game.rng.chance(CROWS.flockChance + game.day * 0.02)) size += 1;
  return size;
}
