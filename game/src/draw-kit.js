// Shared drawing helpers for all the art: the palette, rounded boxes, ellipses, leaves, sparkles and stars.
export const PALETTE = {
  grass: '#8fcf6e',
  grassDark: '#79bb5a',
  grassLight: '#a6dc84',
  soil: '#a8754d',
  soilDark: '#8b5c3a',
  soilWet: '#6b452c',
  path: '#e8cf9a',
  pathDark: '#d4b67c',
  hedge: '#4f9a4a',
  hedgeDark: '#3d7f3b',
  ink: '#4a3428',
  cream: '#fff6e0',
  paper: '#fff1cf',
  wood: '#b07a4a',
  woodDark: '#8a5a33',
  roof: '#e0675a',
  water: '#6cc3e6',
  gold: '#ffcf40',
};

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ellipse(ctx, x, y, rx, ry, fill, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function leaf(ctx, x, y, length, width, angle, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(width, -length * 0.5, 0, -length);
  ctx.quadraticCurveTo(-width, -length * 0.5, 0, 0);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

export function shadow(ctx, x, y, rx, ry = rx * 0.35) {
  ellipse(ctx, x, y, rx, ry, 'rgba(40, 60, 20, 0.22)');
}

export function sparkle(ctx, x, y, size, t) {
  const s = size * (0.7 + 0.3 * Math.sin(t * 6));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t);
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2;
    ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
    ctx.lineTo(Math.cos(a + Math.PI / 4) * s * 0.3, Math.sin(a + Math.PI / 4) * s * 0.3);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}
