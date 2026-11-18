// Shared layout for the pop-up panels: the panel box every panel draws in, and a big icon button.
import { roundRect } from './draw-kit.js';

export const BOX = { x: 160, y: 66, w: 640, h: 438 };

/** A soft rounded card behind a group of things in a panel. */
export function card(ctx, x, y, w, h, fill = 'rgba(234, 211, 166, 0.5)', r = 14) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A thin progress bar. */
export function bar(ctx, x, y, w, h, progress, fill = '#7fcf6e', back = '#ead9b8') {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = back;
  ctx.fill();
  if (progress > 0) {
    roundRect(ctx, x, y, Math.max(h, w * Math.min(1, progress)), h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
}
