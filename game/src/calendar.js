// The farm calendar: the clock through each day, the weather, and the morning after a night's sleep.
import { SEASON, WEATHER } from './config.js';
import { overnight } from './farm.js';
import { helpingHand, rollHotPick } from './market.js';
import { ageOrders, refillOrders } from './orders.js';
import { startChallenges } from './challenges.js';
import { cookOvernight } from './preserves.js';
import { newDayFriends } from './villagers.js';
import { emit } from './state.js';

/** Clock as hours (6.0 .. 22.0) for the HUD. */
export function clockHours(game) {
  return SEASON.startHour + game.clock * (SEASON.endHour - SEASON.startHour);
}

export function clockText(game) {
  const hours = clockHours(game);
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 6) * 10;
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

/** Advance the clock; returns true when the day has just ended. */
export function tickClock(game, dt) {
  game.clock += dt / SEASON.daySeconds;
  if (game.clock >= 1) {
    game.clock = 1;
    return true;
  }
  if (game.clock > 0.86 && !game.lateWarned) {
    game.lateWarned = true;
    emit(game, 'late', 0, 0, 'It is getting late. Sell your crops!');
  }
  return false;
}

export function rollWeather(game) {
  const roll = game.rng.next();
  if (roll < WEATHER.rainChance) return 'rain';
  if (roll < WEATHER.rainChance + WEATHER.breezeChance) return 'breeze';
  return 'sunny';
}

export function startSeason(game) {
  game.weather = 'sunny';
  game.tomorrow = rollWeather(game);
  game.hotPick = 'turnip';
  refillOrders(game);
  startChallenges(game);
}

/** Night falls: the day's summary is kept and the next morning is set up. */
export function endDay(game) {
  const summary = {
    day: game.day,
    earned: game.stats.dayEarned,
    weather: game.tomorrow,
    last: game.day >= SEASON.days,
    dailyGoal: game.daily ? game.daily.goal : 0,
    dailyDone: !!(game.daily && game.daily.done),
  };
  game.rush = null;
  game.stats.bestDay = Math.max(game.stats.bestDay, game.stats.dayEarned);
  return summary;
}

export function startNextDay(game) {
  game.day += 1;
  game.clock = 0;
  game.lateWarned = false;
  game.stats.dayEarned = 0;
  game.weather = game.tomorrow;
  game.tomorrow = rollWeather(game);
  game.crows = [];
  overnight(game);
  cookOvernight(game);
  newDayFriends(game);
  rollHotPick(game);
  helpingHand(game);
  ageOrders(game);
  startChallenges(game);
  const p = game.player;
  // wake up on the path by the cottage door (the workshop stands just below it)
  p.x = 3.5 * 48;
  p.y = 3 * 48 + 20;
  p.dir = 'down';
  p.target = null;
}
