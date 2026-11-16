import { videos, channels, shorts, getVideo } from './data.js';
import { icon } from './icons.js';
import { renderWidget, searchOutput, upNext } from './views.js';
import { createMediaController } from './media.js';

const STORAGE_KEY = 'youtube-widget-lab-v1';
const defaults = { later: ['architecture', 'ocean', 'space'], subscriptions: ['elsewhere', 'form'], likes: [], notifications: [] };
export function createYouTubeContext(effects, demo = false) {
  const fresh = () => ({ ...structuredClone(defaults), topic: 'All', featured: 1, query: '', selected: 'kyoto', shortIndex: 0, channel: 'all', speed: 1, progress: {}, queueActive: false });
  const state = fresh();
  if (!demo) {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && Object.keys(defaults).every(key => Array.isArray(stored[key]))) {
        Object.assign(state, Object.fromEntries(Object.keys(defaults).map(key => [key, [...new Set(stored[key])].filter(id => (key === 'subscriptions' || key === 'notifications' ? channels : videos).some(item => item.id === id))])));
      }
    } catch { /* Storage is optional. */ }
  }
  const queryAll = selector => effects.roots().flatMap(root => [...root.querySelectorAll(selector)]);
  const media = createMediaController(state, {
    demo, roots: effects.roots, onError: effects.error,
    onEnded(id) {
      if (!state.queueActive) return;
      const index = state.later.indexOf(id);
      if (index !== -1 && index < state.later.length - 1) watch(state.later[index + 1], true);
      else { state.queueActive = false; effects.toast('All caught up. That’s the end of your list.'); }
    },
  });
  function persist() {
    if (demo) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(Object.keys(defaults).map(key => [key, state[key]])))); }
    catch { effects.toast('Kept for this session. Browser storage is unavailable.'); }
  }
  function toggleList(key, id) { const index = state[key].indexOf(id); if (index === -1) state[key].push(id); else state[key].splice(index, 1); persist(); }
  function watch(id, queue = false) {
    media.reset(); state.selected = id; state.queueActive = queue;
    effects.render(['player']); effects.open('player');
    void media.play(queryAll('.yt-player video').at(-1));
  }
  function input(target) {
    if (target.name === 'video-search') {
      state.query = target.value;
      queryAll('.yt-search').forEach(root => {
        const other = root.querySelector('input'); if (other !== target) other.value = state.query;
        root.querySelector('.yt-search-output').innerHTML = searchOutput(state, root.classList.contains('yt-expanded'));
      });
    }
    if (target.matches('.yt-seek')) media.seek(target);
  }
  function changeShort(direction) {
    media.reset(); state.shortIndex = (state.shortIndex + direction + shorts.length) % shorts.length;
    state.progress[shorts[state.shortIndex]] = 0;
    effects.render(['shorts']); void media.play(queryAll('.yt-shorts video').at(-1));
  }
  function act(action, data, target) {
    const { video, topic, channel, query } = data;
    switch (action) {
      case 'watch': watch(video, state.queueActive && !!target.closest('.yt-up-next')); break;
      case 'toggle-play': media.toggle(target.closest('.yt-media')); break;
      case 'speed': media.speed(); break;
      case 'fullscreen': void media.fullscreen(target.closest('.yt-media')); break;
      case 'retry-media': { const root = target.closest('.yt-media'); root.querySelector('.yt-media-error').hidden = true; root.querySelector('video').load(); void media.play(root.querySelector('video')); break; }
      case 'topic': state.topic = topic; state.featured = 0; effects.render(['discover']); break;
      case 'another-video': state.featured += 1; effects.render(['discover']); break;
      case 'search-term': { const field = target.closest('.yt-search').querySelector('input'); field.value = query; input(field); break; }
      case 'clear-search': { const field = target.closest('.yt-search').querySelector('input'); field.value = ''; input(field); break; }
      case 'save':
        toggleList('later', video); updateActionButtons(); effects.render(['later']);
        queryAll('.yt-up-next').forEach(element => { element.outerHTML = upNext(state); });
        effects.toast(state.later.includes(video) ? 'Saved to Watch later' : 'Removed from Watch later'); break;
      case 'like': toggleList('likes', video); updateActionButtons(); break;
      case 'channel': state.channel = channel; effects.render(['subscriptions']); break;
      case 'subscribe':
        toggleList('subscriptions', channel);
        if (!state.subscriptions.includes(channel)) { state.notifications = state.notifications.filter(id => id !== channel); persist(); }
        updateActionButtons(); effects.render(['subscriptions']); break;
      case 'notifications':
        if (state.subscriptions.includes(channel)) { toggleList('notifications', channel); effects.render(['subscriptions']); }
        break;
      case 'next-short': changeShort(1); break;
      case 'previous-short': changeShort(-1); break;
      case 'play-all': if (state.later.length) watch(state.later[0], true); break;
      case 'shuffle':
        if (!state.later.length) break;
        // Repeatable in demos; ordinary manual use keeps its random shuffle.
        if (demo) state.later.push(state.later.shift());
        else for (let index = state.later.length - 1; index > 0; index--) { const swap = Math.floor(Math.random() * (index + 1)); [state.later[index], state.later[swap]] = [state.later[swap], state.later[index]]; }
        persist(); effects.render(['later']); if (state.later.length) watch(state.later[0], true); break;
    }
  }
  function updateActionButtons() {
    queryAll('[data-save-id]').forEach(button => {
      const saved = state.later.includes(button.dataset.saveId);
      button.classList.toggle('is-saved', saved);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', `${saved ? 'Remove from Watch later' : 'Save to Watch later'}: ${getVideo(button.dataset.saveId).title}`);
      button.innerHTML = `${icon(saved ? 'check' : 'clock')}${button.classList.contains('yt-icon-save') ? '' : `<span>${saved ? 'Saved' : 'Watch later'}</span>`}`;
    });
    queryAll('[data-short-save]').forEach(button => {
      const saved = state.later.includes(button.dataset.shortSave);
      button.classList.toggle('is-saved', saved);
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', `${saved ? 'Remove Short from' : 'Save Short to'} Watch later`);
      button.innerHTML = `${icon(saved ? 'check' : 'plus')}<span>${saved ? 'Saved' : 'Save'}</span>`;
    });
    queryAll('[data-like-id]').forEach(button => { const liked = state.likes.includes(button.dataset.likeId); button.classList.toggle('is-liked', liked); button.setAttribute('aria-pressed', String(liked)); });
    queryAll('[data-subscribe-id]').forEach(button => {
      const subscribed = state.subscriptions.includes(button.dataset.subscribeId);
      button.classList.toggle('subscribed', subscribed);
      button.setAttribute('aria-pressed', String(subscribed));
      button.innerHTML = `${subscribed ? icon('check') : ''}<span>${subscribed ? 'Subscribed' : 'Subscribe'}</span>`;
    });
  }
  return { state, act, input, render: (id, expanded = false) => renderWidget(id, state, expanded),
    bind: media.bind, pause: media.pause, resume: media.resume, pauseScope: media.pauseScope,
    reset(persistChanges = false) { media.reset(); Object.assign(state, fresh()); if (persistChanges) persist(); },
  };
}
