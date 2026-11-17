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
        floatText(fx, e.x, e.y - 20, e.text);
        play('harvest');
        break;
      case 'perfect':
        burst(fx, e.x, e.y, 'star', 12);
        floatText(fx, e.x, e.y - 20, e.text, '#ffe066');
        play('perfect');
        break;
      case 'combo':
        floatText(fx, e.x, e.y, e.text, '#ffb347');
        play('combo');
        break;
      case 'golden':
        burst(fx, e.x, e.y, 'coin', 14);
        burst(fx, e.x, e.y, 'star', 16);
        toast(fx, e.text, 'gold');
        play('golden');
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
