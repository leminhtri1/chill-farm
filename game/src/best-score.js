// The best Harvest Festival score, kept in the browser between visits when storage allows it.
const KEY = 'chill-farm-best';

export function loadBest() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    // private windows may refuse storage; the best score then lasts this visit only
  }
}
