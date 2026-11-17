// Chill Farm's entry point: sets up the canvas, runs the fixed-step loop and moves between the
// title, the farm, the end-of-day card and the Harvest Festival results.
import { initAudio, isMuted, play, toggleMute, updateMusic } from './audio.js';
import { endDay, startNextDay, startSeason, tickClock } from './calendar.js';
import { PLACES, SEASON, STEP, VIEW } from './config.js';
import { crowAt, shoo, updateButterflies, updateCrows } from './critters.js';
import { actOnTile, describeTile, updateField } from './farm.js';
import { applyEvents } from './feedback.js';
import { drawActionHint, drawHud, drawToasts, hotbarSlots, panel, text } from './hud.js';
import { createInput, drain, moveAxis } from './input.js';
import { clickPanel, drawPanel, keyPanel, openPanel } from './panels.js';
import { createEffects, drawEffects, toast, updateEffects } from './particles.js';
import { facingTile, inReach, movePlayer, startAction } from './player.js';
import { drawScene, drawWeather, nightAmount } from './scene.js';
import { drawDaySummary, drawResults, drawTitle } from './screens.js';
import { createGame, hotbarItems, plotAt, tileOf } from './state.js';
import { tutorialTip } from './tutorial.js';
import { seedAvailable } from './market.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const view = { scale: 1, offsetX: 0, offsetY: 0 };
const input = createInput(canvas, view);
const params = new URLSearchParams(location.search);
/** ?speed=N runs the clock N times faster (for testing); ?seed=N picks the season's luck. */
const speed = Math.max(0.25, Math.min(20, Number(params.get('speed')) || 1));
const seedParam = Number(params.get('seed'));

const app = {
  screen: 'title',
  game: showcaseFarm(),
  fx: createEffects(),
  ui: null,
  summary: null,
  button: null,
  best: loadBest(),
  isBest: false,
  t: 0,
  seasons: 0,
};

function loadBest() {
  try {
    return Number(localStorage.getItem('chill-farm-best')) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    localStorage.setItem('chill-farm-best', String(score));
  } catch {
    // private windows may refuse storage; the best score then lasts this visit only
  }
}

/** A lived-in farm for the title screen: a few days of crops at every stage. */
function showcaseFarm() {
  const game = createGame(2026);
  startSeason(game);
  game.levels.field = 2;
  game.levels.scarecrow = 1;
  game.levels.compost = 1;
  const kinds = ['turnip', 'carrot', 'berry', 'pumpkin', 'moonmelon'];
  for (let r = 4; r <= 8; r += 1) {
    for (let c = 6; c <= 13; c += 1) {
      const plot = plotAt(game, c, r);
      if (!plot) continue;
      plot.tilled = true;
      if ((c === 8 && r === 6) || (c === 11 && r === 6)) {
        plot.sprinkler = true;
        plot.sprinkle = 6 + c;
        continue;
      }
      if ((c + r * 3) % 7 === 0) continue;
      const kind = kinds[(Math.floor(c / 2) + r) % kinds.length];
      const growth = ((c * 13 + r * 7) % 10) / 9;
      plot.crop = { kind, growth: Math.min(0.95, growth), water: (c + r) % 3 ? 20 : 0, dry: 0, ripe: growth >= 0.9, harvests: 0, wiggle: 0 };
    }
  }
  game.player.x = 4 * 48 + 24;
  game.player.y = 9 * 48 + 8;
  game.player.dir = 'right';
  game.clock = 0.3;
  return game;
}

function newSeason() {
  const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam + app.seasons : (Date.now() % 100000) + 1;
  app.seasons += 1;
  app.game = createGame(seed);
  startSeason(app.game);
  app.fx = createEffects();
  app.ui = null;
  app.screen = 'play';
  toast(app.fx, 'Day 1: the festival is in 10 days. Happy farming!', 'gold');
  play('morning');
}

// ---------------------------------------------------------------- input on the farm

function selectSlot(index) {
  const count = hotbarItems(app.game).length;
  app.game.selected = (index + count) % count;
  play('click');
}

/** Act on a tile now (a smart action), opening a panel when it is the stall, board or house. */
function actAt(c, r) {
  const game = app.game;
  const result = actOnTile(game, c, r);
  if (result === 'none') return;
  if (result === 'stall') {
    app.ui = openPanel('shop');
    if (game.basket && Object.values(game.basket).some((n) => n > 0)) app.ui.tab = 0;
    else app.ui.tab = 1;
    play('click');
    return;
  }
  if (result === 'board') {
    app.ui = openPanel('board');
    play('click');
    return;
  }
  if (result === 'house') {
    if (game.clock < 0.55) {
      toast(app.fx, 'Too early for bed! Come back after 3pm', 'info');
      play('note');
      return;
    }
    finishDay();
    return;
  }
  startAction(game, result);
}

function handleFarmInput(presses, clicks, wheel) {
  const game = app.game;
  for (const key of presses) {
    if (key === 'Escape' || key === 'p' || key === 'P') {
      app.ui = openPanel('pause');
      play('click');
      return;
    }
    if (key === 'h' || key === 'H') {
      app.ui = openPanel('help');
      return;
    }
    if (key === 'm' || key === 'M') toggleMute();
    if (key >= '1' && key <= '6') selectSlot(Number(key) - 1);
    if (key === 'q' || key === 'Q') selectSlot(game.selected - 1);
    if (key === 'r' || key === 'R') selectSlot(game.selected + 1);
    if (key === ' ' || key === 'e' || key === 'E' || key === 'Enter') {
      if (game.player.action > 0) continue;
      let tile = facingTile(game);
      // facing nothing useful (a hedge, the path): use the tile under the farmer's feet instead
      if (!describeTile(game, tile.c, tile.r)) tile = tileOf(game.player.x, game.player.y + 14);
      actAt(tile.c, tile.r);
    }
  }
  if (wheel) selectSlot(game.selected + wheel);
  for (const click of clicks) {
    const slot = hotbarSlots(game).find((s) => click.x >= s.x && click.x <= s.x + s.w && click.y >= s.y && click.y <= s.y + s.h);
    if (slot) {
      selectSlot(slot.index);
      continue;
    }
    const crow = crowAt(game, click.x, click.y);
    if (crow) {
      shoo(game, crow);
      continue;
    }
    const tile = tileOf(click.x, click.y);
    if (!describeTile(game, tile.c, tile.r)) continue;
    if (inReach(game, tile.c, tile.r)) {
      game.player.target = null;
      actAt(tile.c, tile.r);
    } else {
      game.player.target = { c: tile.c, r: tile.r };
    }
  }
}

/** Holding the mouse button and sweeping over plots in reach acts on each one once. */
let sweptTile = '';
function sweepWithMouse(game) {
  if (!input.mouse.down || app.ui || game.player.action > 0) {
    if (!input.mouse.down) sweptTile = '';
    return;
  }
  const tile = tileOf(input.mouse.x, input.mouse.y);
  const key = `${tile.c},${tile.r}`;
  if (!sweptTile) sweptTile = key; // the press itself was handled as a click
  if (key === sweptTile) return;
  sweptTile = key;
  if (plotAt(game, tile.c, tile.r) && inReach(game, tile.c, tile.r)) actAt(tile.c, tile.r);
}

function handlePanelInput(presses, clicks) {
  for (const key of presses) {
    if ((key === 'h' || key === 'H') && app.ui.kind === 'help') return closePanel();
    if ((key === 'p' || key === 'P') && app.ui.kind === 'pause') return closePanel();
    react(keyPanel(app.game, app.ui, key));
    if (!app.ui) return;
  }
  for (const click of clicks) {
    react(clickPanel(app.game, app.ui, click.x, click.y));
    if (!app.ui) return;
  }
}

function react(result) {
  if (!result) return;
  if (result === 'close') return closePanel();
  if (result === 'help') {
    app.ui = openPanel('help');
    return;
  }
  if (result === 'mute') {
    toggleMute();
    toast(app.fx, isMuted() ? 'Sound off' : 'Sound on', 'info');
    return;
  }
  if (result === 'quit') {
    app.ui = null;
    app.screen = 'title';
    app.game = showcaseFarm();
    return;
  }
  if (result === 'move' || result === 'tab') play('click');
  if (result === 'disabled') play('error');
}

function closePanel() {
  app.ui = null;
  play('click');
}

function finishDay() {
  app.summary = endDay(app.game);
  app.game.player.target = null;
  app.screen = 'day';
  play('night');
}

function continueFromDay() {
  if (app.summary.last) {
    const score = app.game.earned;
    app.isBest = score > app.best;
    if (app.isBest) {
      app.best = score;
      saveBest(score);
    }
    app.screen = 'results';
    play('fanfare');
    return;
  }
  startNextDay(app.game);
  app.screen = 'play';
  play('morning');
  const g = app.game;
  if (g.weather === 'rain') toast(app.fx, 'Rainy day: every crop is watered for free!', 'good');
  const fresh = ['berry', 'pumpkin', 'moonmelon'].find((kind) => seedAvailable(g, kind) && !seedAvailable({ day: g.day - 1 }, kind));
  if (fresh) toast(app.fx, `New seeds at the market today!`, 'gold');
}

function hitButton(click) {
  const b = app.button;
  return b && click.x >= b.x && click.x <= b.x + b.w && click.y >= b.y && click.y <= b.y + b.h;
}

// ---------------------------------------------------------------- the loop

function update(dt) {
  const { presses, clicks, wheel } = drain(input);
  if (presses.length || clicks.length) initAudio();
  if (presses.includes('m') || presses.includes('M')) {
    if (app.screen !== 'play') toggleMute();
  }
  const game = app.game;
  if (app.screen === 'title') {
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
    return;
  }
  if (app.screen === 'day') {
    if (presses.some((k) => k === 'Enter' || k === ' ' || k === 'Escape') || clicks.some(hitButton)) continueFromDay();
    return;
  }
  if (app.screen === 'results') {
    if (presses.includes('Escape')) {
      app.screen = 'title';
      app.game = showcaseFarm();
    } else if (presses.includes('Enter') || presses.includes(' ') || presses.includes('r') || presses.includes('R') || clicks.some(hitButton)) {
      newSeason();
    }
    return;
  }
  // play
  if (app.ui) {
    handlePanelInput(presses, clicks);
    applyEvents(game, app.fx);
    updateEffects(app.fx, dt, game.weather === 'rain');
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
  updateCrows(game, sim);
  updateButterflies(game, dt);
  applyEvents(game, app.fx);
  updateEffects(app.fx, dt, game.weather === 'rain');
  if (app.screen === 'play' && tickClock(game, sim)) finishDay();
}

function render() {
  const game = app.game;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2b3a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.scale, 0, 0, view.scale, view.offsetX, view.offsetY);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, VIEW.width, VIEW.height);
  ctx.clip();
  let hover = null;
  if (app.screen === 'play' && !app.ui && input.mouse.inside) {
    const tile = tileOf(input.mouse.x, input.mouse.y);
    if (describeTile(game, tile.c, tile.r)) hover = { ...tile, near: inReach(game, tile.c, tile.r) };
  }
  drawScene(ctx, game, app.t, hover);
  drawEffects(ctx, app.fx);
  drawWeather(ctx, app.fx, game, app.t);
  app.button = null;
  if (app.screen === 'title') {
    app.button = drawTitle(ctx, app.t, app.best);
  } else {
    if (app.screen !== 'results') drawHud(ctx, game, app.t);
    if (app.screen === 'play') drawPlayOverlays(game, hover);
    drawToasts(ctx, app.fx);
    if (app.screen === 'day') app.button = drawDaySummary(ctx, app.summary, game, app.t);
    if (app.screen === 'results') app.button = drawResults(ctx, game, app.best, app.isBest, app.t);
  }
  if (app.ui) drawPanel(ctx, game, app.ui, app.t);
  ctx.restore();
}

function drawPlayOverlays(game, hover) {
  const tip = tutorialTip(game);
  if (tip && !app.fx.toasts.length) {
    ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
    const w = ctx.measureText(tip).width + 40;
    panel(ctx, VIEW.width / 2 - w / 2, 100, w, 32, 'rgba(255, 233, 160, 0.97)', 16);
    text(ctx, `Tip: ${tip}`, VIEW.width / 2, 116.5, { size: 15, align: 'center', color: '#6a3a10' });
  }
  if (hover) {
    const hint = describeTile(game, hover.c, hover.r);
    drawActionHint(ctx, hover.near ? `Click: ${hint}` : `Walk to: ${hint}`, input.mouse.x, input.mouse.y + 22);
  } else if (!game.player.moving) {
    const tile = facingTile(game);
    const hint = describeTile(game, tile.c, tile.r);
    if (hint) drawActionHint(ctx, `Space: ${hint}`, game.player.x, game.player.y - 58);
  }
  if (game.clock > 0.86) {
    const door = PLACES.door;
    text(ctx, 'Zz', door.c * 48 + 30, door.r * 48 - 6 + Math.sin(app.t * 3) * 3, { size: 16, color: '#fff6e0' });
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  view.scale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
  view.offsetX = (canvas.width - VIEW.width * view.scale) / 2;
  view.offsetY = (canvas.height - VIEW.height * view.scale) / 2;
}

let last = performance.now();
let acc = 0;
function frame(now) {
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;
  acc += elapsed;
  // the next frame is booked first, so one bad frame can never freeze the game
  requestAnimationFrame(frame);
  while (acc >= STEP) {
    app.t += STEP;
    update(STEP);
    acc -= STEP;
  }
  updateMusic(elapsed, app.screen !== 'title' || input.firstGesture, nightAmount(app.game) > 0.3 || app.screen === 'day');
  render();
  announce();
}

let lastAnnounce = '';
function announce() {
  const g = app.game;
  const line = app.screen === 'play' ? `Day ${g.day} of ${SEASON.days}, ${g.coins} coins, ${g.earned} of ${SEASON.goal} earned` : app.screen;
  if (line !== lastAnnounce && Math.floor(app.t * 2) % 4 === 0) {
    status.textContent = line;
    lastAnnounce = line;
  }
}

window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && app.screen === 'play' && !app.ui) app.ui = openPanel('pause');
});
resize();
requestAnimationFrame(frame);

/** For automated play-testing: read the state, and step the clock without waiting. */
window.chillFarm = { app, newSeason, update, step: (seconds) => { for (let i = 0; i < seconds / STEP; i += 1) update(STEP); } };
