// Crows that sneak in to peck at crops (shoo them with a click or by walking up), and butterflies
// that drift over the flowers just to be pretty.
import { CROPS, CROWS, VIEW } from './config.js';
import { earn } from './market.js';
import { flockSize } from './challenges.js';
import { emit, forEachPlot, tileCenter } from './state.js';

export function updateCrows(game, dt) {
  const level = game.levels.scarecrow;
  const daylight = game.clock < 0.88;
  if (game.weather !== 'rain' && daylight) {
    game.crowTimer -= dt;
    if (game.crowTimer <= 0) {
      // crows grow bolder as the season goes on
      game.crowTimer = CROWS.interval[level] * (1.1 - game.day * 0.04) * game.rng.range(0.7, 1.3);
      const flock = flockSize(game);
      for (let i = 0; i < flock; i += 1) spawnCrow(game, i);
    }
  }
  const player = game.player;
  for (const crow of game.crows) {
    crow.flap += dt * (crow.state === 'peck' ? 3 : 14);
    if (crow.state === 'in' || crow.state === 'out') {
      const dx = crow.tx - crow.x;
      const dy = crow.ty - crow.y;
      const dist = Math.hypot(dx, dy);
      const step = (crow.state === 'out' ? 340 : 190) * dt;
      if (dist <= step) {
        crow.x = crow.tx;
        crow.y = crow.ty;
        if (crow.state === 'in') {
          crow.state = 'peck';
          crow.timer = CROWS.peck[level];
          emit(game, 'caw', crow.x, crow.y);
        } else {
          crow.gone = true;
        }
      } else {
        crow.x += (dx / dist) * step;
        crow.y += (dy / dist) * step;
        crow.face = dx < 0 ? -1 : 1;
      }
    } else if (crow.state === 'peck') {
      const plot = crow.plot;
      if (!plot.crop) {
        flyAway(game, crow);
        continue;
      }
      if (Math.hypot(player.x - crow.x, player.y - crow.y) < 52) {
        shoo(game, crow);
        continue;
      }
      crow.timer -= dt;
      if (crow.timer <= 0) {
        const name = CROPS[plot.crop.kind].name;
        plot.crop = null;
        plot.wet = 0;
        game.stats.eaten += 1;
        emit(game, 'eaten', crow.x, crow.y, `A crow ate your ${name}!`);
        flyAway(game, crow);
      }
    }
  }
  game.crows = game.crows.filter((crow) => !crow.gone);
}

function spawnCrow(game, index = 0) {
  const taken = new Set(game.crows.map((crow) => crow.plot));
  const targets = [];
  forEachPlot(game, (plot) => {
    if (plot.crop && plot.crop.growth > 0.3 && !taken.has(plot)) targets.push(plot);
  });
  if (!targets.length) return;
  // crows love a golden crop best
  const golden = targets.filter((plot) => plot.crop.golden);
  const plot = golden.length && game.rng.chance(0.6) ? game.rng.pick(golden) : game.rng.pick(targets);
  const at = tileCenter(plot.c, plot.r);
  const fromLeft = game.rng.chance(0.5);
  game.crows.push({
    x: fromLeft ? -30 : VIEW.width + 30,
    y: game.rng.range(40, 200) + index * 26,
    tx: at.x,
    ty: at.y - 6,
    face: fromLeft ? 1 : -1,
    state: 'in',
    timer: 0,
    flap: 0,
    plot,
    gone: false,
  });
}

function flyAway(game, crow) {
  crow.state = 'out';
  crow.tx = crow.x < VIEW.width / 2 ? -40 : VIEW.width + 40;
  crow.ty = -40;
}

export function shoo(game, crow) {
  if (crow.state !== 'peck' && crow.state !== 'in') return false;
  game.stats.crows += 1;
  earn(game, CROWS.shooReward);
  emit(game, 'shoo', crow.x, crow.y, `Shoo! +${CROWS.shooReward}`);
  flyAway(game, crow);
  return true;
}

/** The crow under a point (logical pixels), if any, so a click can shoo it. */
export function crowAt(game, x, y) {
  return game.crows.find((crow) => crow.state !== 'out' && Math.hypot(crow.x - x, crow.y - y) < 30) ?? null;
}

export function updateButterflies(game, dt) {
  const want = game.weather === 'rain' || game.clock > 0.8 ? 0 : 4;
  if (game.butterflies.length < want && game.rng.chance(dt * 0.5)) {
    game.butterflies.push({
      x: game.rng.range(60, VIEW.width - 60),
      y: game.rng.range(80, VIEW.height - 80),
      vx: 0,
      vy: 0,
      hue: game.rng.pick([330, 50, 200, 280]),
      t: game.rng.range(0, 10),
      life: game.rng.range(14, 26),
    });
  }
  for (const b of game.butterflies) {
    b.t += dt;
    b.life -= dt;
    b.vx += Math.sin(b.t * 1.3 + b.hue) * 40 * dt;
    b.vy += Math.cos(b.t * 1.7) * 40 * dt;
    b.vx *= 0.98;
    b.vy *= 0.98;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  game.butterflies = game.butterflies.filter((b) => b.life > 0 && b.x > -20 && b.x < VIEW.width + 20);
}
