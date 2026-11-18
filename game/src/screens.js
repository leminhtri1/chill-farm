// The full-screen moments: the title card over the golden-hour farm, the cosy end-of-day card, and
// the Harvest Festival results under fireworks.
import { drawProduce } from './crop-art.js';
import { roundRect } from './draw-kit.js';
import { drawCoin, drawRibbon } from './icon-art.js';
import { CROP_ORDER, CROPS, LANDMARK_ORDER, PERKS, PLACES, PRESERVES, SEASON, TILE, VIEW, WORLD_Y } from './config.js';
import { drawStar } from './challenge-hud.js';
import { drawFestivalNight } from './festival-art.js';
import { drawWeatherIcon, FONT, panel, text } from './hud.js';
import { restoredCount } from './restoration.js';
import { drawHeart, drawPerkIcon } from './villager-art.js';
import { totalHearts } from './villagers.js';
import { drawJar } from './workshop-art.js';

export function ribbonFor(earned) {
  if (earned >= SEASON.goldGoal) return 'gold';
  if (earned >= SEASON.goal) return 'blue';
  return 'green';
}

/** A small name tag pinned over a place on the title farm. */
function tag(ctx, label, x, y, color = '#2f7a3a') {
  ctx.font = `bold 14px ${FONT}`;
  const w = ctx.measureText(label).width + 22;
  panel(ctx, x - w / 2, y - 13, w, 26, 'rgba(255, 246, 224, 0.95)', 13);
  text(ctx, label, x, y + 0.5, { size: 14, align: 'center', color });
}

/** The title card over the golden-hour farm: the sign, the goal, the five crops by name, Start. */
export function drawTitle(ctx, t, best) {
  // gentle shade at the top and bottom so the words stay readable over the busy field
  const shade = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  shade.addColorStop(0, 'rgba(60, 30, 10, 0.3)');
  shade.addColorStop(0.22, 'rgba(60, 30, 10, 0)');
  shade.addColorStop(0.7, 'rgba(60, 30, 10, 0)');
  shade.addColorStop(1, 'rgba(60, 30, 10, 0.55)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // what the farm behind the sign shows: the workshop and the restored village
  const at = (p, dx, dy) => [(p.c + (p.w ?? 1) / 2) * TILE + dx, p.r * TILE + WORLD_Y + dy];
  tag(ctx, 'Preserves Workshop', ...at(PLACES.workshop, 0, -26), '#8a3a2a');
  tag(ctx, 'Pond restored', ...at(PLACES.pond, 6, -14));
  tag(ctx, 'Bridge fixed', ...at(PLACES.bridge, -14, -30));
  tag(ctx, 'Bakery reopened', ...at(PLACES.bakery, -30, -28));
  drawLogo(ctx, t);

  // the five crops, by name
  panel(ctx, 168, 382, 668, 62, 'rgba(255, 246, 224, 0.94)', 18);
  CROP_ORDER.forEach((kind, i) => {
    const x = 180 + i * 131;
    drawProduce(ctx, kind, x + 16, 404, 32, t);
    text(ctx, CROPS[kind].name, x + 38, 414, { size: 16, color: '#4a3428' });
  });

  const button = { x: VIEW.width / 2 - 110, y: 458, w: 220, h: 54 };
  const pulse = 1 + Math.sin(t * 4) * 0.03;
  ctx.save();
  ctx.translate(VIEW.width / 2, button.y + button.h / 2);
  ctx.scale(pulse, pulse);
  panel(ctx, -110, -27, 220, 54, '#7fcf6e', 27);
  text(ctx, 'Start farming', 0, 1, { size: 23, align: 'center', color: '#1f4a24' });
  ctx.restore();

  panel(ctx, 16, 458, 324, 54, 'rgba(255, 246, 224, 0.95)', 20);
  drawRibbon(ctx, 40, 474, 16, 'blue');
  text(ctx, `Goal: earn ${SEASON.goal.toLocaleString('en')} coins`, 60, 474, { size: 17, color: '#2f5fa8' });
  text(ctx, 'in 10 days, before the Harvest Festival', 60, 496, { size: 13, color: '#7a5a44' });
  panel(ctx, 620, 458, 324, 54, 'rgba(255, 246, 224, 0.95)', 20);
  drawJar(ctx, 646, 494, 28, PRESERVES.colors.berry, 1);
  text(ctx, 'Make jams, restore the', 666, 474, { size: 15, color: '#8a3a2a' });
  text(ctx, 'village, make friends', 666, 496, { size: 15, color: '#8a3a2a' });
  text(ctx, `Click or Enter to start  ·  H how to play  ·  M mute  ·  ${SEASON.goldGoal.toLocaleString('en')} coins for gold`, VIEW.width / 2, 528, { size: 12, align: 'center', color: '#fff6e0' });
  if (best > 0) {
    panel(ctx, 12, 10, 150, 34, 'rgba(255, 246, 224, 0.92)', 12);
    drawRibbon(ctx, 32, 22, 14, ribbonFor(best));
    text(ctx, `Best: ${best}`, 50, 27.5, { size: 15 });
  }
  return button;
}

/** The wooden "Chill Farm" sign hanging from two ropes, swaying a little. */
function drawLogo(ctx, t) {
  ctx.save();
  ctx.translate(VIEW.width / 2, 72 + Math.sin(t * 1.6) * 2);
  ctx.scale(0.86, 0.86);
  ctx.rotate(Math.sin(t * 0.8) * 0.012);
  ctx.strokeStyle = '#7a4a2a';
  ctx.lineWidth = 3;
  for (const x of [-170, 170]) {
    ctx.beginPath();
    ctx.moveTo(x, -90);
    ctx.lineTo(x, -50);
    ctx.stroke();
  }
  panel(ctx, -225, -56, 450, 118, '#c98d55', 26);
  roundRect(ctx, -212, -45, 424, 96, 20);
  ctx.fillStyle = '#e3b07a';
  ctx.fill();
  for (const [lx, flip] of [[-222, 1], [222, -1]]) {
    for (let i = 0; i < 3; i += 1) {
      ctx.save();
      ctx.translate(lx, -50);
      ctx.rotate(flip * (0.4 + i * 0.5));
      ctx.beginPath();
      ctx.ellipse(0, -14, 8, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? '#5fbf55' : '#7fd36a';
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.font = 'bold 66px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#7a4a2a';
  ctx.strokeText('Chill Farm', 0, -8);
  ctx.fillStyle = '#fff6e0';
  ctx.fillText('Chill Farm', 0, -8);
  text(ctx, 'grow · preserve · restore · befriend', 0, 38, { size: 18, align: 'center', color: '#7a4a2a' });
  ctx.restore();
}

/** The end-of-day card. Returns the Continue button's rectangle. */
export function drawDaySummary(ctx, summary, game, t) {
  ctx.fillStyle = 'rgba(28, 32, 80, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // moon and stars
  for (let i = 0; i < 40; i += 1) {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
    ctx.fillStyle = `rgba(255, 250, 220, ${tw})`;
    ctx.fillRect((i * 97) % VIEW.width, (i * 53) % 200, 2, 2);
  }
  ctx.beginPath();
  ctx.arc(820, 90, 44, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 243, 196, 0.18)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(820, 90, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3c4';
  ctx.fill();
  for (const [mx, my, mr] of [[810, 80, 6], [832, 98, 5], [826, 76, 3]]) {
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 205, 150, 0.6)';
    ctx.fill();
  }

  panel(ctx, VIEW.width / 2 - 230, 110, 460, 320, 'rgba(255, 246, 224, 0.98)', 20);
  text(ctx, `Day ${summary.day} is done`, VIEW.width / 2, 150, { size: 28, align: 'center' });
  text(ctx, 'You tuck in for a cosy night. Zzz...', VIEW.width / 2, 182, { size: 15, align: 'center', color: '#7a5a44', weight: 'normal' });
  drawCoin(ctx, VIEW.width / 2 - 92, 226, 14);
  text(ctx, `Earned today: ${summary.earned}`, VIEW.width / 2 - 70, 226, { size: 20 });
  const progress = Math.min(1, game.earned / SEASON.goal);
  roundRect(ctx, VIEW.width / 2 - 180, 256, 360, 18, 9);
  ctx.fillStyle = '#ead9b8';
  ctx.fill();
  roundRect(ctx, VIEW.width / 2 - 180, 256, Math.max(18, 360 * progress), 18, 9);
  ctx.fillStyle = game.goalReached ? '#5f9ff0' : '#7fcf6e';
  ctx.fill();
  text(ctx, `Festival: ${game.earned} / ${SEASON.goal}`, VIEW.width / 2, 266, { size: 12, align: 'center', color: '#3c2a20' });
  drawStar(ctx, VIEW.width / 2 - 120, 290, 9, summary.dailyDone ? '#ffcf40' : '#e6d3ae');
  text(ctx, summary.dailyDone ? `Day goal of ${summary.dailyGoal} met: bonus paid!` : `Day goal of ${summary.dailyGoal} missed. Tomorrow!`, VIEW.width / 2 - 104, 290, { size: 14, color: summary.dailyDone ? '#2f7a3a' : '#a07a5a' });
  if (summary.last) {
    text(ctx, 'Tomorrow is the Harvest Festival!', VIEW.width / 2, 324, { size: 18, align: 'center', color: '#a0660a' });
  } else {
    const daysLeft = SEASON.days - summary.day;
    drawWeatherIcon(ctx, summary.weather, VIEW.width / 2 - 110, 322, 12, t);
    const name = { sunny: 'sunny', rain: 'rainy (crops water themselves)', breeze: 'breezy' }[summary.weather];
    text(ctx, `Tomorrow looks ${name}`, VIEW.width / 2 - 88, 324, { size: 15, color: '#4a3428' });
    text(ctx, `${daysLeft} day${daysLeft > 1 ? 's' : ''} until the festival`, VIEW.width / 2, 348, { size: 14, align: 'center', color: '#7a5a44', weight: 'normal' });
  }
  const button = { x: VIEW.width / 2 - 110, y: 370, w: 220, h: 46 };
  panel(ctx, button.x, button.y, button.w, button.h, '#7fcf6e', 23);
  text(ctx, summary.last ? 'To the festival!' : 'Good morning!', VIEW.width / 2, button.y + 24, { size: 19, align: 'center', color: '#1f4a24' });
  return button;
}

/** The Harvest Festival results: ribbon, score, the season's depth and stats. Returns Play Again. */
export function drawResults(ctx, game, best, isBest, t) {
  drawFestivalNight(ctx, t);
  const ribbon = ribbonFor(game.earned);
  const cx = VIEW.width / 2;
  panel(ctx, cx - 310, 26, 620, 488, 'rgba(255, 246, 224, 0.98)', 22);
  text(ctx, 'Harvest Festival Results', cx, 58, { size: 28, align: 'center' });
  drawRibbon(ctx, cx - 190, 118 + Math.sin(t * 2) * 3, 44, ribbon);
  const title = { gold: 'Gold Ribbon! Legendary farmer!', blue: 'Blue Ribbon! Festival winner!', green: 'Green Ribbon: a lovely first season' }[ribbon];
  text(ctx, title, cx - 120, 98, { size: 20, color: ribbon === 'green' ? '#2f7a3a' : ribbon === 'blue' ? '#2f5fa8' : '#a0660a' });
  text(ctx, 'Final score', cx - 120, 128, { size: 14, color: '#7a5a44', weight: 'normal' });
  text(ctx, `${game.earned}`, cx - 120, 158, { size: 38 });
  if (isBest) text(ctx, 'New best!', cx + 40, 160, { size: 18, color: '#c0471a' });
  else text(ctx, `Best ${best}`, cx + 40, 160, { size: 16, color: '#7a5a44' });
  if (ribbon !== 'gold') {
    const next = ribbon === 'green' ? SEASON.goal : SEASON.goldGoal;
    text(ctx, `${next - game.earned} more for the ${ribbon === 'green' ? 'blue' : 'gold'} ribbon`, cx + 40, 132, { size: 13, color: '#7a5a44', weight: 'normal' });
  }
  // the season's depth: big tiles that read at a glance
  const tiles = [
    { label: 'goods processed', value: game.stats.processed, icon: (x, y) => drawJar(ctx, x, y + 16, 36, PRESERVES.colors.berry, 1) },
    { label: 'landmarks restored', value: `${restoredCount(game)}/${LANDMARK_ORDER.length}`, icon: (x, y) => drawLandmarkBadge(ctx, x, y) },
    { label: 'friendship hearts', value: totalHearts(game), icon: (x, y) => drawHeart(ctx, x, y, 30) },
    { label: 'perks chosen', value: game.perks.length, icon: (x, y) => drawPerkIcon(ctx, 'star', x, y, 40, 0) },
  ];
  tiles.forEach((tile, i) => {
    const x = cx - 296 + i * 148;
    roundRect(ctx, x, 186, 140, 92, 14);
    ctx.fillStyle = ['rgba(255, 214, 220, 0.7)', 'rgba(214, 240, 200, 0.8)', 'rgba(255, 220, 230, 0.8)', 'rgba(255, 233, 160, 0.75)'][i];
    ctx.fill();
    tile.icon(x + 34, 220);
    text(ctx, `${tile.value}`, x + 62, 222, { size: 28 });
    text(ctx, tile.label, x + 70, 262, { size: 13, align: 'center', color: '#5a4030' });
  });
  // the perks the farmer picked, as small icons
  if (game.perks.length) {
    text(ctx, 'Perks:', cx - 296, 300, { size: 13, color: '#7a5a44' });
    // names fit for a few perks; a long list shows just the icons
    const named = game.perks.length <= 4;
    const step = named ? 132 : Math.min(60, 540 / game.perks.length);
    game.perks.forEach((id, i) => {
      const x = cx - 238 + i * step;
      drawPerkIcon(ctx, PERKS[id].icon, x, 300, named ? 22 : 26, t);
      if (named) text(ctx, PERKS[id].name, x + 16, 300, { size: 12, color: '#4a3428' });
    });
  }
  const stats = [
    ['Crops harvested', game.stats.harvested],
    ['Orders filled', game.stats.orders],
    ['Golden crops', game.stats.golden],
    ['Day goals met', `${game.stats.dailyGoals} / ${SEASON.days}`],
    ['Gifts given', game.stats.gifts],
    ['Best combo', `x${game.stats.bestCombo}`],
  ];
  stats.forEach(([label, value], i) => {
    const x = cx - 296 + (i % 2) * 300;
    const y = 334 + Math.floor(i / 2) * 30;
    roundRect(ctx, x, y - 12, 292, 25, 9);
    ctx.fillStyle = 'rgba(234, 211, 166, 0.55)';
    ctx.fill();
    text(ctx, label, x + 12, y + 0.5, { size: 14, weight: 'normal' });
    text(ctx, `${value}`, x + 280, y + 0.5, { size: 15, align: 'right' });
  });
  const button = { x: cx - 130, y: 428, w: 260, h: 52 };
  panel(ctx, button.x, button.y, button.w, button.h, '#7fcf6e', 26);
  text(ctx, 'Play another season', cx, button.y + 27, { size: 20, align: 'center', color: '#1f4a24' });
  text(ctx, 'Enter / click to restart  ·  Esc for the title', cx, 498, { size: 12, align: 'center', color: '#a08a70', weight: 'normal' });
  return button;
}

/** A little hammer-and-house badge for the landmarks tile. */
function drawLandmarkBadge(ctx, x, y) {
  ctx.fillStyle = '#c8735a';
  ctx.beginPath();
  ctx.moveTo(x - 16, y);
  ctx.lineTo(x, y - 15);
  ctx.lineTo(x + 16, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe3c8';
  ctx.fillRect(x - 12, y, 24, 16);
  ctx.fillStyle = '#9b6238';
  ctx.fillRect(x - 4, y + 5, 8, 11);
  ctx.save();
  ctx.translate(x + 14, y + 6);
  ctx.rotate(-0.7);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(-2, -4, 4, 16);
  ctx.fillStyle = '#7d8a96';
  ctx.fillRect(-7, -9, 14, 6);
  ctx.restore();
}
