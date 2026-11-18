// The challenge corner of the HUD: today's coin goal and how bold the crows are (bottom left), and
// the ticking rush order card (bottom right), so the rising pressure of the season is always visible.
import { drawCrow } from './critter-art.js';
import { drawProduce } from './crop-art.js';
import { roundRect } from './draw-kit.js';
import { CROPS } from './config.js';
import { canFillRush, crowThreat } from './challenges.js';
import { panel, text } from './hud.js';

const Y = 478;
const H = 56;

export function drawChallenges(ctx, game, t) {
  drawDailyGoal(ctx, game, t);
  drawCrowThreat(ctx, game, t);
  drawRushCard(ctx, game, t);
}

function drawDailyGoal(ctx, game, t) {
  const daily = game.daily;
  if (!daily) return;
  panel(ctx, 8, Y, 196, H, daily.done ? 'rgba(226, 246, 214, 0.96)' : 'rgba(255, 246, 224, 0.94)');
  drawStar(ctx, 28, Y + 18, 9, daily.done ? '#ffcf40' : '#e6d3ae', daily.done ? t : 0);
  text(ctx, daily.done ? 'Day goal met!' : 'Day goal', 44, Y + 18, { size: 14, color: daily.done ? '#2f7a3a' : '#7a5a44' });
  text(ctx, `+${daily.bonus}`, 194, Y + 18, { size: 13, align: 'right', color: '#a0660a' });
  const progress = Math.min(1, game.stats.dayEarned / daily.goal);
  roundRect(ctx, 18, Y + 32, 176, 16, 8);
  ctx.fillStyle = '#ead9b8';
  ctx.fill();
  if (progress > 0) {
    roundRect(ctx, 18, Y + 32, Math.max(16, 176 * progress), 16, 8);
    ctx.fillStyle = daily.done ? '#5fbf55' : '#ffb347';
    ctx.fill();
  }
  text(ctx, `${Math.min(game.stats.dayEarned, daily.goal)} / ${daily.goal}`, 106, Y + 40.5, { size: 12, align: 'center', color: '#3c2a20' });
}

function drawCrowThreat(ctx, game, t) {
  const threat = crowThreat(game);
  panel(ctx, 210, Y, 92, H, threat === 3 ? 'rgba(255, 226, 214, 0.96)' : 'rgba(255, 246, 224, 0.94)');
  text(ctx, ['Crows: calm', 'Crows: busy', 'Crows: bold!'][threat - 1], 256, Y + 15, { size: 11, align: 'center', color: threat === 3 ? '#a33a2a' : '#7a5a44' });
  for (let i = 0; i < 3; i += 1) {
    ctx.save();
    ctx.globalAlpha = i < threat ? 1 : 0.22;
    ctx.translate(230 + i * 26, Y + 38);
    ctx.scale(0.62, 0.62);
    drawCrow(ctx, 0, 0, 1, t * 6 + i, false);
    ctx.restore();
  }
}

function drawRushCard(ctx, game, t) {
  const rush = game.rush;
  const x = 652;
  const w = 300;
  if (!rush) {
    const left = game.rushPlan ? game.rushPlan.length : 0;
    panel(ctx, x, Y + 14, w, H - 14, 'rgba(255, 246, 224, 0.82)');
    text(ctx, left ? `Rush orders still to come today: ${left}` : 'No rush orders right now', x + w / 2, Y + 35, { size: 13, align: 'center', color: '#7a5a44', weight: 'normal' });
    return;
  }
  const ready = canFillRush(game);
  const urgent = rush.timer < 10;
  const shake = urgent ? Math.sin(t * 30) * 1.5 : 0;
  ctx.save();
  ctx.translate(shake, 0);
  panel(ctx, x, Y, w, H, ready ? 'rgba(226, 246, 214, 0.97)' : 'rgba(255, 228, 196, 0.97)');
  roundRect(ctx, x + 8, Y + 8, 58, 18, 9);
  ctx.fillStyle = '#e0573c';
  ctx.fill();
  text(ctx, 'RUSH', x + 37, Y + 17.5, { size: 12, align: 'center', color: '#fff6e0' });
  drawProduce(ctx, rush.kind, x + 36, Y + 34, 22, t);
  text(ctx, `${rush.from}: ${rush.qty} x ${CROPS[rush.kind].name}`, x + 74, Y + 17, { size: 13 });
  text(ctx, ready ? 'Ready! Take it to the board' : `have ${game.basket[rush.kind]} · pays ${rush.reward}c`, x + 74, Y + 34, { size: 12, color: ready ? '#2f7a3a' : '#7a5a44', weight: ready ? 'bold' : 'normal' });
  const share = Math.max(0, rush.timer / rush.total);
  roundRect(ctx, x + 74, Y + 43, 170, 7, 3.5);
  ctx.fillStyle = '#ead9b8';
  ctx.fill();
  roundRect(ctx, x + 74, Y + 43, Math.max(7, 170 * share), 7, 3.5);
  ctx.fillStyle = urgent ? '#e0573c' : '#ffb347';
  ctx.fill();
  text(ctx, `${Math.ceil(rush.timer)}s`, x + w - 12, Y + 40, { size: 18, align: 'right', color: urgent ? '#c0391a' : '#8a4a1a' });
  ctx.restore();
}

export function drawStar(ctx, x, y, r, fill, spin = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(spin * 2) * 0.2);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(160, 102, 10, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

