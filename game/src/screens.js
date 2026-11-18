// The full-screen moments: the title over the golden-hour farm, the cosy end-of-day card, and the
// Harvest Festival results under fireworks.
import { roundRect } from './draw-kit.js';
import { drawCoin, drawRibbon } from './icon-art.js';
import { SEASON, VIEW } from './config.js';
import { drawStar } from './challenge-hud.js';
import { drawFestivalNight } from './festival-art.js';
import { drawWeatherIcon, panel, text } from './hud.js';

export function ribbonFor(earned) {
  if (earned >= SEASON.goldGoal) return 'gold';
  if (earned >= SEASON.goal) return 'blue';
  return 'green';
}

/** The title screen over the golden-hour farm: a hanging sign, the goal and the Start button. */
export function drawTitle(ctx, t, best) {
  // gentle shade at the top and bottom so the words stay readable over the busy field
  const shade = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  shade.addColorStop(0, 'rgba(60, 30, 10, 0.32)');
  shade.addColorStop(0.28, 'rgba(60, 30, 10, 0)');
  shade.addColorStop(0.8, 'rgba(60, 30, 10, 0)');
  shade.addColorStop(1, 'rgba(60, 30, 10, 0.5)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawLogo(ctx, t);

  const button = { x: VIEW.width / 2 - 120, y: 448, w: 240, h: 56 };
  const pulse = 1 + Math.sin(t * 4) * 0.03;
  ctx.save();
  ctx.translate(VIEW.width / 2, button.y + button.h / 2);
  ctx.scale(pulse, pulse);
  panel(ctx, -120, -28, 240, 56, '#7fcf6e', 28);
  text(ctx, 'Start farming', 0, 1, { size: 24, align: 'center', color: '#1f4a24' });
  ctx.restore();

  panel(ctx, 24, 456, 300, 40, 'rgba(255, 246, 224, 0.95)', 20);
  text(ctx, '10 days until the Harvest Festival', 174, 476.5, { size: 16, align: 'center' });
  panel(ctx, 636, 456, 300, 40, 'rgba(255, 246, 224, 0.95)', 20);
  drawRibbon(ctx, 664, 468, 16, 'blue');
  text(ctx, `${SEASON.goal.toLocaleString('en')}`, 682, 476.5, { size: 17, color: '#2f5fa8' });
  drawRibbon(ctx, 786, 468, 16, 'gold');
  text(ctx, `${SEASON.goldGoal.toLocaleString('en')} coins`, 804, 476.5, { size: 17, color: '#a0660a' });
  text(ctx, 'Click or press Enter  ·  H for how to play  ·  M to mute', VIEW.width / 2, 524, { size: 13, align: 'center', color: '#fff6e0' });
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
  ctx.translate(VIEW.width / 2, 84 + Math.sin(t * 1.6) * 3);
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
  ctx.font = `bold 66px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#7a4a2a';
  ctx.strokeText('Chill Farm', 0, -8);
  ctx.fillStyle = '#fff6e0';
  ctx.fillText('Chill Farm', 0, -8);
  text(ctx, 'grow · water · harvest · relax', 0, 38, { size: 17, align: 'center', color: '#7a4a2a' });
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

/** The Harvest Festival results: ribbon, score and stats. Returns the Play Again button. */
export function drawResults(ctx, game, best, isBest, t) {
  drawFestivalNight(ctx, t);
  const ribbon = ribbonFor(game.earned);
  panel(ctx, VIEW.width / 2 - 300, 60, 600, 420, 'rgba(255, 246, 224, 0.98)', 22);
  text(ctx, 'Harvest Festival Results', VIEW.width / 2, 98, { size: 30, align: 'center' });
  drawRibbon(ctx, VIEW.width / 2 - 170, 170 + Math.sin(t * 2) * 3, 48, ribbon);
  const title = { gold: 'Gold Ribbon! Legendary farmer!', blue: 'Blue Ribbon! Festival winner!', green: 'Green Ribbon: a lovely first season' }[ribbon];
  text(ctx, title, VIEW.width / 2 - 100, 150, { size: 20, color: ribbon === 'green' ? '#2f7a3a' : ribbon === 'blue' ? '#2f5fa8' : '#a0660a' });
  text(ctx, 'Final score', VIEW.width / 2 - 100, 184, { size: 15, color: '#7a5a44', weight: 'normal' });
  text(ctx, `${game.earned}`, VIEW.width / 2 - 100, 218, { size: 40 });
  if (isBest) text(ctx, 'New best!', VIEW.width / 2 + 60, 220, { size: 18, color: '#c0471a' });
  else text(ctx, `Best ${best}`, VIEW.width / 2 + 60, 220, { size: 16, color: '#7a5a44' });
  if (ribbon !== 'gold') {
    const next = ribbon === 'green' ? SEASON.goal : SEASON.goldGoal;
    text(ctx, `${next - game.earned} more for the ${ribbon === 'green' ? 'blue' : 'gold'} ribbon`, VIEW.width / 2 - 100, 252, { size: 14, color: '#7a5a44', weight: 'normal' });
  }
  const stats = [
    ['Crops harvested', game.stats.harvested],
    ['Perfect crops', game.stats.perfect],
    ['Orders filled', game.stats.orders],
    ['Golden crops', game.stats.golden],
    ['Day goals met', `${game.stats.dailyGoals} / ${SEASON.days}`],
    ['Best combo', `x${game.stats.bestCombo}`],
  ];
  stats.forEach(([label, value], i) => {
    const x = VIEW.width / 2 - 260 + (i % 2) * 270;
    const y = 290 + Math.floor(i / 2) * 34;
    roundRect(ctx, x, y - 14, 250, 28, 9);
    ctx.fillStyle = 'rgba(234, 211, 166, 0.55)';
    ctx.fill();
    text(ctx, label, x + 12, y, { size: 14, weight: 'normal' });
    text(ctx, `${value}`, x + 238, y, { size: 15, align: 'right' });
  });
  const button = { x: VIEW.width / 2 - 120, y: 404, w: 240, h: 52 };
  panel(ctx, button.x, button.y, button.w, button.h, '#7fcf6e', 26);
  text(ctx, 'Play another season', VIEW.width / 2, button.y + 27, { size: 19, align: 'center', color: '#1f4a24' });
  text(ctx, 'Enter / click to restart  ·  Esc for the title', VIEW.width / 2, 470, { size: 12, align: 'center', color: '#a08a70', weight: 'normal' });
  return button;
}

