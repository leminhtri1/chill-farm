// Chill Farm's entry point: fits the canvas to the window and runs the fixed-step loop.
import { app, canvas, input, view } from './app.js';
import { updateMusic } from './audio.js';
import { SEASON, STEP, VIEW } from './config.js';
import { update } from './game-update.js';
import { openPanel } from './panels.js';
import { render } from './render.js';
import { nightAmount } from './scene.js';
import { newSeason } from './season-flow.js';

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

/** A short status line for screen readers, refreshed every couple of seconds. */
const status = document.getElementById('status');
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
