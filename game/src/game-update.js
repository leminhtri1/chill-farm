// One fixed simulation step for whichever screen is showing: the title, a day on the farm, the
// end-of-day card or the festival results.
import { app, input, speed } from './app.js';
import { initAudio, toggleMute } from './audio.js';
import { tickClock } from './calendar.js';
import { updateChallenges } from './challenges.js';
import { updateButterflies, updateCrows } from './critters.js';
import { updateField } from './farm.js';
import { handleFarmInput, actAt, sweepWithMouse } from './farm-controls.js';
import { applyEvents } from './feedback.js';
import { drain, moveAxis } from './input.js';
import { openPanel } from './panels.js';
import { handlePanelInput } from './panel-controls.js';
import { updateEffects } from './particles.js';
import { movePlayer } from './player.js';
import { updateKettles } from './preserves.js';
import { continueFromDay, finishDay, goToTitle, newSeason } from './season-flow.js';

function hitButton(click) {
  const b = app.button;
  return b && click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h;
}

export function update(dt) {
  const { presses, clicks, wheel } = drain(input);
  if (presses.length || clicks.length) initAudio();
  if ((presses.includes('m') || presses.includes('M')) && app.screen !== 'play') toggleMute();
  if (app.screen === 'title') return updateTitle(dt, presses, clicks);
  if (app.screen === 'day') {
    if (presses.some((k) => k === 'Enter' || k === ' ' || k === 'Escape') || clicks.some(hitButton)) continueFromDay();
    return;
  }
  if (app.screen === 'results') {
    if (presses.includes('Escape')) goToTitle();
    else if (presses.some((k) => k === 'Enter' || k === ' ' || k === 'r' || k === 'R') || clicks.some(hitButton)) newSeason();
    return;
  }
  updateFarm(dt, presses, clicks, wheel);
}

function updateTitle(dt, presses, clicks) {
  const game = app.game;
  if (app.ui) {
    handlePanelInput(presses, clicks);
  } else if (presses.includes('h') || presses.includes('H')) {
    app.ui = openPanel('help');
  } else if (presses.includes('Enter') || presses.includes(' ') || clicks.some(hitButton)) {
    newSeason();
    return;
  }
  game.time += dt;
  updateField(game, 0);
  updateButterflies(game, dt);
  game.events.length = 0;
}

function updateFarm(dt, presses, clicks, wheel) {
  const game = app.game;
  if (app.ui) {
    handlePanelInput(presses, clicks);
    applyEvents(game, app.fx);
    updateEffects(app.fx, dt, game.weather === 'rain');
    return;
  }
  // a level-up waits for the farmer to pick a perk
  if (game.perkOffer) {
    app.ui = openPanel('perk');
    applyEvents(game, app.fx);
    return;
  }
  handleFarmInput(presses, clicks, wheel);
  sweepWithMouse(game);
  if (app.screen !== 'play' || app.ui) {
    applyEvents(game, app.fx);
    return;
  }
  const sim = dt * speed;
  game.time += sim;
  const arrived = movePlayer(game, moveAxis(input), dt);
  if (arrived === 'arrived' && game.player.target) {
    const target = game.player.target;
    game.player.target = null;
    actAt(target.c, target.r);
  }
  updateField(game, sim);
  updateChallenges(game, sim);
  updateKettles(game, sim);
  updateCrows(game, sim);
  updateButterflies(game, dt);
  applyEvents(game, app.fx);
  updateEffects(app.fx, dt, game.weather === 'rain');
  if (app.screen === 'play' && tickClock(game, sim)) finishDay();
}
