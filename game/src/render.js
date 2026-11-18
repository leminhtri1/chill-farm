// Draws one frame: the farm scene, effects and weather, then the HUD and whichever screen or panel
// is on top, all in the 960x540 logical canvas scaled to the window.
import { app, canvas, ctx, input, view } from './app.js';
import { drawChallenges } from './challenge-hud.js';
import { VIEW } from './config.js';
import { describeTile } from './farm.js';
import { drawHud, drawToasts } from './hud.js';
import { drawPanel } from './panels.js';
import { drawEffects } from './particles.js';
import { drawPlayOverlays } from './play-overlays.js';
import { inReach } from './player.js';
import { drawScene, drawWeather } from './scene.js';
import { drawDaySummary, drawResults, drawTitle } from './screens.js';
import { tileOf } from './state.js';

export function render() {
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
    if (app.screen !== 'results') {
      drawHud(ctx, game, app.t);
      drawChallenges(ctx, game, app.t);
    }
    if (app.screen === 'play') drawPlayOverlays(game, hover);
    drawToasts(ctx, app.fx);
    if (app.screen === 'day') app.button = drawDaySummary(ctx, app.summary, game, app.t);
    if (app.screen === 'results') app.button = drawResults(ctx, game, app.best, app.isBest, app.t);
  }
  if (app.ui) drawPanel(ctx, game, app.ui, app.t);
  ctx.restore();
}
