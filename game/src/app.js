// The app's shared state: the canvas and its scaling, the input queues, which screen is showing,
// the season being played, effects, the open panel and the best score.
import { loadBest } from './best-score.js';
import { createInput } from './input.js';
import { createEffects } from './particles.js';
import { titleFarm } from './title-farm.js';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export const view = { scale: 1, offsetX: 0, offsetY: 0 };
export const input = createInput(canvas, view);

const params = new URLSearchParams(location.search);
/** ?speed=N runs the clock N times faster (for testing); ?seed=N picks the season's luck. */
export const speed = Math.max(0.25, Math.min(20, Number(params.get('speed')) || 1));
export const seedParam = Number(params.get('seed'));

export const app = {
  screen: 'title',
  game: titleFarm(),
  fx: createEffects(),
  ui: null,
  summary: null,
  button: null,
  best: loadBest(),
  isBest: false,
  t: 0,
  seasons: 0,
};
