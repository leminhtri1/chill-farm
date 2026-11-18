// Farmer skill: experience from farm work, level-ups, and the perk the player picks (one of two)
// at each new level. Other rules ask hasPerk() to apply a perk's effect.
import { PERKS, SKILLS } from './config.js';
import { emit } from './state.js';

export function hasPerk(game, id) {
  return game.perks.includes(id);
}

/** How far through the current level (0..1), for the HUD's experience bar. */
export function levelProgress(game) {
  const prev = SKILLS.levels[game.level - 2] ?? 0;
  const next = SKILLS.levels[game.level - 1];
  if (next === undefined) return 1;
  return Math.max(0, Math.min(1, (game.xp - prev) / (next - prev)));
}

/** Add experience; every level reached offers two perks to pick from. */
export function addXp(game, amount) {
  game.xp += amount;
  for (;;) {
    const next = SKILLS.levels[game.level - 1];
    if (next === undefined || game.xp < next) break;
    game.level += 1;
    game.pendingLevels += 1;
    emit(game, 'levelup', game.player.x, game.player.y - 40, `Level ${game.level}! Pick a perk`);
  }
  if (!game.perkOffer && game.pendingLevels > 0) offerPerks(game);
}

function offerPerks(game) {
  const open = Object.keys(PERKS).filter((id) => !game.perks.includes(id));
  if (open.length < 2) {
    game.pendingLevels = 0;
    return;
  }
  const first = game.rng.pick(open);
  const second = game.rng.pick(open.filter((id) => id !== first));
  game.perkOffer = [first, second];
}

/** Take perk 0 or 1 of the current offer. */
export function choosePerk(game, index) {
  const id = game.perkOffer && game.perkOffer[index];
  if (!id) return false;
  game.perks.push(id);
  game.perkOffer = null;
  game.pendingLevels = Math.max(0, game.pendingLevels - 1);
  emit(game, 'perk', 0, 0, `${PERKS[id].name}: ${PERKS[id].about}`);
  if (game.pendingLevels > 0) offerPerks(game);
  return true;
}
