// Village restoration: donate produce to bring the village's landmarks back to life. Each one
// changes the map and unlocks something: the pond's ducks keep crows away, the fixed bridge lets
// the seed merchant bring Moonmelons, and the reopened bakery pays more for preserves.
import { CROPS, LANDMARK_ORDER, LANDMARKS, PLACES, PRESERVES, SKILLS, TILE, WORLD_Y } from './config.js';
import { takeFromBasket } from './market.js';
import { addXp } from './skills.js';
import { emit } from './state.js';

function needKey(need) {
  return need.jar ? `jar:${need.kind}` : need.kind;
}

export function needName(need) {
  return need.jar ? PRESERVES.goods[need.kind] : CROPS[need.kind].name;
}

/** How many more of one need the landmark still wants. */
export function needLeft(game, id, need) {
  return Math.max(0, need.qty - (game.donated[id][needKey(need)] ?? 0));
}

/** How many of a need the farmer is carrying (crops in the basket, jars in the pantry). */
export function haveFor(game, need) {
  return need.jar ? game.goods[need.kind] : game.basket[need.kind];
}

export function canDonate(game, id) {
  if (game.restored[id] || !reachable(game, id)) return false;
  return LANDMARKS[id].needs.some((need) => needLeft(game, id, need) > 0 && haveFor(game, need) > 0);
}

/** 0..1: how much of the landmark's needs have been donated. */
export function restoreProgress(game, id) {
  let want = 0;
  let given = 0;
  for (const need of LANDMARKS[id].needs) {
    want += need.qty;
    given += need.qty - needLeft(game, id, need);
  }
  return given / want;
}

export function restoredCount(game) {
  return LANDMARK_ORDER.filter((id) => game.restored[id]).length;
}

/** The bakery sits across the creek, so it can only be reached once the bridge is fixed. */
export function reachable(game, id) {
  return id !== 'bakery' || game.restored.bridge;
}

export function landmarkCentre(id) {
  const p = PLACES[id];
  return { x: (p.c + (p.w ?? 1) / 2) * TILE, y: (p.r + (p.h ?? 1) / 2) * TILE + WORLD_Y };
}

/** Give everything useful the farmer carries toward a landmark; restore it when complete. */
export function donate(game, id) {
  if (game.restored[id]) return false;
  let given = 0;
  for (const need of LANDMARKS[id].needs) {
    const n = Math.min(needLeft(game, id, need), haveFor(game, need));
    if (n <= 0) continue;
    if (need.jar) game.goods[need.kind] -= n;
    else takeFromBasket(game, need.kind, n);
    const key = needKey(need);
    game.donated[id][key] = (game.donated[id][key] ?? 0) + n;
    given += n;
  }
  const at = landmarkCentre(id);
  if (!given) {
    emit(game, 'error', at.x, at.y, `Bring ${LANDMARKS[id].needs.map(needName).join(' or ')}`);
    return false;
  }
  game.stats.donated += given;
  addXp(game, given * SKILLS.xp.donate);
  if (restoreProgress(game, id) >= 1) {
    game.restored[id] = true;
    addXp(game, SKILLS.xp.restore);
    emit(game, 'restored', at.x, at.y, `${LANDMARKS[id].name} restored! ${LANDMARKS[id].unlock}`);
  } else {
    emit(game, 'donate', at.x, at.y, `Donated ${given} to the ${LANDMARKS[id].name}`);
  }
  return true;
}
