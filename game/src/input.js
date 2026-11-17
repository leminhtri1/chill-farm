// Keyboard and mouse: held keys for walking, and queues of presses, clicks and wheel turns that
// the game reads once per frame. Mouse positions are converted to the 960x540 logical canvas.
import { VIEW } from './config.js';

export function createInput(canvas, view) {
  const input = {
    held: new Set(),
    presses: [],
    clicks: [],
    wheel: 0,
    mouse: { x: -1, y: -1, inside: false },
    firstGesture: false,
  };

  const toLogical = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * (canvas.width / rect.width) - view.offsetX) / view.scale,
      y: ((event.clientY - rect.top) * (canvas.height / rect.height) - view.offsetY) / view.scale,
    };
  };

  window.addEventListener('keydown', (event) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'];
    if (keys.includes(event.key)) event.preventDefault();
    input.firstGesture = true;
    if (!event.repeat) input.presses.push(event.key);
    input.held.add(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  });
  window.addEventListener('keyup', (event) => {
    input.held.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  });
  window.addEventListener('blur', () => input.held.clear());
  canvas.addEventListener('mousemove', (event) => {
    const p = toLogical(event);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.inside = p.x >= 0 && p.y >= 0 && p.x <= VIEW.width && p.y <= VIEW.height;
  });
  canvas.addEventListener('mouseleave', () => {
    input.mouse.inside = false;
  });
  canvas.addEventListener('mousedown', (event) => {
    input.firstGesture = true;
    const p = toLogical(event);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.clicks.push({ x: p.x, y: p.y, button: event.button });
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    input.wheel += Math.sign(event.deltaY);
  }, { passive: false });
  return input;
}

/** The walking direction from WASD / arrow keys, each axis -1, 0 or 1. */
export function moveAxis(input) {
  const h = input.held;
  return {
    x: (h.has('d') || h.has('ArrowRight') ? 1 : 0) - (h.has('a') || h.has('ArrowLeft') ? 1 : 0),
    y: (h.has('s') || h.has('ArrowDown') ? 1 : 0) - (h.has('w') || h.has('ArrowUp') ? 1 : 0),
  };
}

export function drain(input) {
  const presses = input.presses;
  const clicks = input.clicks;
  const wheel = input.wheel;
  input.presses = [];
  input.clicks = [];
  input.wheel = 0;
  return { presses, clicks, wheel };
}
