// Input while a panel is open (market, order board, help, pause), and what its buttons lead to.
import { app } from './app.js';
import { isMuted, play, toggleMute } from './audio.js';
import { clickPanel, keyPanel, openPanel } from './panels.js';
import { toast } from './particles.js';
import { goToTitle } from './season-flow.js';

export function handlePanelInput(presses, clicks) {
  for (const key of presses) {
    if ((key === 'h' || key === 'H') && app.ui.kind === 'help') return closePanel();
    if ((key === 'p' || key === 'P') && app.ui.kind === 'pause') return closePanel();
    react(keyPanel(app.game, app.ui, key));
    if (!app.ui) return;
  }
  for (const click of clicks) {
    react(clickPanel(app.game, app.ui, click.x, click.y));
    if (!app.ui) return;
  }
}

function react(result) {
  if (!result) return;
  if (result === 'close') return closePanel();
  if (result === 'help') {
    app.ui = openPanel('help');
    return;
  }
  if (result === 'mute') {
    toggleMute();
    toast(app.fx, isMuted() ? 'Sound off' : 'Sound on', 'info');
    return;
  }
  if (result === 'quit') {
    goToTitle();
    return;
  }
  if (result === 'move' || result === 'tab') play('click');
  if (result === 'disabled') play('error');
}

export function closePanel() {
  app.ui = null;
  play('click');
}
