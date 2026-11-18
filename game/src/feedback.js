// Turns what happened in the rules (game.events) into sounds, particles, floating text and toasts.
import { play } from './audio.js';
import { burst, floatText, toast } from './particles.js';
import { PLACES, TILE, WORLD_Y } from './config.js';

const STALL = { x: (PLACES.stall.c + 1.5) * TILE, y: PLACES.stall.r * TILE + WORLD_Y + 60 };

export function applyEvents(game, fx) {
  for (const e of game.events) {
    switch (e.kind) {
      case 'till':
        burst(fx, e.x, e.y + 8, 'soil', 10);
        play('till');
        break;
      case 'plant':
        burst(fx, e.x, e.y + 8, 'leaf', 6);
        play('plant');
        break;
      case 'water':
        burst(fx, e.x, e.y, 'water', 12);
        play('water');
        break;
      case 'harvest':
        burst(fx, e.x, e.y, 'leaf', 8);
        burst(fx, e.x, e.y, 'star', 4);
        if (game.combo.count < 3) floatText(fx, e.x, e.y - 20, e.text);
        play('harvest');
        break;
      case 'perfect':
        burst(fx, e.x, e.y, 'star', 12);
        // during a combo run the big badge does the talking, so the field stays readable
        if (game.combo.count < 3) floatText(fx, e.x, e.y - 20, e.text, '#ffe066');
        play('perfect');
        break;
      case 'combo':
        // the big combo badge over the farmer shows the count, so no extra floating text here
        play('combo');
        break;
      case 'golden':
        burst(fx, e.x, e.y, 'coin', 14);
        burst(fx, e.x, e.y, 'star', 16);
        toast(fx, e.text, 'gold');
        play('golden');
        break;
      case 'ripe-golden':
        burst(fx, e.x, e.y - 6, 'star', 14);
        floatText(fx, e.x, e.y - 30, 'Golden!', '#ffe066');
        play('ripe');
        break;
      case 'ripe':
        burst(fx, e.x, e.y - 6, 'star', 5);
        play('ripe');
        break;
      case 'refill':
        burst(fx, e.x, e.y, 'water', 16);
        floatText(fx, e.x, e.y - 24, e.text, '#bfe6ff');
        play('refill');
        break;
      case 'note':
        floatText(fx, e.x, e.y - 24, e.text);
        play('note');
        break;
      case 'error':
        toast(fx, e.text, 'bad');
        play('error');
        break;
      case 'sell':
        burst(fx, STALL.x, STALL.y, 'coin', 18);
        toast(fx, `Sold! ${e.text}`, 'good');
        play('sell');
        break;
      case 'buy':
        toast(fx, e.text, 'info');
        play('buy');
        break;
      case 'upgrade':
        toast(fx, e.text, 'good');
        play('upgrade');
        break;
      case 'order':
        toast(fx, e.text, 'gold');
        play('order');
        break;
      case 'caw':
        play('caw');
        break;
      case 'shoo':
        burst(fx, e.x, e.y, 'feather', 8);
        floatText(fx, e.x, e.y - 20, e.text, '#ffe066');
        play('shoo');
        break;
      case 'eaten':
        burst(fx, e.x, e.y, 'feather', 6);
        toast(fx, e.text, 'bad');
        play('eaten');
        break;
      case 'place':
        toast(fx, e.text, 'info');
        play('place');
        break;
      case 'sprinkle':
        burst(fx, e.x, e.y - 6, 'water', 10);
        play('sprinkle');
        break;
      case 'daily':
        burst(fx, e.x, e.y, 'star', 24);
        toast(fx, e.text, 'good');
        play('daily');
        break;
      case 'rush':
        toast(fx, e.text, 'gold');
        play('rush');
        break;
      case 'rush-missed':
        toast(fx, e.text, 'bad');
        play('error');
        break;
      case 'cook':
        burst(fx, e.x, e.y, 'star', 8);
        toast(fx, e.text, 'info');
        play('buy');
        break;
      case 'jars':
        burst(fx, e.x, e.y, 'star', 14);
        floatText(fx, e.x, e.y - 30, e.text, '#ffe066');
        play('ripe');
        break;
      case 'donate':
        burst(fx, e.x, e.y, 'star', 10);
        toast(fx, e.text, 'good');
        play('order');
        break;
      case 'restored':
        burst(fx, e.x, e.y, 'star', 40);
        burst(fx, e.x, e.y, 'coin', 12);
        toast(fx, e.text, 'gold');
        play('goal');
        break;
      case 'gift':
        toast(fx, e.text, 'good');
        play('order');
        break;
      case 'heart':
        burst(fx, e.x, e.y, 'heart', 10);
        floatText(fx, e.x, e.y - 10, e.text, '#ff8fa8');
        play('combo');
        break;
      case 'hamper':
        burst(fx, e.x, e.y, 'coin', 16);
        toast(fx, e.text, 'gold');
        play('golden');
        break;
      case 'levelup':
        burst(fx, e.x, e.y, 'star', 30);
        play('daily');
        break;
      case 'perk':
        toast(fx, e.text, 'gold');
        play('upgrade');
        break;
      case 'late':
        toast(fx, e.text, 'gold');
        play('late');
        break;
      case 'goal':
        burst(fx, e.x, e.y, 'star', 40);
        toast(fx, 'Festival goal reached! Blue ribbon is yours. Go for gold!', 'gold');
        play('goal');
        break;
      default:
        break;
    }
  }
  game.events.length = 0;
}
