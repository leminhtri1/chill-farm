// Chill Farm's art, all drawn with canvas shapes: the farmer, five crops at every stage, the
// cottage, stall, well, critters and the little icons. No image files.

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

function ellipse(ctx, x, y, rx, ry, fill, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function leaf(ctx, x, y, length, width, angle, fill) {
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

function sparkle(ctx, x, y, size, t) {
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

// ---------------------------------------------------------------- the farmer

export function drawFarmer(ctx, x, y, dir, walk, moving, action, actionKind, t) {
  const bob = moving ? Math.abs(Math.sin(walk * 2)) * 2 : Math.sin(t * 2) * 0.6;
  const step = moving ? Math.sin(walk * 2) * 3 : 0;
  shadow(ctx, x, y + 21, 13, 4.5);
  // legs
  ellipse(ctx, x - 5, y + 17 + step * 0.4, 4, 4.5, '#5a3d2b');
  ellipse(ctx, x + 5, y + 17 - step * 0.4, 4, 4.5, '#5a3d2b');
  const by = y - bob;
  // body: shirt and overalls
  roundRect(ctx, x - 10, by + 2, 20, 16, 7);
  ctx.fillStyle = '#ffd36e';
  ctx.fill();
  roundRect(ctx, x - 8, by + 7, 16, 11, 5);
  ctx.fillStyle = '#5b8fd6';
  ctx.fill();
  if (dir !== 'up') {
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(x - 6, by + 5, 2, 5);
    ctx.fillRect(x + 4, by + 5, 2, 5);
    ellipse(ctx, x, by + 12, 2.2, 2, '#ffd36e');
  }
  // arms swing, or reach forward during an action
  const reach = action > 0 ? 4 : 0;
  const swing = moving ? Math.sin(walk * 2) * 3 : 0;
  const armX = dir === 'left' ? -reach : dir === 'right' ? reach : 0;
  ellipse(ctx, x - 11 + armX, by + 9 + swing, 3.5, 4.5, '#ffd9b0');
  ellipse(ctx, x + 11 + armX, by + 9 - swing, 3.5, 4.5, '#ffd9b0');
  // head
  const hy = by - 8;
  ellipse(ctx, x, hy, 11, 10, '#ffd9b0');
  if (dir !== 'up') {
    const look = dir === 'left' ? -3 : dir === 'right' ? 3 : 0;
    const blink = Math.sin(t * 1.3) > 0.97;
    ctx.fillStyle = PALETTE.ink;
    if (blink) {
      ctx.fillRect(x - 5 + look, hy + 1, 3, 1.2);
      ctx.fillRect(x + 2 + look, hy + 1, 3, 1.2);
    } else {
      ellipse(ctx, x - 3.6 + look, hy + 1, 1.6, 2, PALETTE.ink);
      ellipse(ctx, x + 3.6 + look, hy + 1, 1.6, 2, PALETTE.ink);
    }
    ellipse(ctx, x - 6.5 + look, hy + 4.5, 2.4, 1.5, 'rgba(255, 120, 120, 0.55)');
    ellipse(ctx, x + 6.5 + look, hy + 4.5, 2.4, 1.5, 'rgba(255, 120, 120, 0.55)');
    ctx.beginPath();
    ctx.arc(x + look, hy + 4.5, 2, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    ellipse(ctx, x, hy + 2, 9, 7, '#8a5a3b');
  }
  // straw hat
  ellipse(ctx, x, hy - 5, 16, 5.5, '#f2c65a');
  ctx.beginPath();
  ctx.ellipse(x, hy - 7, 9, 8, 0, Math.PI, 0);
  ctx.fillStyle = '#f7d77a';
  ctx.fill();
  ctx.fillStyle = '#e45b5b';
  ctx.fillRect(x - 9, hy - 9, 18, 3);
  // the tool in hand while acting
  if (action > 0) drawToolSwing(ctx, x, by, dir, actionKind, action);
}

function drawToolSwing(ctx, x, y, dir, kind, action) {
  const side = dir === 'left' ? -1 : 1;
  const hx = x + side * 15;
  const hy = y + 6;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(side * (0.6 - action * 5));
  if (kind === 'water' || kind === 'refill') {
    roundRect(ctx, -6, -6, 12, 10, 3);
    ctx.fillStyle = '#7fb6d9';
    ctx.fill();
    ctx.fillStyle = '#5e93b8';
    ctx.fillRect(side * 5, -4, side * 8, 3);
  } else if (kind === 'till') {
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(-1.5, -16, 3, 20);
    ctx.fillStyle = '#9aa4ad';
    ctx.fillRect(-6, -18, 12, 4);
  } else {
    ellipse(ctx, 0, 0, 6, 5, '#d9a066');
    ctx.strokeStyle = '#a8703c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -2, 5, Math.PI, 0);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- crops

/** A crop growing on a plot centred at (x, y); stage 0..3, 3 ripe. */
export function drawCrop(ctx, kind, stage, x, y, t, wiggle = 0) {
  const sway = Math.sin(t * 2 + x * 0.05) * 0.05 + Math.sin(wiggle * 12) * wiggle * 0.25;
  const scale = 1 + wiggle * 0.15;
  ctx.save();
  ctx.translate(x, y + 10);
  ctx.scale(scale, scale);
  ctx.rotate(sway);
  if (stage === 0) {
    ellipse(ctx, 0, 0, 7, 3, '#7a4f31');
    leaf(ctx, 0, 0, 7, 3, -0.4, '#7fd36a');
    leaf(ctx, 0, 0, 6, 3, 0.5, '#6cc35a');
    ctx.restore();
    return;
  }
  const grow = stage === 1 ? 0.55 : stage === 2 ? 0.8 : 1;
  CROP_DRAW[kind](ctx, grow, stage === 3, t);
  ctx.restore();
  if (stage === 3) sparkle(ctx, x + 13, y - 14, 4, t + x);
}

const CROP_DRAW = {
  turnip(ctx, g, ripe) {
    if (ripe) {
      ellipse(ctx, 0, -4, 10, 9, '#f6eefa');
      ctx.beginPath();
      ctx.ellipse(0, -8, 10, 6, 0, Math.PI, 0);
      ctx.fillStyle = '#b679d1';
      ctx.fill();
      ellipse(ctx, -3, -3, 3, 4, 'rgba(255,255,255,0.7)');
    }
    const base = ripe ? -12 : 0;
    leaf(ctx, 0, base, 20 * g, 7 * g, -0.5, '#5fbf55');
    leaf(ctx, 0, base, 24 * g, 8 * g, 0.1, '#6fd062');
    leaf(ctx, 0, base, 19 * g, 7 * g, 0.6, '#55ad4c');
  },
  carrot(ctx, g, ripe) {
    if (ripe) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.quadraticCurveTo(0, 8, 8, -4);
      ctx.quadraticCurveTo(0, -10, -8, -4);
      ctx.fillStyle = '#f28c28';
      ctx.fill();
      ctx.fillStyle = '#d96f14';
      ctx.fillRect(-4, -3, 5, 1.5);
      ctx.fillRect(1, 0, 4, 1.5);
    }
    const base = ripe ? -7 : 0;
    for (let i = -2; i <= 2; i += 1) leaf(ctx, i * 2, base, (18 + (2 - Math.abs(i)) * 5) * g, 3.5 * g, i * 0.3, i % 2 ? '#4fb34a' : '#66c75a');
  },
  berry(ctx, g, ripe) {
    ellipse(ctx, 0, -10 * g, 15 * g, 12 * g, '#4fa84a');
    ellipse(ctx, -5 * g, -14 * g, 9 * g, 7 * g, '#62bd58');
    ellipse(ctx, 6 * g, -8 * g, 8 * g, 6 * g, '#459a42');
    const dots = ripe ? [[-8, -8], [6, -13], [0, -4], [9, -3], [-4, -16]] : g > 0.7 ? [[-6, -8], [5, -12]] : [];
    for (const [dx, dy] of dots) {
      if (ripe) {
        ellipse(ctx, dx, dy, 4.5, 4, '#ff4f6d');
        ellipse(ctx, dx - 1.2, dy - 1.2, 1.3, 1, '#ffd0d8');
      } else {
        ellipse(ctx, dx, dy, 2.5, 2.5, '#ffffff');
      }
    }
  },
  pumpkin(ctx, g, ripe) {
    leaf(ctx, -4, 0, 16 * g, 9 * g, -1.1, '#4e9f45');
    leaf(ctx, 4, 0, 16 * g, 9 * g, 1.1, '#5cb352');
    if (ripe || g > 0.7) {
      const s = ripe ? 1 : 0.5;
      const color = ripe ? '#f6a23a' : '#c8d65a';
      ellipse(ctx, -7 * s, -7 * s, 8 * s, 9 * s, ripe ? '#e88f2a' : color);
      ellipse(ctx, 7 * s, -7 * s, 8 * s, 9 * s, ripe ? '#e88f2a' : color);
      ellipse(ctx, 0, -7 * s, 9 * s, 10 * s, color);
      ctx.fillStyle = '#6b8e2f';
      ctx.fillRect(-1.5, -19 * s, 3, 5 * s);
      if (ripe) ellipse(ctx, -3, -11, 2.5, 3.5, 'rgba(255,255,255,0.35)');
    } else {
      leaf(ctx, 0, 0, 20 * g, 6 * g, 0, '#6cc35a');
    }
  },
  moonmelon(ctx, g, ripe, t) {
    leaf(ctx, -3, 0, 15 * g, 8 * g, -0.9, '#3f8f72');
    leaf(ctx, 3, 0, 15 * g, 8 * g, 0.9, '#4aa383');
    if (ripe) {
      const glow = 0.25 + 0.15 * Math.sin(t * 3);
      ellipse(ctx, 0, -9, 20, 17, `rgba(170, 230, 255, ${glow})`);
      ellipse(ctx, 0, -9, 13, 11, '#9fd8ff');
      ellipse(ctx, -4, -13, 4, 3, 'rgba(255,255,255,0.7)');
      ctx.fillStyle = '#fff8c2';
      for (const [dx, dy] of [[5, -12], [-6, -6], [3, -4]]) star(ctx, dx, dy, 2.6);
    } else if (g > 0.7) {
      ellipse(ctx, 0, -6, 6, 5, '#bfe6c9');
    } else {
      leaf(ctx, 0, 0, 18 * g, 5 * g, 0, '#5cb895');
    }
  },
};

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

/** A crop's produce alone, for the hotbar, basket and shop. */
export function drawProduce(ctx, kind, x, y, size, t = 0) {
  ctx.save();
  ctx.translate(x, y + size * 0.35);
  const s = size / 30;
  ctx.scale(s, s);
  if (kind === 'turnip') CROP_DRAW.turnip(ctx, 0.55, true);
  else if (kind === 'carrot') {
    ctx.rotate(-0.6);
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.quadraticCurveTo(0, 14, 6, -16);
    ctx.closePath();
    ctx.fillStyle = '#f28c28';
    ctx.fill();
    leaf(ctx, 0, -16, 10, 3, -0.3, '#5fbf55');
    leaf(ctx, 0, -16, 10, 3, 0.3, '#4fb34a');
  } else if (kind === 'berry') {
    ellipse(ctx, 0, -8, 9, 10, '#ff4f6d');
    ellipse(ctx, -3, -11, 2.5, 2, '#ffd0d8');
    leaf(ctx, 0, -17, 6, 4, -0.8, '#4fa84a');
    leaf(ctx, 0, -17, 6, 4, 0.8, '#4fa84a');
  } else if (kind === 'pumpkin') CROP_DRAW.pumpkin(ctx, 0.01, true);
  else CROP_DRAW.moonmelon(ctx, 0.01, true, t);
  ctx.restore();
}

/** A little paper seed packet with the produce on it. */
export function drawSeedPacket(ctx, kind, x, y, size) {
  roundRect(ctx, x - size * 0.42, y - size * 0.5, size * 0.84, size, 4);
  ctx.fillStyle = PALETTE.paper;
  ctx.fill();
  ctx.strokeStyle = '#d9b77a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  drawProduce(ctx, kind, x, y - size * 0.1, size * 0.62);
}

export function drawSprinklerIcon(ctx, x, y, size, t = 0) {
  const s = size / 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ellipse(ctx, 0, 8, 10, 4, '#7f8a95');
  ctx.fillStyle = '#a9b4bf';
  ctx.fillRect(-3, -6, 6, 14);
  ellipse(ctx, 0, -7, 6, 4, '#c9d3dc');
  ctx.rotate(t * 4);
  ctx.fillStyle = '#5aa6d6';
  ctx.fillRect(-9, -8, 18, 2);
  ctx.restore();
}

// ---------------------------------------------------------------- the farm's buildings and things

export function drawHouse(ctx, x, y, w, h, night) {
  shadow(ctx, x + w / 2, y + h + 4, w * 0.55, 8);
  // walls
  roundRect(ctx, x + 8, y + 30, w - 16, h - 30, 6);
  ctx.fillStyle = '#fbe6c4';
  ctx.fill();
  ctx.fillStyle = '#e9cfa3';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(x + 8, y + 42 + i * 13, w - 16, 2);
  // roof
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 36);
  ctx.lineTo(x + w / 2, y - 10);
  ctx.lineTo(x + w + 4, y + 36);
  ctx.closePath();
  ctx.fillStyle = PALETTE.roof;
  ctx.fill();
  ctx.fillStyle = '#c9534a';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(x + 16 + i * 4, y + 22 - i * 10, w - 32 - i * 8, 3);
  }
  // chimney
  ctx.fillStyle = '#a65a4a';
  ctx.fillRect(x + w - 40, y - 2, 12, 22);
  // door and windows
  roundRect(ctx, x + w / 2 - 11, y + h - 34, 22, 34, 8);
  ctx.fillStyle = '#9b6238';
  ctx.fill();
  ellipse(ctx, x + w / 2 + 6, y + h - 16, 2, 2, PALETTE.gold);
  const glass = night ? '#ffe28a' : '#9ad7f0';
  for (const wx of [x + 22, x + w - 44]) {
    roundRect(ctx, wx, y + 50, 22, 18, 4);
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = '#fff6e0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff6e0';
    ctx.fillRect(wx + 10, y + 50, 2, 18);
  }
  // flower boxes
  for (const wx of [x + 22, x + w - 44]) {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(wx - 2, y + 68, 26, 5);
    for (let i = 0; i < 4; i += 1) ellipse(ctx, wx + 3 + i * 6, y + 66, 2.6, 2.6, i % 2 ? '#ff8fb1' : '#ffd84f');
  }
}

export function drawChimneySmoke(ctx, x, y, t) {
  for (let i = 0; i < 4; i += 1) {
    const p = (t * 0.25 + i / 4) % 1;
    ellipse(ctx, x + Math.sin(p * 6 + i) * 5, y - p * 46, 4 + p * 8, 4 + p * 7, `rgba(255,255,255,${0.55 * (1 - p)})`);
  }
}

export function drawStall(ctx, x, y, w, h, t) {
  shadow(ctx, x + w / 2, y + h + 2, w * 0.5, 7);
  // counter
  roundRect(ctx, x + 4, y + h - 40, w - 8, 40, 5);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  ctx.fillStyle = PALETTE.woodDark;
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 4, y + h - 30 + i * 11, w - 8, 2);
  // posts
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 8, y + 14, 5, h - 50);
  ctx.fillRect(x + w - 13, y + 14, 5, h - 50);
  // striped awning that flutters a little
  const stripes = 7;
  const sw = (w + 8) / stripes;
  for (let i = 0; i < stripes; i += 1) {
    const flutter = Math.sin(t * 3 + i) * 1.5;
    ctx.fillStyle = i % 2 ? '#fff6e0' : '#5fb6a8';
    ctx.beginPath();
    ctx.moveTo(x - 4 + i * sw, y + 4);
    ctx.lineTo(x - 4 + (i + 1) * sw, y + 4);
    ctx.lineTo(x - 4 + (i + 1) * sw, y + 26 + flutter);
    ctx.arc(x - 4 + (i + 0.5) * sw, y + 26 + flutter, sw / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  // produce crates on the counter
  const goods = ['turnip', 'carrot', 'pumpkin', 'berry'];
  goods.forEach((kind, i) => {
    const cx = x + 22 + i * ((w - 44) / 3);
    roundRect(ctx, cx - 12, y + h - 50, 24, 12, 3);
    ctx.fillStyle = '#c99a62';
    ctx.fill();
    drawProduce(ctx, kind, cx, y + h - 60, 20);
  });
  // sign
  roundRect(ctx, x + w / 2 - 30, y + h - 26, 60, 18, 5);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MARKET', x + w / 2, y + h - 17);
}

export function drawBoard(ctx, x, y, t, hasReady) {
  shadow(ctx, x + 24, y + 46, 18, 5);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 10, y + 20, 4, 26);
  ctx.fillRect(x + 34, y + 20, 4, 26);
  roundRect(ctx, x + 2, y + 2, 44, 30, 4);
  ctx.fillStyle = PALETTE.wood;
  ctx.fill();
  const notes = ['#fff1cf', '#ffe0ea', '#e2f4ff'];
  notes.forEach((c, i) => {
    ctx.save();
    ctx.translate(x + 10 + i * 13, y + 9);
    ctx.rotate((i - 1) * 0.12);
    ctx.fillStyle = c;
    ctx.fillRect(-1, 0, 11, 14);
    ctx.fillStyle = '#e45b5b';
    ctx.fillRect(3, 0, 3, 2);
    ctx.restore();
  });
  if (hasReady) {
    const b = Math.sin(t * 5) * 3;
    ellipse(ctx, x + 24, y - 12 + b, 9, 9, PALETTE.gold);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', x + 24, y - 11 + b);
  }
}

export function drawWell(ctx, x, y) {
  shadow(ctx, x + 24, y + 42, 22, 6);
  ellipse(ctx, x + 24, y + 30, 20, 12, '#9aa4ad');
  ellipse(ctx, x + 24, y + 27, 15, 8, '#3f6f8a');
  ellipse(ctx, x + 22, y + 26, 5, 2, 'rgba(255,255,255,0.4)');
  ctx.fillStyle = '#8a939c';
  ctx.fillRect(x + 4, y + 28, 40, 10);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 6, y - 2, 4, 32);
  ctx.fillRect(x + 38, y - 2, 4, 32);
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x + 24, y - 14);
  ctx.lineTo(x + 48, y + 2);
  ctx.closePath();
  ctx.fillStyle = PALETTE.roof;
  ctx.fill();
  roundRect(ctx, x + 18, y + 8, 12, 10, 2);
  ctx.fillStyle = '#7fb6d9';
  ctx.fill();
}

export function drawPond(ctx, x, y, w, h, t) {
  ellipse(ctx, x + w / 2, y + h / 2, w / 2 + 2, h / 2 - 2, '#5fae5a');
  ellipse(ctx, x + w / 2, y + h / 2, w / 2 - 4, h / 2 - 8, PALETTE.water);
  ellipse(ctx, x + w / 2 - 12, y + h / 2 - 10, 14, 4, 'rgba(255,255,255,0.35)');
  for (const [px, py] of [[0.3, 0.6], [0.7, 0.4]]) {
    ellipse(ctx, x + w * px, y + h * py + Math.sin(t + px * 9) * 1.5, 7, 4, '#5fbf55');
  }
  ellipse(ctx, x + w * 0.7 + 3, y + h * 0.4 - 2, 2.5, 2.5, '#ff9fc0');
}

export function drawHedge(ctx, x, y, size, seed) {
  const r = size * 0.42;
  ellipse(ctx, x + size / 2, y + size * 0.62, r + 4, r * 0.9, PALETTE.hedgeDark);
  ellipse(ctx, x + size / 2 - 6, y + size * 0.48, r * 0.75, r * 0.7, PALETTE.hedge);
  ellipse(ctx, x + size / 2 + 7, y + size * 0.52, r * 0.7, r * 0.65, '#5aa854');
  if (seed % 3 === 0) ellipse(ctx, x + size / 2 + 4, y + size * 0.4, 3, 3, seed % 2 ? '#ff8fb1' : '#fff6e0');
}

export function drawTree(ctx, x, y, size, t) {
  shadow(ctx, x, y + size * 0.42, size * 0.4, 7);
  ctx.fillStyle = '#8a5a3b';
  ctx.fillRect(x - 5, y, 10, size * 0.42);
  const sway = Math.sin(t * 0.8 + x) * 1.5;
  ellipse(ctx, x + sway, y - size * 0.15, size * 0.45, size * 0.38, '#4a9a48');
  ellipse(ctx, x - 10 + sway, y - size * 0.25, size * 0.28, size * 0.25, '#5cb357');
  ellipse(ctx, x + 12 + sway, y - size * 0.05, size * 0.25, size * 0.22, '#3f8a40');
  ellipse(ctx, x + 6 + sway, y - size * 0.3, 4, 4, '#ff6f6f');
  ellipse(ctx, x - 12 + sway, y - size * 0.05, 4, 4, '#ff6f6f');
}

export function drawScarecrow(ctx, x, y, level, t) {
  shadow(ctx, x, y + 20, 12, 4);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x - 2, y - 12, 4, 32);
  ctx.fillRect(x - 18, y - 4, 36, 4);
  const wave = Math.sin(t * 2) * 2;
  roundRect(ctx, x - 9, y - 8, 18, 18, 4);
  ctx.fillStyle = level > 1 ? '#7a6bd1' : '#d0584c';
  ctx.fill();
  ellipse(ctx, x - 18, y - 2 + wave, 4, 3, '#f2c65a');
  ellipse(ctx, x + 18, y - 2 - wave, 4, 3, '#f2c65a');
  ellipse(ctx, x, y - 17, 8, 8, '#f6e2b0');
  ellipse(ctx, x - 3, y - 17, 1.4, 1.4, PALETTE.ink);
  ellipse(ctx, x + 3, y - 17, 1.4, 1.4, PALETTE.ink);
  ellipse(ctx, x, y - 23, 12, 3.5, '#c9973f');
  ctx.beginPath();
  ctx.ellipse(x, y - 24, 6, 6, 0, Math.PI, 0);
  ctx.fillStyle = '#d9a84f';
  ctx.fill();
  if (level > 1) {
    // a sleepy owl friend on the arm
    ellipse(ctx, x + 15, y - 12, 6, 7, '#a7845e');
    ellipse(ctx, x + 13, y - 14, 2, 2, '#fff6e0');
    ellipse(ctx, x + 17, y - 14, 2, 2, '#fff6e0');
  }
}

export function drawCompost(ctx, x, y, level) {
  shadow(ctx, x + 24, y + 42, 20, 5);
  roundRect(ctx, x + 4, y + 10, 40, 30, 4);
  ctx.fillStyle = level > 0 ? '#8a5a33' : '#a8835e';
  ctx.fill();
  ctx.fillStyle = '#6e4628';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 4, y + 16 + i * 8, 40, 2);
  if (level > 0) {
    ellipse(ctx, x + 24, y + 10, 16, 7, '#5e3b26');
    ellipse(ctx, x + 18, y + 7, 4, 3, '#6cc35a');
    ellipse(ctx, x + 30, y + 8, 3, 2, '#f28c28');
  }
}

export function drawSprinkler(ctx, x, y, t, spraying) {
  drawSprinklerIcon(ctx, x, y - 4, 26, t);
  if (spraying > 0) {
    ctx.strokeStyle = `rgba(150, 215, 255, ${Math.min(1, spraying) * 0.7})`;
    ctx.lineWidth = 2;
    const r = 30 + (1 - spraying) * 40;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawCrow(ctx, x, y, face, flap, pecking) {
  shadow(ctx, x, y + 14, 10, 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  const peck = pecking ? Math.max(0, Math.sin(flap * 4)) * 4 : 0;
  ellipse(ctx, 0, 2, 11, 8, '#3a3550');
  ellipse(ctx, -9, 0, 6, 3, '#2c2840', -0.4);
  const wing = pecking ? 0 : Math.sin(flap) * 7;
  ctx.beginPath();
  ctx.ellipse(-1, -1 - wing * 0.5, 9, 4 + Math.abs(wing) * 0.5, -0.3 - wing * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#4b4566';
  ctx.fill();
  ellipse(ctx, 8, -4 + peck, 6, 5.5, '#3a3550');
  ellipse(ctx, 9.5, -5 + peck, 1.7, 1.7, '#fff');
  ellipse(ctx, 10, -5 + peck, 0.9, 0.9, '#111');
  ctx.beginPath();
  ctx.moveTo(13, -4 + peck);
  ctx.lineTo(19, -2 + peck);
  ctx.lineTo(13, -1 + peck);
  ctx.fillStyle = PALETTE.gold;
  ctx.fill();
  ctx.fillStyle = '#e8a33a';
  ctx.fillRect(-2, 9, 1.5, 4);
  ctx.fillRect(2, 9, 1.5, 4);
  ctx.restore();
}

export function drawButterfly(ctx, x, y, hue, t) {
  const flap = Math.abs(Math.sin(t * 12));
  ctx.fillStyle = `hsl(${hue}, 85%, 72%)`;
  ctx.beginPath();
  ctx.ellipse(x - 3 * flap, y, 4 * flap + 1, 3.5, -0.4, 0, Math.PI * 2);
  ctx.ellipse(x + 3 * flap, y, 4 * flap + 1, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(x - 0.6, y - 3, 1.2, 6);
}

export function drawFlower(ctx, x, y, color) {
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2.2, 2.2, color);
  }
  ellipse(ctx, x, y, 1.6, 1.6, '#ffe36e');
}

export function drawCoin(ctx, x, y, r) {
  ellipse(ctx, x, y, r, r, '#f2b632');
  ellipse(ctx, x, y, r * 0.75, r * 0.75, PALETTE.gold);
  ctx.fillStyle = '#e09a1c';
  ctx.font = `bold ${Math.round(r * 1.2)}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('c', x, y + 0.5);
}

export function drawDrop(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.5);
  ctx.quadraticCurveTo(x + r, y - r * 0.2, x + r, y + r * 0.3);
  ctx.arc(x, y + r * 0.3, r, 0, Math.PI);
  ctx.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.5);
  ctx.fillStyle = '#5fb2e8';
  ctx.fill();
  ellipse(ctx, x - r * 0.35, y, r * 0.25, r * 0.35, 'rgba(255,255,255,0.7)');
}

export function drawRibbon(ctx, x, y, size, color) {
  ctx.fillStyle = color === 'gold' ? '#e0a92a' : color === 'blue' ? '#3f7fd1' : '#5fae5a';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.15, y);
    ctx.lineTo(x + side * size * 0.45, y + size * 1.1);
    ctx.lineTo(x + side * size * 0.25, y + size * 0.95);
    ctx.lineTo(x + side * size * 0.1, y + size * 1.15);
    ctx.lineTo(x - side * size * 0.05, y + size * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  const petal = color === 'gold' ? '#ffcf40' : color === 'blue' ? '#5f9ff0' : '#7fcf6e';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * size * 0.42, y + Math.sin(a) * size * 0.42, size * 0.18, size * 0.18, petal);
  }
  ellipse(ctx, x, y, size * 0.38, size * 0.38, PALETTE.cream);
  ellipse(ctx, x, y, size * 0.3, size * 0.3, petal);
}
