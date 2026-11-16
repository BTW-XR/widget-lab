import { videos, channels, widgets, shorts, getVideo } from './data.js';
import { icon } from './icons.js';
import { renderWidget, searchOutput, escapeHtml, upNext } from './views.js';
import { createMediaController } from './media.js';

const STORAGE_KEY = 'youtube-widget-lab-v1';
const defaults = { later: ['architecture', 'ocean', 'space'], subscriptions: ['elsewhere', 'form'], likes: [], notifications: [] };
function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Object.keys(defaults).every(key => Array.isArray(stored[key]))) {
      return Object.fromEntries(Object.keys(defaults).map(key => [key, [...new Set(stored[key])].filter(id => (key === 'subscriptions' || key === 'notifications' ? channels : videos).some(item => item.id === id))]));
    }
  } catch { /* Storage is optional; keep the demo usable in memory. */ }
  return structuredClone(defaults);
}
const state = { ...loadPreferences(), filter: 'all', topic: 'All', featured: 1, query: '', selected: 'kyoto', shortIndex: 0, channel: 'all', dialog: null, speed: 1, progress: {}, queueActive: false };
const grid = document.querySelector('#youtube-grid');
const dialog = document.querySelector('#youtube-dialog');
const dialogContent = document.querySelector('#yt-dialog-content');
let dialogOrigin;
let toastTimeout;

function toast(message) {
  // A toast inside the dialog stays above the native modal's top layer.
  let element = dialog.open ? dialog.querySelector('.yt-dialog-toast') : document.querySelector('#yt-toast');
  if (!element && dialog.open) { element = document.createElement('div'); element.className = 'yt-toast yt-dialog-toast'; element.setAttribute('role', 'status'); dialog.append(element); }
  element.innerHTML = `${icon('check')}<span>${escapeHtml(message)}</span>`;
  element.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => document.querySelectorAll('.yt-toast').forEach(item => item.classList.remove('visible')), 2800);
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(Object.keys(defaults).map(key => [key, state[key]])))); }
  catch { toast('Kept for this session. Browser storage is unavailable.'); }
}
const media = createMediaController(state, {
  onError: toast,
  onEnded(id) {
    if (!state.queueActive) return;
    const index = state.later.indexOf(id);
    if (index !== -1 && index < state.later.length - 1) watch(state.later[index + 1], true);
    else { state.queueActive = false; toast('All caught up. That’s the end of your list.'); }
  },
});
function renderGrid() {
  media.pauseAll();
  grid.innerHTML = widgets.filter(widget => state.filter === 'all' || state.filter === widget.group).map(widget => `<article class="widget-item" data-widget-id="${widget.id}"><div class="widget-label"><div><span class="widget-number">${widget.number}</span><h2>${widget.title}</h2></div><button class="expand-button" data-action="expand" data-widget="${widget.id}" aria-label="Expand ${widget.title}" title="Expand ${widget.title}">${icon('expand')}</button></div><div class="widget-card yt-card yt-${widget.id}-card">${renderWidget(widget.id, state)}</div><p class="widget-caption">${widget.caption}</p></article>`).join('');
  media.bind(grid);
}
function renderCard(id) {
  const card = grid.querySelector(`[data-widget-id="${id}"] .widget-card`);
  if (card) { card.querySelectorAll('video').forEach(video => video.pause()); card.innerHTML = renderWidget(id, state); media.bind(card); }
}
function renderDialog() {
  const widget = widgets.find(item => item.id === state.dialog);
  if (!widget) return;
  dialogContent.querySelectorAll('video').forEach(video => video.pause());
  dialogContent.innerHTML = `<div class="dialog-header"><div class="dialog-heading-icon">${icon(widget.icon)}</div><div><p class="mini-eyebrow">A LITTLE MORE ROOM</p><h2 id="yt-dialog-title">${widget.title}</h2></div><button class="dialog-close" data-action="close-dialog" aria-label="Collapse ${widget.title}"><span>Back to widgets</span>${icon('close')}</button></div><div class="yt-dialog-body yt-dialog-${widget.id}">${renderWidget(widget.id, state, true)}</div>`;
  dialog.dataset.widget = widget.id;
  media.bind(dialog);
}
function openWidget(id) {
  if (!widgets.some(widget => widget.id === id)) return;
  const wasPlaying = (id === 'player' || id === 'shorts') && [...document.querySelectorAll(`[data-widget-id="${id}"] video`)].some(video => !video.paused);
  if (!dialog.open) dialogOrigin = document.activeElement;
  media.pauseAll();
  state.dialog = id;
  renderDialog();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.querySelector('.dialog-close').focus();
  if (wasPlaying) void media.play(dialog.querySelector('video'));
}
function closeWidget() {
  const previous = state.dialog;
  media.pauseAll();
  state.dialog = null;
  dialog.close();
  document.body.classList.remove('dialog-open');
  document.querySelectorAll('.yt-dialog-toast').forEach(element => element.remove());
  if (previous === 'player' || previous === 'shorts') renderCard(previous);
  if (dialogOrigin?.isConnected) dialogOrigin.focus({ preventScroll: true });
  else grid.querySelector(`[data-widget-id="${previous}"] .expand-button`)?.focus({ preventScroll: true });
}
function watch(id, queue = false) {
  media.pauseAll();
  state.selected = id;
  state.queueActive = queue;
  renderCard('player');
  openWidget('player');
  void media.play(dialog.querySelector('video'));
}
function updateActionButtons() {
  document.querySelectorAll('[data-save-id]').forEach(button => {
    const saved = state.later.includes(button.dataset.saveId);
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remove from Watch later' : 'Save to Watch later'}: ${getVideo(button.dataset.saveId).title}`);
    button.innerHTML = `${icon(saved ? 'check' : 'clock')}${button.classList.contains('yt-icon-save') ? '' : `<span>${saved ? 'Saved' : 'Watch later'}</span>`}`;
  });
  document.querySelectorAll('[data-short-save]').forEach(button => {
    const saved = state.later.includes(button.dataset.shortSave);
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remove Short from' : 'Save Short to'} Watch later`);
    button.innerHTML = `${icon(saved ? 'check' : 'plus')}<span>${saved ? 'Saved' : 'Save'}</span>`;
  });
  document.querySelectorAll('[data-like-id]').forEach(button => { const liked = state.likes.includes(button.dataset.likeId); button.classList.toggle('is-liked', liked); button.setAttribute('aria-pressed', String(liked)); });
  document.querySelectorAll('[data-subscribe-id]').forEach(button => {
    const subscribed = state.subscriptions.includes(button.dataset.subscribeId);
    button.classList.toggle('subscribed', subscribed);
    button.setAttribute('aria-pressed', String(subscribed));
    button.innerHTML = `${subscribed ? icon('check') : ''}<span>${subscribed ? 'Subscribed' : 'Subscribe'}</span>`;
  });
}
function toggleList(key, id) { const index = state[key].indexOf(id); if (index === -1) state[key].push(id); else state[key].splice(index, 1); persist(); }
function updateSearch(input) {
  state.query = input.value;
  document.querySelectorAll('.yt-search').forEach(root => {
    const otherInput = root.querySelector('input');
    if (otherInput !== input) otherInput.value = state.query;
    root.querySelector('.yt-search-output').innerHTML = searchOutput(state, root.classList.contains('yt-expanded'));
  });
}
function changeShort(direction) {
  media.pauseAll();
  state.shortIndex = (state.shortIndex + direction + shorts.length) % shorts.length;
  state.progress[shorts[state.shortIndex]] = 0;
  renderCard('shorts');
  if (state.dialog === 'shorts') renderDialog();
  const scope = state.dialog === 'shorts' ? dialog : grid.querySelector('[data-widget-id="shorts"]');
  if (scope) { void media.play(scope.querySelector('video')); scope.querySelector('[data-action="next-short"]')?.focus({ preventScroll: true }); }
}
function reset() {
  media.pauseAll();
  Object.assign(state, structuredClone(defaults), { filter: 'all', topic: 'All', featured: 1, query: '', selected: 'kyoto', shortIndex: 0, channel: 'all', speed: 1, progress: {}, queueActive: false });
  document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === 'all'; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  persist(); renderGrid(); toast('A fresh start. Your YouTube demo is reset.');
}

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    state.filter = filter.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => { button.classList.toggle('active', button === filter); button.setAttribute('aria-pressed', String(button === filter)); });
    renderGrid();
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, video, widget, topic, channel, query } = target.dataset;
  switch (action) {
    case 'expand': openWidget(widget); break;
    case 'close-dialog': closeWidget(); break;
    case 'watch': watch(video, state.queueActive && !!target.closest('.yt-up-next')); break;
    case 'toggle-play': media.toggle(target.closest('.yt-media')); break;
    case 'speed': media.speed(target.closest('.yt-media')); break;
    case 'fullscreen': void media.fullscreen(target.closest('.yt-media')); break;
    case 'retry-media': { const root = target.closest('.yt-media'); root.querySelector('.yt-media-error').hidden = true; root.querySelector('video').load(); void media.play(root.querySelector('video')); break; }
    case 'topic':
      state.topic = topic; state.featured = 0; renderCard('discover');
      if (state.dialog === 'discover') renderDialog();
      (dialog.open ? dialog : grid).querySelector(`[data-topic="${topic}"]`)?.focus({ preventScroll: true }); break;
    case 'another-video': state.featured += 1; renderCard('discover'); grid.querySelector('[data-action="another-video"]')?.focus({ preventScroll: true }); break;
    case 'search-term': { const root = target.closest('.yt-search'); const input = root.querySelector('input'); input.value = query; updateSearch(input); input.focus(); break; }
    case 'clear-search': { const input = target.closest('.yt-search').querySelector('input'); input.value = ''; updateSearch(input); input.focus(); break; }
    case 'save': {
      toggleList('later', video); updateActionButtons(); renderCard('later');
      if (state.dialog === 'player') dialog.querySelector('.yt-up-next').outerHTML = upNext(state);
      if (state.dialog === 'later') { renderDialog(); dialog.querySelector('.yt-remove, .dialog-close')?.focus({ preventScroll: true }); }
      toast(state.later.includes(video) ? 'Saved to Watch later' : 'Removed from Watch later'); break;
    }
    case 'like': toggleList('likes', video); updateActionButtons(); break;
    case 'channel':
      state.channel = channel; renderCard('subscriptions');
      if (state.dialog === 'subscriptions') renderDialog();
      (dialog.open ? dialog : grid).querySelector(`.yt-channel-tab[data-channel="${channel}"]`)?.focus({ preventScroll: true }); break;
    case 'subscribe':
      toggleList('subscriptions', channel);
      if (!state.subscriptions.includes(channel)) { state.notifications = state.notifications.filter(id => id !== channel); persist(); }
      updateActionButtons(); renderCard('subscriptions');
      if (state.dialog === 'subscriptions') renderDialog();
      (dialog.open ? dialog : grid).querySelector(`[data-subscribe-id="${channel}"]`)?.focus({ preventScroll: true });
      toast(state.subscriptions.includes(channel) ? 'Subscribed. Their videos are in your feed.' : 'Unsubscribed from this demo channel'); break;
    case 'notifications':
      if (!state.subscriptions.includes(channel)) break;
      toggleList('notifications', channel); renderCard('subscriptions'); if (state.dialog === 'subscriptions') renderDialog();
      toast(state.notifications.includes(channel) ? 'Demo notifications on. No browser alerts are sent.' : 'Demo notifications off'); break;
    case 'next-short': changeShort(1); break;
    case 'previous-short': changeShort(-1); break;
    case 'play-all': if (state.later.length) watch(state.later[0], true); break;
    case 'shuffle':
      for (let index = state.later.length - 1; index > 0; index--) { const swap = Math.floor(Math.random() * (index + 1)); [state.later[index], state.later[swap]] = [state.later[swap], state.later[index]]; }
      persist(); renderCard('later'); if (state.later.length) watch(state.later[0], true); break;
    case 'reset': reset(); break;
  }
});
document.addEventListener('input', event => {
  if (event.target.matches('[name="video-search"]')) updateSearch(event.target);
  if (event.target.matches('.yt-seek')) media.seek(event.target);
});
document.addEventListener('submit', event => {
  if (!event.target.matches('.yt-search-form')) return;
  event.preventDefault(); updateSearch(event.target.querySelector('input'));
  event.target.closest('.yt-search').querySelector('.yt-row-main')?.focus();
});
document.addEventListener('keydown', event => {
  if (!dialog.open || state.dialog !== 'shorts' || event.target.matches('input,select,textarea')) return;
  if (event.key === 'ArrowDown') { event.preventDefault(); changeShort(1); }
  if (event.key === 'ArrowUp') { event.preventDefault(); changeShort(-1); }
  if (event.key.toLowerCase() === 'k') { event.preventDefault(); media.toggle(dialog.querySelector('.yt-media')); }
});
dialog.addEventListener('cancel', event => { event.preventDefault(); closeWidget(); });
dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeWidget(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) media.pauseAll(); });
document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
renderGrid();
