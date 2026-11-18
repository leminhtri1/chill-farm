// Draws the farm itself: meadow, paths and hedges (cached), the field plots and crops, buildings,
// the farmer and critters sorted by depth, then the time-of-day light and the weather.
import {
  drawBoard, drawChimneySmoke, drawCompost, drawHouse, drawScarecrow, drawSprinkler, drawStall, drawWell,
} from './building-art.js';
import { drawButterfly, drawCrow } from './critter-art.js';
import { drawCrop } from './crop-art.js';
import { PALETTE, roundRect } from './draw-kit.js';
import { drawFarmer } from './farmer-art.js';
import { drawFlower, drawHedge, drawPond, drawTree } from './nature-art.js';
import { canFillRush } from './challenges.js';
import { COLS, PLACES, ROWS, TILE, VIEW, WORLD_Y } from './config.js';
import { cropStage, isWet } from './farm.js';
import { canFill } from './orders.js';
import { drawRain } from './particles.js';
import { createRandom } from './random.js';
import { inField, inFutureField, plotAt, T_HEDGE, T_PATH } from './state.js';

let groundCache = null;
let groundKey = '';

/** The meadow, paths and hedges never change during a season (except the field size), so draw them once. */
function ground(game) {
  const key = `${game.levels.field}`;
  if (groundCache && groundKey === key) return groundCache;
  const canvas = document.createElement('canvas');
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  const ctx = canvas.getContext('2d');
  const rng = createRandom(7);
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const x = c * TILE;
      const y = r * TILE + WORLD_Y;
      if ((c + r) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.035)';
        ctx.fillRect(x, y, TILE, TILE);
      }
      const kind = game.terrain[r][c];
      if (kind === T_PATH) {
        roundRect(ctx, x + 1, y + 1, TILE - 2, TILE - 2, 10);
        ctx.fillStyle = PALETTE.path;
        ctx.fill();
        for (let i = 0; i < 3; i += 1) {
          ctx.fillStyle = PALETTE.pathDark;
          ctx.beginPath();
          ctx.arc(x + rng.range(8, 40), y + rng.range(8, 40), rng.range(1.5, 3), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (kind !== T_HEDGE) {
        for (let i = 0; i < 4; i += 1) {
          const gx = x + rng.range(4, 44);
          const gy = y + rng.range(6, 44);
          ctx.strokeStyle = rng.chance(0.5) ? PALETTE.grassDark : PALETTE.grassLight;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx - 2, gy - 5);
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + 2, gy - 6);
          ctx.stroke();
        }
        if (!inFutureField(c, r) && rng.chance(0.22)) {
          drawFlower(ctx, x + rng.range(10, 38), y + rng.range(10, 38), rng.pick(['#ff8fb1', '#fff6e0', '#c9a2ff', '#ffd84f']));
        }
      }
      // land that a Bigger Field upgrade will open: a soft mown patch with corner stakes
      if (inFutureField(c, r) && !inField(game, c, r)) {
        ctx.fillStyle = 'rgba(120, 170, 80, 0.35)';
        ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
        ctx.fillStyle = 'rgba(138, 90, 51, 0.5)';
        ctx.fillRect(x + 4, y + 4, 3, 3);
        ctx.fillRect(x + TILE - 7, y + TILE - 7, 3, 3);
      }
    }
  }
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (game.terrain[r][c] === T_HEDGE) drawHedge(ctx, c * TILE, r * TILE + WORLD_Y - 6, TILE, c * 7 + r * 3);
    }
  }
  groundCache = canvas;
  groundKey = key;
  return canvas;
}

function drawPlot(ctx, game, plot, t) {
  const x = plot.c * TILE;
  const y = plot.r * TILE + WORLD_Y;
  if (!plot.tilled) {
    roundRect(ctx, x + 4, y + 4, TILE - 8, TILE - 8, 8);
    ctx.strokeStyle = 'rgba(110, 160, 70, 0.75)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }
  const wet = isWet(plot);
  roundRect(ctx, x + 3, y + 3, TILE - 6, TILE - 6, 9);
  ctx.fillStyle = wet ? PALETTE.soilWet : PALETTE.soil;
  ctx.fill();
  ctx.fillStyle = wet ? 'rgba(40, 25, 15, 0.35)' : PALETTE.soilDark;
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 9, y + 12 + i * 11, TILE - 18, 3);
  if (wet) {
    ctx.fillStyle = 'rgba(160, 210, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 34, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // rain makes little ripples splash on the wet soil
  if (game.weather === 'rain') {
    for (let i = 0; i < 2; i += 1) {
      const p = (t * 0.9 + plot.c * 0.37 + plot.r * 0.61 + i * 0.5) % 1;
      ctx.strokeStyle = `rgba(200, 228, 255, ${0.7 * (1 - p)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x + 14 + i * 20, y + 36 - i * 20, 3 + p * 8, 1.5 + p * 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // a thirsty crop shows a little drop bubble
  if (plot.crop && !plot.crop.ripe && plot.crop.water <= 0) {
    const b = Math.sin(t * 4 + plot.c) * 2;
    roundRect(ctx, x + 28, y - 4 + b, 18, 16, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.fillStyle = '#5fb2e8';
    ctx.beginPath();
    ctx.moveTo(x + 37, y - 1 + b);
    ctx.quadraticCurveTo(x + 42, y + 6 + b, x + 37, y + 9 + b);
    ctx.quadraticCurveTo(x + 32, y + 6 + b, x + 37, y - 1 + b);
    ctx.fill();
  }
}

/** Everything that stands up, drawn back to front by its feet's y. */
function standing(game, t, night) {
  const list = [];
  const at = (p) => ({ x: p.c * TILE, y: p.r * TILE + WORLD_Y });
  const house = at(PLACES.house);
  list.push({ y: house.y + PLACES.house.h * TILE, draw: (ctx) => {
    drawHouse(ctx, house.x, house.y, PLACES.house.w * TILE, PLACES.house.h * TILE, night);
    drawChimneySmoke(ctx, house.x + PLACES.house.w * TILE - 34, house.y - 4, t);
  } });
  const stall = at(PLACES.stall);
  list.push({ y: stall.y + PLACES.stall.h * TILE, draw: (ctx) => drawStall(ctx, stall.x, stall.y, PLACES.stall.w * TILE, PLACES.stall.h * TILE, t) });
  const board = at(PLACES.board);
  const ready = game.orders.some((order) => canFill(game, order)) || canFillRush(game);
  list.push({ y: board.y + TILE, draw: (ctx) => drawBoard(ctx, board.x, board.y + 4, t, ready) });
  const well = at(PLACES.well);
  list.push({ y: well.y + TILE, draw: (ctx) => drawWell(ctx, well.x, well.y + 2) });
  const compost = at(PLACES.compost);
  list.push({ y: compost.y + TILE, draw: (ctx) => drawCompost(ctx, compost.x, compost.y, game.levels.compost) });
  if (game.levels.scarecrow > 0) {
    const s = at(PLACES.scarecrow);
    list.push({ y: s.y + TILE, draw: (ctx) => drawScarecrow(ctx, s.x + TILE / 2, s.y + TILE / 2 - 2, game.levels.scarecrow, t) });
  }
  for (const [tx, ty] of [[1.2, 4.6], [17.6, 5.2], [18.4, 6.4]]) {
    list.push({ y: ty * TILE + WORLD_Y + 20, draw: (ctx) => drawTree(ctx, tx * TILE, ty * TILE + WORLD_Y, 52, t) });
  }
  for (const plot of game.plots) {
    if (!plot || !inField(game, plot.c, plot.r)) continue;
    const cx = plot.c * TILE + TILE / 2;
    const cy = plot.r * TILE + WORLD_Y + TILE / 2;
    if (plot.crop) {
      const crop = plot.crop;
      list.push({ y: cy + 12, draw: (ctx) => drawCrop(ctx, crop.kind, cropStage(crop), cx, cy, t, crop.wiggle, crop.golden) });
    }
    if (plot.sprinkler) {
      const spraying = plot.sprinkle > 11 ? Math.min(1, plot.sprinkle - 11) : 0;
      list.push({ y: cy + 12, draw: (ctx) => drawSprinkler(ctx, cx, cy + 4, t, spraying) });
    }
  }
  const p = game.player;
  list.push({ y: p.y + 20, draw: (ctx) => drawFarmer(ctx, p.x, p.y, p.dir, p.walk, p.moving, p.action, p.actionKind, t) });
  for (const crow of game.crows) {
    const flying = crow.state !== 'peck';
    list.push({ y: flying ? 9999 : crow.y + 14, draw: (ctx) => drawCrow(ctx, crow.x, crow.y, crow.face, crow.flap, !flying) });
  }
  list.sort((a, b) => a.y - b.y);
  return list;
}

/** How dark it is (0 day .. 1 deep night) from the day's progress. */
export function nightAmount(game) {
  const c = game.clock;
  if (c < 0.06) return 0.35 * (1 - c / 0.06);
  if (c < 0.7) return 0;
  return Math.min(0.75, ((c - 0.7) / 0.3) * 0.75);
}

/** How strong the golden-hour light is (0..1): it rises after 2pm, peaks near 5pm and fades by dusk. */
export function goldenHour(clock) {
  if (clock < 0.48 || clock > 0.8) return 0;
  return Math.sin(((clock - 0.48) / 0.32) * Math.PI) ** 1.5;
}

export function drawScene(ctx, game, t, hover) {
  ctx.drawImage(ground(game), 0, 0);
  const pond = PLACES.pond;
  drawPond(ctx, pond.c * TILE, pond.r * TILE + WORLD_Y, pond.w * TILE, pond.h * TILE, t);
  for (const plot of game.plots) if (plot && inField(game, plot.c, plot.r)) drawPlot(ctx, game, plot, t);
  // untouched field tiles show their dashed outline too
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (inField(game, c, r) && !game.plots[r * COLS + c]) drawPlot(ctx, game, { c, r, tilled: false }, t);
    }
  }
  if (hover) drawHover(ctx, hover);
  const night = nightAmount(game);
  for (const item of standing(game, t, night > 0.3)) item.draw(ctx);
  for (const b of game.butterflies) drawButterfly(ctx, b.x, b.y, b.hue, b.t);
  drawLight(ctx, game, night, t);
}

function drawHover(ctx, hover) {
  const x = hover.c * TILE;
  const y = hover.r * TILE + WORLD_Y;
  roundRect(ctx, x + 2, y + 2, TILE - 4, TILE - 4, 10);
  ctx.lineWidth = 3;
  ctx.strokeStyle = hover.near ? 'rgba(255, 246, 200, 0.95)' : 'rgba(255, 255, 255, 0.45)';
  ctx.stroke();
  if (hover.near) {
    ctx.fillStyle = 'rgba(255, 246, 200, 0.16)';
    ctx.fill();
  }
}

function drawLight(ctx, game, night, t) {
  if (game.weather === 'rain') {
    // a cool, grey-blue rainy light with darker clouds drifting at the top
    ctx.fillStyle = 'rgba(52, 74, 124, 0.34)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    const cloud = ctx.createLinearGradient(0, 0, 0, 220);
    cloud.addColorStop(0, 'rgba(40, 52, 84, 0.45)');
    cloud.addColorStop(1, 'rgba(40, 52, 84, 0)');
    ctx.fillStyle = cloud;
    ctx.fillRect(0, 0, VIEW.width, 220);
  }
  // late afternoon: warm golden-hour light slanting in from the setting sun (top right)
  const golden = goldenHour(game.clock);
  if (golden > 0 && game.weather !== 'rain') {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = `rgba(255, 140, 40, ${0.75 * golden})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.restore();
    const sun = ctx.createRadialGradient(VIEW.width + 40, -40, 20, VIEW.width + 40, -40, 760);
    sun.addColorStop(0, `rgba(255, 236, 150, ${0.45 * golden})`);
    sun.addColorStop(0.4, `rgba(255, 190, 90, ${0.26 * golden})`);
    sun.addColorStop(1, `rgba(230, 120, 90, ${0.12 * golden})`);
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    drawSunRays(ctx, golden, t);
  }
  if (night > 0) {
    ctx.fillStyle = `rgba(30, 36, 92, ${night * 0.7})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    // fireflies come out at dusk
    if (night > 0.25 && game.weather !== 'rain') {
      for (let i = 0; i < 14; i += 1) {
        const fx = (i * 137 + Math.sin(t * 0.5 + i) * 40 + t * 8) % VIEW.width;
        const fy = 90 + ((i * 71) % 400) + Math.cos(t * 0.7 + i) * 20;
        const glow = 0.5 + 0.5 * Math.sin(t * 3 + i * 2);
        ctx.fillStyle = `rgba(255, 240, 140, ${glow * night})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (game.clock < 0.2) {
    ctx.fillStyle = `rgba(255, 200, 140, ${0.12 * (1 - game.clock / 0.2)})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
}

/** Soft beams of evening sun slanting down from the top-right corner. */
function drawSunRays(ctx, golden, t) {
  ctx.save();
  ctx.translate(VIEW.width + 60, -60);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i += 1) {
    const angle = 2.05 + i * 0.16 + Math.sin(t * 0.3 + i) * 0.01;
    const width = 0.035 + (i % 2) * 0.025;
    const beam = ctx.createLinearGradient(0, 0, Math.cos(angle) * 900, Math.sin(angle) * 900);
    beam.addColorStop(0, `rgba(255, 220, 140, ${0.09 * golden})`);
    beam.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 1100, angle - width, angle + width);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawWeather(ctx, fx, game, t) {
  drawRain(ctx, fx);
  if (game.weather === 'breeze') {
    for (let i = 0; i < 10; i += 1) {
      const x = (t * 90 + i * 113) % (VIEW.width + 60) - 30;
      const y = (i * 53 + Math.sin(t * 2 + i) * 30 + 60) % VIEW.height;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 3 + i);
      ctx.fillStyle = i % 2 ? 'rgba(255, 190, 210, 0.8)' : 'rgba(150, 210, 110, 0.8)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
