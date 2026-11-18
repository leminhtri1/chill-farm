// The village order board: neighbours ask for crops and pay well for them, for a few days only.
import { CROPS, ORDERS, SKILLS, VILLAGER_ORDER, VILLAGERS } from './config.js';
import { seedAvailable, takeFromBasket, earn } from './market.js';
import { addXp } from './skills.js';
import { emit } from './state.js';
import { friendPay, orderFilled } from './villagers.js';


/** One new order, sized to the day: early days ask for a few cheap crops, later ones for more. */
export function makeOrder(game) {
  const kinds = Object.keys(CROPS).filter((kind) => seedAvailable(game, kind));
  // ask for something not already on the board when the market has it
  const fresh = kinds.filter((k) => !game.orders.some((order) => order.kind === k));
  const kind = game.rng.pick(fresh.length ? fresh : kinds);
  const price = CROPS[kind].price;
  const want = Math.max(1, Math.round((game.rng.range(60, 110) + game.day * 22) / price));
  const qty = Math.min(want, price > 150 ? 3 : 10);
  const friend = game.rng.pick(VILLAGER_ORDER);
  return {
    kind,
    qty,
    reward: Math.round(qty * price * ORDERS.markup + ORDERS.tip + game.day * 5),
    days: ORDERS.days,
    friend,
    from: VILLAGERS[friend].name,
  };
}

export function refillOrders(game) {
  while (game.orders.length < ORDERS.slots) game.orders.push(makeOrder(game));
}

/** A new morning: orders age, and any past their days leave the board. */
export function ageOrders(game) {
  for (const order of game.orders) order.days -= 1;
  game.orders = game.orders.filter((order) => order.days > 0);
  refillOrders(game);
}

/** What an order pays today: its reward, plus a little for each heart of friendship. */
export function orderPay(game, order) {
  return friendPay(game, order.friend, order.reward);
}

export function canFill(game, order) {
  return game.basket[order.kind] >= order.qty;
}

export function fillOrder(game, index) {
  const order = game.orders[index];
  if (!order) return false;
  if (!canFill(game, order)) {
    emit(game, 'error', 0, 0, `Need ${order.qty} ${CROPS[order.kind].name}`);
    return false;
  }
  takeFromBasket(game, order.kind, order.qty);
  const pay = orderPay(game, order);
  earn(game, pay);
  game.stats.orders += 1;
  game.orders.splice(index, 1);
  addXp(game, SKILLS.xp.order);
  emit(game, 'order', 0, 0, `${order.from} paid ${pay} coins!`);
  if (order.friend) orderFilled(game, order.friend);
  return true;
}
