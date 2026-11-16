import { places, widgets, travelModes } from './data.js';
import { icon, mapsLogo } from './icons.js';
import { mapMarkup } from './map.js';

const STORAGE_KEY = 'maps-widget-lab-saves-v1';
const initialSaved = { want: ['molly', 'whitewind', 'gogi'], favorites: ['moonbird', 'autumn'] };
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && ['want', 'favorites'].every(key => Array.isArray(saved[key]))) {
      return Object.fromEntries(Object.entries(saved).filter(([key]) => key in initialSaved).map(([key, ids]) => [key, [...new Set(ids.filter(id => places.some(place => place.id === id)))]]));
    }
  } catch { /* Storage is optional; the demo also works in memory. */ }
  return structuredClone(initialSaved);
}
const state = {
  filter: 'all', category: 'coffee', selected: 'molly', mode: 'drive', alternate: false,
  saved: readSaved(), savedTab: 'want', query: '', searchActive: false,
  dialog: null, detailTab: 'overview', zoom: 1,
  navigation: { active: true, place: 'molly', mode: 'drive', step: 0, muted: false, alternate: false },
};
const grid = document.querySelector('#widget-grid');
const dialog = document.querySelector('#widget-dialog');
const dialogContent = document.querySelector('#dialog-content');
let toastTimeout;
let dialogOrigin;
const selectedPlace = () => places.find(place => place.id === state.selected);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const isSaved = id => Object.values(state.saved).some(list => list.includes(id));
const duration = () => selectedPlace().minutes * travelModes[state.mode].multiplier + (state.alternate ? 2 : 0);

function toast(message) {
  const element = document.querySelector('#toast');
  element.innerHTML = `${icon('check')}<span>${escapeHtml(message)}</span>`;
  element.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => element.classList.remove('visible'), 3200);
}
function savePlaces() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved)); }
  catch { toast('Saved for this session. Browser storage is unavailable.'); }
}
function photo(place, className = '') {
  if (place.photo === 'tea') return `<div class="place-photo tea-photo ${className}" role="img" aria-label="MollyTea storefront with a matcha drink"><img src="./assets/mollytea-reference.png" alt="" /></div>`;
  if (place.photo === 'park') return `<div class="place-photo park-photo ${className}" role="img" aria-label="Illustrated green neighborhood park"><span></span><i></i><b></b></div>`;
  return `<div class="place-photo cafe-photo ${place.photo} ${className}" role="img" aria-label="A welcoming café interior"><img src="./assets/coffee.jpg" alt="" /></div>`;
}
function rating(place, full = false) {
  return `<span class="rating">${place.rating} <span class="stars ${full ? 'star-rating' : ''}" style="--rating:${Number(place.rating) * 20}%" role="img" aria-label="out of 5 stars">${full ? '★★★★★' : '★'}</span>${full ? `<span class="review-count">(${place.reviews})</span>` : ''}</span>`;
}
function placeRow(place, { saved = false, subtitle = true } = {}) {
  return `<div class="place-row">${photo(place, 'place-thumb')}<button class="place-row-info" data-action="view-place" data-place="${place.id}"><strong>${place.name}</strong><span>${rating(place)} <span class="dot-separator">·</span> ${place.type}</span>${subtitle ? `<small><span class="open-status">Open</span> <span class="dot-separator">·</span> ${place.distance} away</small>` : ''}</button>${saved ? `<button class="icon-button save-toggle saved" data-action="save" data-place="${place.id}" aria-label="Remove ${place.name} from saved places">${icon('bookmark')}</button>` : `<button class="icon-button row-arrow" data-action="view-place" data-place="${place.id}" aria-label="View ${place.name}">${icon('chevron-right')}</button>`}</div>`;
}
function categoryChips(context = 'explore') {
  return `<div class="category-chips" aria-label="Place category">${[['coffee', 'coffee', 'Coffee & tea'], ['food', 'food', 'Food'], ['parks', 'park', 'Parks']].map(([id, glyph, title]) => `<button class="chip ${state.category === id ? 'selected' : ''}" data-action="category" data-category="${id}" data-context="${context}" aria-pressed="${state.category === id}">${icon(glyph)}${title}</button>`).join('')}</div>`;
}
function searchResults() {
  const query = state.query.trim().toLowerCase();
  const matches = places.filter(place => `${place.name} ${place.type} ${place.address}`.toLowerCase().includes(query)).slice(0, 4);
  return `<p class="search-caption">${query ? `${matches.length} nearby ${matches.length === 1 ? 'match' : 'matches'}` : 'A few places to start'}</p>${matches.length ? matches.map(place => `<button class="search-result" data-action="view-place" data-place="${place.id}"><span class="result-icon">${icon(query ? 'pin' : 'clock')}</span><span><strong>${place.name}</strong><small>${place.type} · ${place.distance}</small></span>${icon('chevron-right')}</button>`).join('') : `<div class="empty-search">${icon('search')}<strong>No places found</strong><span>Try “tea”, “coffee”, “park”, or “sushi”.</span></div>`}`;
}
function searchWidget(expanded = false) {
  return `<div class="search-widget ${expanded ? 'expanded-widget' : ''}">${mapMarkup({ category: state.category, expanded, zoom: state.zoom })}<div class="search-overlay"><form class="search-bar" role="search"><span class="search-map-icon">${icon('pin')}</span><input type="search" name="place-search" autocomplete="off" aria-label="Search demo places" placeholder="Search here" value="${escapeHtml(state.query)}" /><button type="submit" class="icon-button" aria-label="Search places">${icon('search')}</button></form>${categoryChips('search')}<div class="search-results ${state.searchActive || expanded ? 'show' : ''}">${searchResults()}</div></div><div class="map-location-chip">${icon('locate')} Around Doraville</div><button class="recenter-button" data-action="recenter" aria-label="Recenter on your demo location">${icon('locate')}</button></div>`;
}
function exploreWidget(expanded = false) {
  const nearby = places.filter(place => place.category === state.category);
  return `<div class="explore-widget ${expanded ? 'expanded-widget' : ''}"><div class="explore-panel"><div class="widget-content-heading"><div><p class="mini-eyebrow">AROUND DORAVILLE</p><h2>Explore nearby</h2></div><span class="nearby-decoration">${icon('explore')}</span></div>${categoryChips()}<div class="nearby-list">${nearby.slice(0, expanded ? 4 : 2).map(place => placeRow(place)).join('')}</div><button class="text-button explore-more" data-action="${expanded ? 'cycle-category' : 'expand'}" data-widget="explore">${expanded ? 'Discover another category' : `Explore ${nearby.length} places`}${icon('arrow')}</button></div>${expanded ? mapMarkup({ category: state.category, expanded: true, zoom: state.zoom }) : ''}</div>`;
}
function placeWidget(expanded = false) {
  const place = selectedPlace();
  return `<div class="details-widget ${expanded ? 'expanded-widget' : ''}"><div class="details-main"><div class="place-hero">${photo(place)}<span class="photo-category">${icon(place.category === 'parks' ? 'park' : place.category === 'food' ? 'food' : 'coffee')}${place.type}</span><button class="photo-save ${isSaved(place.id) ? 'saved' : ''}" data-action="save" data-place="${place.id}" aria-label="${isSaved(place.id) ? 'Unsave' : 'Save'} ${place.name}" aria-pressed="${isSaved(place.id)}">${icon('bookmark')}</button></div><div class="place-information"><div class="place-title"><h2>${place.name}</h2><span>${place.distance}</span></div><div class="place-rating">${rating(place, true)}<span class="dot-separator">·</span><span class="open-status">Open</span><span class="closing-time"> until ${place.closes}</span></div>${expanded ? `<p class="place-tagline">${place.tagline}</p>` : ''}<div class="place-actions"><button class="primary-button" data-action="directions" data-place="${place.id}">${icon('directions')}Directions</button><button class="secondary-button" data-action="${expanded ? 'save' : 'expand'}" data-widget="place" data-place="${place.id}">${expanded ? icon('bookmark') + (isSaved(place.id) ? 'Saved' : 'Save place') : 'View place' + icon('arrow')}</button></div>${expanded ? detailTabs(place) : ''}</div></div>${expanded ? mapMarkup({ kind: 'detail', place, expanded: true, zoom: state.zoom }) : ''}</div>`;
}
function detailTabs(place) {
  const tabs = ['overview', 'menu', 'reviews'];
  let content;
  if (state.detailTab === 'overview') content = `<div class="detail-fact">${icon('pin')}<span>${place.address}<small>Georgia 30340 · Demo address</small></span></div><div class="detail-fact">${icon('clock')}<span><b class="open-status">Open</b> · Closes ${place.closes}<small>Sample opening hours</small></span></div>`;
  else if (state.detailTab === 'menu') content = place.category === 'parks' ? '<p class="simple-note">Walking paths, picnic spots, and a little fresh air.</p>' : `<div class="menu-items">${(place.category === 'food' ? [['Chef’s special', '$16.00'], ['Lunch set', '$12.50'], ['House iced tea', '$4.50']] : [['Jasmine milk tea', '$6.50'], ['Matcha latte', '$7.00'], ['Freshly brewed coffee', '$4.50']]).map(([name, price]) => `<div><span>${name}</span><strong>${price}</strong></div>`).join('')}<small>Sample menu for this demo</small></div>`;
  else content = `<div class="review"><span class="review-avatar">J</span><div><strong>Jamie L.</strong><span class="stars">★★★★★</span><p>“A lovely little neighborhood find. Definitely coming back.”</p><small>Sample review · 2 weeks ago</small></div></div>`;
  return `<div class="detail-tabs" role="tablist" aria-label="Place information">${tabs.map(tab => `<button role="tab" id="detail-tab-${tab}" aria-selected="${state.detailTab === tab}" aria-controls="detail-tab-content" data-action="detail-tab" data-tab="${tab}">${tab[0].toUpperCase() + tab.slice(1)}</button>`).join('')}</div><div class="detail-tab-content" id="detail-tab-content" role="tabpanel" aria-labelledby="detail-tab-${state.detailTab}">${content}</div>`;
}
function transportTabs() {
  return `<div class="transport-tabs" aria-label="Travel mode">${Object.entries(travelModes).map(([id, mode]) => `<button class="${state.mode === id ? 'active' : ''}" data-action="travel-mode" data-mode="${id}" aria-pressed="${state.mode === id}">${icon(mode.icon)}<span>${mode.label}</span></button>`).join('')}</div>`;
}
function destinationInputs() {
  return `<div class="destination-fields"><div class="journey-line"><span></span><i></i>${icon('pin')}</div><div><div class="origin-field">Your location <span class="location-label">Doraville</span></div><label class="destination-field"><span class="sr-only">Destination</span><select name="destination" aria-label="Destination">${places.map(place => `<option value="${place.id}" ${state.selected === place.id ? 'selected' : ''}>${place.name}</option>`).join('')}</select>${icon('chevron-down')}</label></div></div>`;
}
function directionsWidget(expanded = false) {
  const place = selectedPlace();
  const mode = travelModes[state.mode];
  return `<div class="directions-widget ${expanded ? 'expanded-widget' : ''}"><div class="directions-panel">${transportTabs()}${destinationInputs()}<div class="route-preview"><div><div class="route-duration">${duration()} <span>min</span> <span class="route-distance">${mode.distance}</span></div><p>via ${mode.via}</p><span class="route-traffic"><i></i>${mode.description}</span></div>${expanded ? '' : `<div class="route-mini-map">${mapMarkup({ kind: 'route', place: { ...place, minutes: duration() }, alternate: state.alternate })}</div>`}</div>${expanded ? `<div class="route-options"><button class="route-option ${!state.alternate ? 'selected' : ''}" data-action="route" data-alternate="false"><span class="radio-dot"></span><span><strong>Recommended route</strong><small>via ${mode.via}</small></span><b>${place.minutes * mode.multiplier} min</b></button><button class="route-option ${state.alternate ? 'selected' : ''}" data-action="route" data-alternate="true"><span class="radio-dot"></span><span><strong>A quieter way</strong><small>via Park Avenue</small></span><b>${place.minutes * mode.multiplier + 2} min</b></button></div>` : ''}<div class="directions-footer"><span>Depart now</span><button class="primary-button" data-action="start-navigation">${icon('navigation')}Start</button></div></div>${expanded ? mapMarkup({ kind: 'route', place: { ...place, minutes: duration() }, expanded: true, zoom: state.zoom, alternate: state.alternate }) : ''}</div>`;
}
const steps = [
  { distance: '200 ft', instruction: 'Turn right', street: 'Peachtree Rd', icon: 'turn', remaining: 4 },
  { distance: '0.4 mi', instruction: 'Continue straight', street: 'Peachtree Rd', icon: 'straight', remaining: 3 },
  { distance: '100 ft', instruction: 'Turn right', street: 'New Peachtree Rd', icon: 'turn', remaining: 1 },
  { distance: 'You’re here', instruction: 'You have arrived', street: '', icon: 'pin', remaining: 0 },
];
function navigationWidget(expanded = false) {
  const nav = state.navigation;
  const place = places.find(item => item.id === nav.place);
  const step = steps[nav.step];
  const arrived = nav.step === steps.length - 1;
  const remaining = Math.ceil(place.minutes * travelModes[nav.mode].multiplier * step.remaining / 6);
  return `<div class="navigation-widget ${expanded ? 'expanded-widget' : ''}">${mapMarkup({ kind: 'navigation', place, expanded, zoom: state.zoom, step: nav.step, alternate: nav.alternate })}<div class="nav-instruction ${!nav.active ? 'nav-idle' : ''}"><span class="turn-icon">${icon(nav.active ? step.icon : 'navigation')}</span><div><strong>${nav.active ? step.distance : 'Let’s head out'}</strong><span>${nav.active ? arrived ? place.name : step.street : 'Preview a little journey'}</span></div><button class="nav-sound" data-action="mute" aria-label="${nav.muted ? 'Unmute' : 'Mute'} simulated guidance" aria-pressed="${nav.muted}">${icon(nav.muted ? 'mute' : 'sound')}</button></div><span class="nav-demo-tag">${icon(travelModes[nav.mode].icon)} Demo route</span><div class="navigation-bottom"><button class="nav-end" data-action="${nav.active ? 'end-navigation' : 'start-navigation'}" aria-label="${nav.active ? 'End navigation' : 'Start navigation'}">${icon(nav.active ? 'close' : 'navigation')}</button><div class="arrival-info"><strong>${nav.active ? arrived ? 'Arrived' : `${remaining} min` : 'Ready to go'}</strong><span>${nav.active ? arrived ? 'Enjoy your visit' : `${nav.step === 0 ? '1.1' : nav.step === 1 ? '0.6' : '0.1'} mi · ${place.name}` : place.name}</span></div><button class="next-turn" data-action="${arrived || !nav.active ? 'restart-navigation' : 'next-turn'}" aria-label="${arrived || !nav.active ? 'Replay demo route' : 'Preview next turn'}" title="${arrived ? 'Replay route' : 'Preview next turn'}">${icon(arrived ? 'reset' : 'chevron-right')}</button></div>${expanded ? `<div class="nav-step-list"><p class="mini-eyebrow">YOUR ROUTE · ${nav.muted ? 'GUIDANCE MUTED' : 'SIMULATED GUIDANCE'}</p>${steps.map((item, index) => `<div class="nav-step ${index === nav.step ? 'current' : ''} ${index < nav.step ? 'complete' : ''}">${icon(index < nav.step ? 'check' : item.icon)}<span><strong>${item.instruction}</strong><small>${item.street || place.name}</small></span><span>${item.distance}</span></div>`).join('')}<p class="simple-note">Use the arrow to preview the next turn.</p></div>` : ''}</div>`;
}
function savedWidget(expanded = false) {
  const saved = state.saved[state.savedTab].map(id => places.find(place => place.id === id));
  return `<div class="saved-widget ${expanded ? 'expanded-widget' : ''}"><div class="saved-panel"><div class="widget-content-heading"><div><p class="mini-eyebrow">PLACES WITH A LITTLE PROMISE</p><h2>For another day</h2></div><span class="saved-decoration">${icon('bookmark')}</span></div><div class="saved-tabs" aria-label="Saved lists"><button data-action="saved-tab" data-tab="want" class="${state.savedTab === 'want' ? 'active' : ''}" aria-pressed="${state.savedTab === 'want'}">${icon('bookmark')}Want to go <span>${state.saved.want.length}</span></button><button data-action="saved-tab" data-tab="favorites" class="${state.savedTab === 'favorites' ? 'active' : ''}" aria-pressed="${state.savedTab === 'favorites'}">${icon('heart')}Favorites <span>${state.saved.favorites.length}</span></button></div><div class="saved-place-list">${saved.length ? saved.slice(0, expanded ? 20 : 2).map(place => placeRow(place, { saved: true, subtitle: false })).join('') : `<div class="saved-empty">${icon('bookmark')}<strong>Your next favorite is out there.</strong><span>Save a place to keep it here.</span><button class="text-button" data-action="expand" data-widget="explore">Find a place ${icon('arrow')}</button></div>`}</div>${saved.length ? `<button class="text-button saved-more" data-action="expand" data-widget="${expanded ? 'explore' : 'saved'}">${expanded ? 'Find somewhere new' : `See ${saved.length === 1 ? 'your saved place' : `all ${saved.length} places`}`}${icon('arrow')}</button>` : ''}</div>${expanded ? mapMarkup({ kind: 'saved', expanded: true, zoom: state.zoom, markerIds: state.saved[state.savedTab] }) : ''}</div>`;
}
const renderers = { search: searchWidget, explore: exploreWidget, place: placeWidget, directions: directionsWidget, navigation: navigationWidget, saved: savedWidget };
function renderGrid() {
  grid.innerHTML = widgets.filter(widget => state.filter === 'all' || widget.group === state.filter).map(widget => `<article class="widget-item" data-widget-id="${widget.id}"><div class="widget-label"><div><span class="widget-number">${widget.number}</span><h2>${widget.title}</h2></div><button class="expand-button" data-action="expand" data-widget="${widget.id}" aria-label="Expand ${widget.title}" title="Expand ${widget.title}">${icon('expand')}</button></div><div class="widget-card ${widget.id}-card">${renderers[widget.id]()}</div><p class="widget-caption">${widget.subtitle}</p></article>`).join('');
}
function renderDialog() {
  if (!state.dialog) return;
  const widget = widgets.find(item => item.id === state.dialog);
  dialogContent.innerHTML = `<div class="dialog-header"><div class="dialog-heading-icon">${icon(widget.icon)}</div><div><p class="mini-eyebrow">A LITTLE MORE ROOM</p><h2 id="dialog-title">${widget.title}</h2></div><button class="dialog-close" data-action="close-dialog" aria-label="Collapse ${widget.title}"><span>Back to widgets</span>${icon('close')}</button></div><div class="dialog-body dialog-${widget.id}">${renderers[widget.id](true)}</div>`;
}
function render() {
  const focused = document.activeElement;
  const data = focused?.dataset ? { ...focused.dataset } : {};
  const inDialog = dialog.contains(focused);
  renderGrid();
  renderDialog();
  if (data.action) {
    const candidates = (inDialog ? dialog : grid).querySelectorAll('[data-action]');
    [...candidates].find(element => Object.entries(data).every(([key, value]) => element.dataset[key] === value))?.focus({ preventScroll: true });
  }
}
function openWidget(id) {
  if (!renderers[id]) return;
  if (!dialog.open) dialogOrigin = document.activeElement;
  state.dialog = id;
  state.zoom = 1;
  renderDialog();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.querySelector('.dialog-close').focus();
}
function closeWidget() {
  const id = state.dialog;
  state.dialog = null;
  dialog.close();
  document.body.classList.remove('dialog-open');
  if (dialogOrigin?.isConnected) dialogOrigin.focus({ preventScroll: true });
  else grid.querySelector(`[data-widget-id="${id}"] .expand-button`)?.focus({ preventScroll: true });
}
function startNavigation(restart = false) {
  state.navigation = { active: true, place: restart ? state.navigation.place : state.selected, mode: restart ? state.navigation.mode : state.mode, step: 0, muted: state.navigation.muted, alternate: restart ? state.navigation.alternate : state.alternate };
  render();
  openWidget('navigation');
  toast('Demo route started. Use the arrow to preview each turn.');
}

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    state.filter = filter.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle('active', button === filter);
      button.setAttribute('aria-pressed', String(button === filter));
    });
    renderGrid();
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, place, widget, category, context, mode, tab, alternate } = target.dataset;
  switch (action) {
    case 'expand': openWidget(widget); break;
    case 'close-dialog': closeWidget(); break;
    case 'view-place':
      state.selected = place; state.detailTab = 'overview'; state.searchActive = false;
      render(); openWidget('place'); break;
    case 'category':
      state.category = category; state.searchActive = false;
      if (context === 'search') { state.query = ''; render(); openWidget('explore'); }
      else render();
      break;
    case 'cycle-category': state.category = ['coffee', 'food', 'parks'][(['coffee', 'food', 'parks'].indexOf(state.category) + 1) % 3]; render(); break;
    case 'save': {
      if (isSaved(place)) {
        for (const key of Object.keys(state.saved)) state.saved[key] = state.saved[key].filter(id => id !== place);
        toast('Removed from your saved places');
      } else { state.saved.want.push(place); toast('Saved to Want to go'); }
      savePlaces(); render(); break;
    }
    case 'directions': state.selected = place; state.alternate = false; render(); openWidget('directions'); break;
    case 'travel-mode': state.mode = mode; state.alternate = false; render(); break;
    case 'route': state.alternate = alternate === 'true'; render(); break;
    case 'detail-tab': state.detailTab = tab; renderDialog(); dialog.querySelector(`[data-tab="${tab}"]`).focus(); break;
    case 'saved-tab': state.savedTab = tab; render(); break;
    case 'start-navigation': startNavigation(); break;
    case 'restart-navigation': startNavigation(true); break;
    case 'next-turn': state.navigation.step = Math.min(state.navigation.step + 1, steps.length - 1); render(); if (state.navigation.step === 3) toast(`You’ve arrived at ${places.find(item => item.id === state.navigation.place).name}`); break;
    case 'end-navigation': state.navigation.active = false; render(); toast('Demo navigation ended'); break;
    case 'mute': state.navigation.muted = !state.navigation.muted; render(); toast(state.navigation.muted ? 'Demo guidance muted' : 'Demo guidance unmuted'); break;
    case 'recenter': state.zoom = 1; state.searchActive = false; state.query = ''; render(); toast('Centered on your demo location in Doraville'); break;
    case 'zoom-in': state.zoom = Math.min(1.8, state.zoom + 0.2); renderDialog(); break;
    case 'zoom-out': state.zoom = Math.max(1, state.zoom - 0.2); renderDialog(); break;
    case 'reset':
      Object.assign(state, { category: 'coffee', selected: 'molly', mode: 'drive', alternate: false, saved: structuredClone(initialSaved), savedTab: 'want', query: '', searchActive: false, detailTab: 'overview', zoom: 1, filter: 'all', navigation: { active: true, place: 'molly', mode: 'drive', step: 0, muted: false, alternate: false } });
      document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === 'all'; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
      savePlaces(); render(); toast('Fresh start. Your demo is reset.'); break;
  }
});
function updateSearch(input) {
  state.query = input.value;
  state.searchActive = true;
  const results = input.closest('.search-overlay').querySelector('.search-results');
  results.innerHTML = searchResults();
  results.classList.add('show');
}
document.addEventListener('input', event => { if (event.target.matches('[name="place-search"]')) updateSearch(event.target); });
document.addEventListener('focusin', event => { if (event.target.matches('[name="place-search"]')) updateSearch(event.target); });
document.addEventListener('submit', event => {
  if (!event.target.matches('.search-bar')) return;
  event.preventDefault();
  updateSearch(event.target.querySelector('input'));
  event.target.closest('.search-overlay').querySelector('.search-result')?.focus();
});
document.addEventListener('change', event => {
  if (event.target.matches('[name="destination"]')) { state.selected = event.target.value; state.alternate = false; render(); (dialog.open ? dialog : grid).querySelector('[name="destination"]')?.focus(); }
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.search-overlay') && state.searchActive) {
    state.searchActive = false;
    document.querySelectorAll('.search-card .search-results').forEach(element => element.classList.remove('show'));
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.open) { state.searchActive = false; document.querySelectorAll('.search-results').forEach(element => element.classList.remove('show')); }
  if (event.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    const tabs = [...event.target.parentElement.querySelectorAll('[role="tab"]')];
    tabs[(tabs.indexOf(event.target) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].click();
  }
});
dialog.addEventListener('cancel', event => { event.preventDefault(); closeWidget(); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeWidget(); } });
document.querySelector('#brand-mark').innerHTML = mapsLogo();
document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
renderGrid();
