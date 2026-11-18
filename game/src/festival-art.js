// The Harvest Festival night behind the results: a deep evening sky, twinkling stars, a string of
// paper lanterns and fireworks blooming over the farm.
import { VIEW } from './config.js';

const FIREWORK_COLORS = ['#ffcf40', '#ff8fb1', '#7fe0ff', '#b9f27a', '#ffb347', '#d7a6ff'];
/** Where the fireworks bloom: on the left and right of the results card, and above it. */
const LAUNCHES = [[90, 150], [870, 130], [150, 330], [820, 320], [480, 30], [60, 470], [905, 460]];

export function drawFestivalNight(ctx, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  sky.addColorStop(0, 'rgba(24, 22, 70, 0.9)');
  sky.addColorStop(0.6, 'rgba(58, 34, 92, 0.78)');
  sky.addColorStop(1, 'rgba(120, 60, 80, 0.7)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  for (let i = 0; i < 60; i += 1) {
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.3 + i * 1.7));
    ctx.fillStyle = `rgba(255, 250, 220, ${twinkle})`;
    ctx.fillRect((i * 151) % VIEW.width, (i * 67) % VIEW.height, 2, 2);
  }
  LAUNCHES.forEach(([x, y], i) => drawFirework(ctx, x, y, t + i * 0.83, i));
  drawLanterns(ctx, t);
}

function drawFirework(ctx, x, y, t, index) {
  const period = 2.6;
  const cycle = Math.floor(t / period);
  const p = (t % period) / period;
  if (p > 0.8) return;
  const bloom = p / 0.8;
  const color = FIREWORK_COLORS[(cycle + index) % FIREWORK_COLORS.length];
  const radius = 26 + 48 * Math.sqrt(bloom);
  const sparks = 18;
  ctx.save();
  ctx.translate(x + ((cycle * 37) % 40) - 20, y + ((cycle * 23) % 30) - 15);
  ctx.globalAlpha = 1 - bloom ** 2;
  // a soft flash at the centre
  const flash = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  flash.addColorStop(0, `${color}55`);
  flash.addColorStop(1, `${color}00`);
  ctx.fillStyle = flash;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < sparks; i += 1) {
    const a = (i / sparks) * Math.PI * 2;
    const drop = bloom * bloom * 14;
    const x1 = Math.cos(a) * radius * 0.55;
    const y1 = Math.sin(a) * radius * 0.55 + drop;
    const x2 = Math.cos(a) * radius;
    const y2 = Math.sin(a) * radius + drop;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x2, y2, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLanterns(ctx, t) {
  const colors = ['#ff7a59', '#ffcf40', '#ff8fb1', '#7fcf6e', '#5f9ff0'];
  // two strings sagging across the top
  for (const [x0, x1, top, sag] of [[-10, 490, 10, 34], [470, 970, 10, 34]]) {
    ctx.strokeStyle = 'rgba(60, 40, 30, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.quadraticCurveTo((x0 + x1) / 2, top + sag * 2, x1, top);
    ctx.stroke();
    for (let i = 1; i < 8; i += 1) {
      const u = i / 8;
      const x = x0 + (x1 - x0) * u;
      const y = top + sag * 4 * u * (1 - u) + Math.sin(t * 1.5 + i) * 1.5;
      const color = colors[(i + (x0 > 0 ? 2 : 0)) % colors.length];
      const glow = ctx.createRadialGradient(x, y + 10, 2, x, y + 10, 26);
      glow.addColorStop(0, `${color}99`);
      glow.addColorStop(1, `${color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y + 10, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 9, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(60, 40, 30, 0.85)';
      ctx.fillRect(x - 4, y - 2, 8, 3);
      ctx.fillRect(x - 3, y + 20, 6, 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(x - 5, y + 6, 2, 8);
    }
  }
}
