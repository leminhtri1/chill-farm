// Moving through a season: a new season, the end of each day, the next morning, the festival
// results and back to the title.
import { app, seedParam } from './app.js';
import { play } from './audio.js';
import { saveBest } from './best-score.js';
import { endDay, startNextDay, startSeason } from './calendar.js';
import { seedAvailable } from './market.js';
import { createEffects, toast } from './particles.js';
import { createGame } from './state.js';
import { titleFarm } from './title-farm.js';

export function newSeason() {
  const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam + app.seasons : (Date.now() % 100000) + 1;
  app.seasons += 1;
  app.game = createGame(seed);
  startSeason(app.game);
  app.fx = createEffects();
  app.ui = null;
  app.screen = 'play';
  toast(app.fx, `Day 1: the festival is in 10 days. Today's goal: ${app.game.daily.goal} coins`, 'gold');
  play('morning');
}

export function goToTitle() {
  app.ui = null;
  app.screen = 'title';
  app.game = titleFarm();
}

export function finishDay() {
  app.summary = endDay(app.game);
  app.game.player.target = null;
  app.screen = 'day';
  play('night');
}

export function continueFromDay() {
  if (app.summary.last) {
    const score = app.game.earned;
    app.isBest = score > app.best;
    if (app.isBest) {
      app.best = score;
      saveBest(score);
    }
    app.screen = 'results';
    app.fx = createEffects();
    play('fanfare');
    return;
  }
  startNextDay(app.game);
  app.screen = 'play';
  play('morning');
  const g = app.game;
  toast(app.fx, `Day ${g.day} goal: earn ${g.daily.goal} coins today`, 'info');
  if (g.weather === 'rain') toast(app.fx, 'Rainy day: every crop is watered for free!', 'good');
  const fresh = ['berry', 'pumpkin', 'moonmelon'].find((kind) => seedAvailable(g, kind) && !seedAvailable({ day: g.day - 1 }, kind));
  if (fresh) toast(app.fx, 'New seeds at the market today!', 'gold');
}
