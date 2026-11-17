// The full-screen moments: the title, the cosy end-of-day card, and the Harvest Festival results.
import { drawCoin, drawProduce, drawRibbon, roundRect } from './art.js';
import { CROP_ORDER, CROPS, SEASON, VIEW } from './config.js';
import { drawWeatherIcon, panel, text } from './hud.js';

export function ribbonFor(earned) {
  if (earned >= SEASON.goldGoal) return 'gold';
  if (earned >= SEASON.goal) return 'blue';
  return 'green';
}

/** The title screen, drawn over a gently animated farm. Returns the Start button's rectangle. */
export function drawTitle(ctx, t, best) {
  ctx.fillStyle = 'rgba(255, 236, 200, 0.18)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const bob = Math.sin(t * 1.6) * 4;
  // the logo: a wooden sign with leafy corners
  ctx.save();
  ctx.translate(VIEW.width / 2, 150 + bob);
  ctx.rotate(Math.sin(t * 0.8) * 0.015);
  panel(ctx, -250, -70, 500, 140, '#c98d55', 26);
  roundRect(ctx, -236, -58, 472, 116, 20);
  ctx.fillStyle = '#e3b07a';
  ctx.fill();
  for (const [lx, flip] of [[-240, 1], [240, -1]]) {
    for (let i = 0; i < 3; i += 1) {
      ctx.save();
      ctx.translate(lx, -60);
      ctx.rotate(flip * (0.4 + i * 0.5));
      ctx.beginPath();
      ctx.ellipse(0, -14, 8, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? '#5fbf55' : '#7fd36a';
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.font = `bold 72px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#7a4a2a';
  ctx.strokeText('Chill Farm', 0, -6);
  ctx.fillStyle = '#fff6e0';
  ctx.fillText('Chill Farm', 0, -6);
  text(ctx, 'grow · water · harvest · relax', 0, 46, { size: 18, align: 'center', color: '#7a4a2a' });
  ctx.restore();

  panel(ctx, VIEW.width / 2 - 280, 238, 560, 152, 'rgba(255, 246, 224, 0.96)', 18);
  CROP_ORDER.forEach((kind, i) => {
    const x = VIEW.width / 2 - 200 + i * 100;
    drawProduce(ctx, kind, x, 262 + Math.sin(t * 2 + i) * 3, 34, t);
    text(ctx, CROPS[kind].name, x, 300, { size: 12, align: 'center', color: '#7a5a44' });
  });
  text(ctx, 'You have 10 days before the Harvest Festival.', VIEW.width / 2, 334, { size: 17, align: 'center' });
  text(ctx, `Earn ${SEASON.goal} coins for the blue ribbon, ${SEASON.goldGoal} for gold!`, VIEW.width / 2, 362, { size: 15, align: 'center', color: '#7a5a44' });

  const button = { x: VIEW.width / 2 - 120, y: 404, w: 240, h: 54 };
  const pulse = 1 + Math.sin(t * 4) * 0.03;
  ctx.save();
  ctx.translate(VIEW.width / 2, button.y + button.h / 2);
  ctx.scale(pulse, pulse);
  panel(ctx, -120, -27, 240, 54, '#7fcf6e', 27);
  text(ctx, 'Start farming', 0, 1, { size: 22, align: 'center', color: '#1f4a24' });
  ctx.restore();
  roundRect(ctx, VIEW.width / 2 - 210, 466, 420, 24, 12);
  ctx.fillStyle = 'rgba(74, 52, 40, 0.72)';
  ctx.fill();
  text(ctx, 'Click or press Enter  ·  H for how to play  ·  M to mute', VIEW.width / 2, 478.5, { size: 14, align: 'center', color: '#fff6e0' });
  if (best > 0) {
    panel(ctx, VIEW.width - 200, 64, 188, 40, 'rgba(255, 246, 224, 0.92)', 12);
    drawRibbon(ctx, VIEW.width - 178, 80, 18, ribbonFor(best));
    text(ctx, `Best: ${best}`, VIEW.width - 154, 84, { size: 16 });
  }
  return button;
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
  if (summary.last) {
    text(ctx, 'Tomorrow is the Harvest Festival!', VIEW.width / 2, 314, { size: 18, align: 'center', color: '#a0660a' });
  } else {
    const daysLeft = SEASON.days - summary.day;
    drawWeatherIcon(ctx, summary.weather, VIEW.width / 2 - 110, 312, 12, t);
    const name = { sunny: 'sunny', rain: 'rainy (crops water themselves)', breeze: 'breezy' }[summary.weather];
    text(ctx, `Tomorrow looks ${name}`, VIEW.width / 2 - 88, 314, { size: 15, color: '#4a3428' });
    text(ctx, `${daysLeft} day${daysLeft > 1 ? 's' : ''} until the festival`, VIEW.width / 2, 344, { size: 14, align: 'center', color: '#7a5a44', weight: 'normal' });
  }
  const button = { x: VIEW.width / 2 - 110, y: 368, w: 220, h: 46 };
  panel(ctx, button.x, button.y, button.w, button.h, '#7fcf6e', 23);
  text(ctx, summary.last ? 'To the festival!' : 'Good morning!', VIEW.width / 2, button.y + 24, { size: 19, align: 'center', color: '#1f4a24' });
  return button;
}

/** The Harvest Festival results: ribbon, score and stats. Returns the Play Again button. */
export function drawResults(ctx, game, best, isBest, t) {
  ctx.fillStyle = 'rgba(255, 228, 180, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // bunting across the top
  for (let i = 0; i < 16; i += 1) {
    const x = i * 62 + 10;
    const y = 18 + Math.sin(i * 0.6) * 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40, y);
    ctx.lineTo(x + 20, y + 30);
    ctx.closePath();
    ctx.fillStyle = ['#ff8fb1', '#ffcf40', '#7fcf6e', '#5f9ff0'][i % 4];
    ctx.fill();
  }
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
    ['Best combo', `x${game.stats.bestCombo}`],
    ['Crows shooed', game.stats.crows],
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

