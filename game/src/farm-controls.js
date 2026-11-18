// Input on the farm: keys and clicks pick seeds, walk the farmer and act on tiles; holding the
// mouse and sweeping acts on a row of plots; clicking a crow shoos it.
import { app, input } from './app.js';
import { play, toggleMute } from './audio.js';
import { canFillRush, fillRush } from './challenges.js';
import { crowAt, shoo } from './critters.js';
import { actOnTile, describeTile, placeAt } from './farm.js';
import { hotbarSlots } from './hud.js';
import { openPanel } from './panels.js';
import { reachable } from './restoration.js';
import { toast } from './particles.js';
import { facingTile, inReach, startAction } from './player.js';
import { finishDay } from './season-flow.js';
import { hotbarItems, plotAt, tileOf } from './state.js';

function selectSlot(index) {
  const count = hotbarItems(app.game).length;
  app.game.selected = (index + count) % count;
  play('click');
}

/** Act on a tile now (a smart action), opening a panel when it is the stall, board or house. */
export function actAt(c, r) {
  const game = app.game;
  const result = actOnTile(game, c, r);
  if (result === 'none') return;
  if (result === 'stall') {
    app.ui = openPanel('shop');
    app.ui.tab = Object.values(game.basket).some((n) => n > 0) ? 0 : 1;
    play('click');
    return;
  }
  if (result === 'board') {
    // a rush order that can be met is handed over the moment the farmer reaches the board
    if (canFillRush(game)) fillRush(game);
    app.ui = openPanel('board');
    play('click');
    return;
  }
  if (result === 'workshop') {
    app.ui = openPanel('workshop');
    play('click');
    return;
  }
  if (result.startsWith('landmark:') || result.startsWith('villager:')) {
    app.ui = openPanel(result.startsWith('landmark:') ? 'landmark' : 'friend', result.slice(9));
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

export function handleFarmInput(presses, clicks, wheel) {
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
    // the bakery is across the creek: until the bridge is fixed, show its panel from afar
    const place = placeAt(game, tile.c, tile.r);
    if (place === 'landmark:bakery' && !reachable(game, 'bakery')) {
      app.ui = openPanel('landmark', 'bakery');
      play('click');
      continue;
    }
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
export function sweepWithMouse(game) {
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
