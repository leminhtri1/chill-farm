// The villagers: Granny Fern, Baker Bo and Little Pip post orders, take a gift a day, and grow fond
// of the farmer. Hearts come from liked gifts and filled orders; each heart makes that villager's
// orders pay a little more, and a best friend sends a hamper.
import { CROPS, FRIENDS, PRESERVES, SKILLS, VILLAGER_ORDER, VILLAGERS } from './config.js';
import { earn, takeFromBasket } from './market.js';
import { addXp, hasPerk } from './skills.js';
import { emit, tileCenter } from './state.js';

/** Where a villager stands today: Bo moves into the bakery once it reopens. */
export function villagerSpot(game, id) {
  if (id === 'bo' && game.restored.bakery) return { c: 17, r: 6 };
  return VILLAGERS[id].spot;
}

export function villagerAt(game, c, r) {
  return VILLAGER_ORDER.find((id) => {
    const spot = villagerSpot(game, id);
    return spot.c === c && spot.r === r;
  }) ?? null;
}

export function totalHearts(game) {
  return VILLAGER_ORDER.reduce((sum, id) => sum + game.friends[id].hearts, 0);
}

/** A villager's orders pay more the fonder they are of the farmer. */
export function friendPay(game, id, base) {
  const hearts = id ? game.friends[id].hearts : 0;
  return Math.round(base * (1 + hearts * FRIENDS.orderBonus));
}

export function addHearts(game, id, n) {
  const friend = game.friends[id];
  const before = friend.hearts;
  friend.hearts = Math.min(FRIENDS.maxHearts, friend.hearts + n);
  if (friend.hearts === before) return;
  const spot = villagerSpot(game, id);
  const at = tileCenter(spot.c, spot.r);
  emit(game, 'heart', at.x, at.y - 30, `${VILLAGERS[id].name} ${'♥'.repeat(friend.hearts)}`);
  if (friend.hearts >= FRIENDS.maxHearts && !friend.hamper) {
    friend.hamper = true;
    earn(game, FRIENDS.hamper);
    emit(game, 'hamper', at.x, at.y, `Best friends! ${VILLAGERS[id].name} sends a hamper: +${FRIENDS.hamper}`);
  }
}

/** A filled order: every second one from the same villager earns a heart. */
export function orderFilled(game, id) {
  const friend = game.friends[id];
  friend.orders = (friend.orders ?? 0) + 1;
  if (friend.orders % 2 === 0) addHearts(game, id, FRIENDS.order);
}

/** The liked things a villager would take as a gift: each liked crop, and its jar. */
export function giftOptions(game, id) {
  const extra = hasPerk(game, 'sweet') ? 1 : 0;
  const options = [];
  for (const kind of VILLAGERS[id].likes) {
    options.push({ kind, jar: false, hearts: FRIENDS.crop + extra, have: game.basket[kind] });
    options.push({ kind, jar: true, hearts: FRIENDS.jar + extra, have: game.goods[kind] });
  }
  return options;
}

export function giftName(option) {
  return option.jar ? PRESERVES.goods[option.kind] : CROPS[option.kind].name;
}

export function giveGift(game, id, option) {
  const friend = game.friends[id];
  if (friend.gifted) {
    emit(game, 'error', 0, 0, `${VILLAGERS[id].name} already had a gift today`);
    return false;
  }
  if (option.jar ? game.goods[option.kind] <= 0 : game.basket[option.kind] <= 0) {
    emit(game, 'error', 0, 0, `You have no ${giftName(option)}`);
    return false;
  }
  if (option.jar) game.goods[option.kind] -= 1;
  else takeFromBasket(game, option.kind, 1);
  friend.gifted = true;
  game.stats.gifts += 1;
  addXp(game, SKILLS.xp.gift);
  emit(game, 'gift', 0, 0, `${VILLAGERS[id].name} loves the ${giftName(option)}!`);
  addHearts(game, id, option.hearts);
  return true;
}

/** A new morning: everyone can take a gift again. */
export function newDayFriends(game) {
  for (const id of VILLAGER_ORDER) game.friends[id].gifted = false;
}
