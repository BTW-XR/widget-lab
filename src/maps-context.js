import { places } from './data.js';
import { createMapViews } from './maps-views.js';

const STORAGE_KEY = 'maps-widget-lab-saves-v1';
const initialSaved = { want: ['molly', 'whitewind', 'gogi'], favorites: ['moonbird', 'autumn'] };
export function createMapContext(effects, demo = false) {
  const fresh = () => ({ category: 'coffee', selected: 'molly', mode: 'drive', alternate: false,
    saved: structuredClone(initialSaved), savedTab: 'want', query: '', searchActive: false,
    detailTab: 'overview', zoom: 1,
    navigation: { active: true, place: 'molly', mode: 'drive', step: 0, muted: false, alternate: false } });
  const state = fresh();
  if (!demo) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && ['want', 'favorites'].every(key => Array.isArray(saved[key]))) {
        state.saved = Object.fromEntries(['want', 'favorites'].map(key => [key, [...new Set(saved[key].filter(id => places.some(place => place.id === id)))]]));
      }
    } catch { /* Storage is optional. */ }
  }
  const views = createMapViews(state);
  function persist() {
    if (demo) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved)); }
    catch { effects.toast('Saved for this session. Browser storage is unavailable.'); }
  }
  function navigate(restart) {
    const previous = state.navigation;
    state.navigation = { active: true, place: restart ? previous.place : state.selected,
      mode: restart ? previous.mode : state.mode, alternate: restart ? previous.alternate : state.alternate,
      step: 0, muted: previous.muted };
    effects.render();
    // In the overview, replaying a route stays inside its own card.
    if (effects.canOpen()) effects.open('navigation');
  }
  function act(action, data) {
    const { place, category, context, mode, tab, alternate } = data;
    switch (action) {
      case 'view-place': state.selected = place; state.detailTab = 'overview'; state.searchActive = false; effects.render(); effects.open('place'); return;
      case 'category': state.category = category; state.searchActive = false; if (context === 'search') { state.query = ''; effects.render(); effects.open('explore'); return; } break;
      case 'cycle-category': state.category = ['coffee', 'food', 'parks'][(['coffee', 'food', 'parks'].indexOf(state.category) + 1) % 3]; break;
      case 'save': {
        const saved = Object.values(state.saved).some(list => list.includes(place));
        if (saved) for (const key of Object.keys(state.saved)) state.saved[key] = state.saved[key].filter(id => id !== place);
        else state.saved.want.push(place);
        persist(); effects.toast(saved ? 'Removed from your saved places' : 'Saved to Want to go'); break;
      }
      case 'directions': state.selected = place; state.alternate = false; effects.render(); effects.open('directions'); return;
      case 'travel-mode': state.mode = mode; state.alternate = false; break;
      case 'route': state.alternate = alternate === 'true'; break;
      case 'detail-tab': state.detailTab = tab; effects.render(['place']); return;
      case 'saved-tab': state.savedTab = tab; break;
      case 'start-navigation': navigate(false); return;
      case 'restart-navigation': navigate(true); return;
      case 'next-turn': state.navigation.step = Math.min(state.navigation.step + 1, 3); break;
      case 'end-navigation': state.navigation.active = false; break;
      case 'mute': state.navigation.muted = !state.navigation.muted; break;
      case 'recenter': state.zoom = 1; state.searchActive = false; state.query = ''; break;
      case 'zoom-in': state.zoom = Math.min(1.8, state.zoom + .2); break;
      case 'zoom-out': state.zoom = Math.max(1, state.zoom - .2); break;
      default: return;
    }
    effects.render();
  }
  function input(target) {
    if (target.name === 'place-search') {
      state.query = target.value; state.searchActive = true;
      effects.roots().forEach(root => root.querySelectorAll('.search-overlay').forEach(overlay => {
        const other = overlay.querySelector('input');
        if (other !== target) other.value = state.query;
        const results = overlay.querySelector('.search-results');
        results.innerHTML = views.searchResults(); results.classList.add('show');
      }));
    }
    if (target.name === 'destination') { state.selected = target.value; state.alternate = false; effects.render(); }
  }
  function dismissSearch() {
    state.searchActive = false;
    effects.roots().forEach(root => root.querySelectorAll('.search-card .search-results').forEach(element => element.classList.remove('show')));
  }
  return { state, render: views.render, act, input, dismissSearch,
    reset(persistChanges = false) { Object.assign(state, fresh()); if (persistChanges) persist(); },
  };
}
