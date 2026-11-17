// The farmer: walking with the keys or toward a clicked tile, bumping into buildings and hedges,
// and the tile they are facing (where Space acts).
import { PLACES, PLAYER, TILE, WORLD_Y } from './config.js';
import { solidAt, tileCenter, tileOf } from './state.js';

const HALF_W = 11;
const HALF_H = 7;
/** The feet sit this far below the farmer's centre point. */
const FEET = 14;

function blocked(game, x, y) {
  const fy = y + FEET;
  const corners = [
    [x - HALF_W, fy - HALF_H],
    [x + HALF_W, fy - HALF_H],
    [x - HALF_W, fy + HALF_H],
    [x + HALF_W, fy + HALF_H],
  ];
  return corners.some(([cx, cy]) => {
    const t = tileOf(cx, cy);
    return solidAt(game, t.c, t.r);
  });
}

function speedOf(game) {
  return game.levels.boots > 0 ? PLAYER.bootsSpeed : PLAYER.speed;
}

/**
 * Move the farmer one step. `axis` is the keyboard's {x, y} (each -1, 0 or 1); with no key held the
 * farmer walks toward a clicked target, if there is one. Returns 'arrived' when a walk-to target is
 * reached (in reach of its tile), 'stuck' when the way is blocked.
 */
export function movePlayer(game, axis, dt) {
  const p = game.player;
  p.action = Math.max(0, p.action - dt);
  let mx = axis.x;
  let my = axis.y;
  let result = null;
  if (mx || my) {
    p.target = null;
  } else if (p.target) {
    const at = standPoint(p.target.c, p.target.r);
    const dx = at.x - p.x;
    const dy = at.y - (p.y + 6);
    const centre = tileCenter(p.target.c, p.target.r);
    const isPlot = at.x === centre.x && at.y === centre.y;
    if ((isPlot && Math.hypot(dx, dy) <= 26) || (!isPlot && inReach(game, p.target.c, p.target.r) && Math.hypot(dx, dy) < 30)) {
      faceToward(p, centre.x - p.x, centre.y - (p.y + 6));
      result = 'arrived';
    } else {
      const len = Math.hypot(dx, dy);
      mx = dx / len;
      my = dy / len;
    }
  }
  const len = Math.hypot(mx, my);
  p.moving = len > 0 && p.action <= 0;
  if (!p.moving) return result;
  mx /= len;
  my /= len;
  const step = speedOf(game) * dt;
  const ox = p.x;
  const oy = p.y;
  if (!blocked(game, p.x + mx * step, p.y)) p.x += mx * step;
  if (!blocked(game, p.x, p.y + my * step)) p.y += my * step;
  // Slide around a corner: when a walk-to is pushing into a wall on one axis, nudge along the other.
  if (p.target && p.x === ox && p.y === oy) {
    const sx = Math.sign(mx) || 1;
    const sy = Math.sign(my) || 1;
    if (!blocked(game, p.x, p.y + sy * step)) p.y += sy * step;
    else if (!blocked(game, p.x + sx * step, p.y)) p.x += sx * step;
  }
  const moved = Math.hypot(p.x - ox, p.y - oy);
  p.walk += moved * 0.09;
  if (Math.abs(mx) > Math.abs(my)) p.dir = mx < 0 ? 'left' : 'right';
  else p.dir = my < 0 ? 'up' : 'down';
  if (p.target) {
    p.stuck = moved < step * 0.3 ? p.stuck + dt : 0;
    if (p.stuck > 0.5) {
      p.target = null;
      p.stuck = 0;
      return 'stuck';
    }
  }
  return result;
}

function faceToward(p, dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) p.dir = dx < 0 ? 'left' : 'right';
  else p.dir = dy < 0 ? 'up' : 'down';
}

/** The tile in front of the farmer: what Space acts on. */
export function facingTile(game) {
  const p = game.player;
  const feetY = p.y + 8;
  const offsets = { up: [0, -30], down: [0, 30], left: [-30, 0], right: [30, 0] };
  const [ox, oy] = offsets[p.dir];
  return tileOf(p.x + ox, feetY + oy);
}

/** The building a tile belongs to (house with its door, stall, board, well with the pond), if any. */
function buildingAt(c, r) {
  const inside = (p) => c >= p.c && c < p.c + (p.w ?? 1) && r >= p.r && r < p.r + (p.h ?? 1);
  if (inside(PLACES.house) || (c === PLACES.door.c && r === PLACES.door.r)) return PLACES.house;
  for (const key of ['stall', 'board', 'well', 'pond']) if (inside(PLACES[key])) return PLACES[key];
  return null;
}

/** Where the farmer walks to act on a tile: a building's front, or the tile itself. */
export function standPoint(c, r) {
  const b = buildingAt(c, r);
  if (!b) return tileCenter(c, r);
  if (b === PLACES.pond) return { x: (b.c + b.w + 0.4) * TILE, y: (b.r + 1) * TILE + WORLD_Y };
  return { x: (b.c + (b.w ?? 1) / 2) * TILE, y: (b.r + (b.h ?? 1) + 0.45) * TILE + WORLD_Y - 8 };
}

export function inReach(game, c, r) {
  const p = game.player;
  const b = buildingAt(c, r);
  if (b) {
    // close enough to any edge of the building
    const x0 = b.c * TILE;
    const y0 = b.r * TILE + WORLD_Y;
    const nx = Math.max(x0, Math.min(p.x, x0 + (b.w ?? 1) * TILE));
    const ny = Math.max(y0, Math.min(p.y + 14, y0 + (b.h ?? 1) * TILE));
    return Math.hypot(nx - p.x, ny - (p.y + 14)) <= 40;
  }
  const at = tileCenter(c, r);
  return Math.hypot(at.x - p.x, at.y - (p.y + 6)) <= PLAYER.reach;
}

export function startAction(game, kind) {
  game.player.action = PLAYER.actionTime;
  game.player.actionKind = kind;
}

