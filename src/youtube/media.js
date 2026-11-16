import { icon } from './icons.js';
import { getVideo, formatTime } from './data.js';

// A controller owns only its context's media. Parallel demos never pause one another.
export function createMediaController(state, { onEnded, onError, roots, demo }) {
  let generation = 0;
  let allowed = true;
  let remembered = [];
  const pending = new Set();
  const all = selector => roots().flatMap(root => [...root.querySelectorAll(selector)]);
  function sync(video) {
    const root = video.closest('.yt-media');
    const duration = Number.isFinite(video.duration) ? video.duration : getVideo(root.dataset.mediaId).duration;
    const playing = !video.paused && !video.ended;
    root.classList.toggle('playing', playing);
    root.querySelectorAll('[data-action="toggle-play"]').forEach(button => {
      button.innerHTML = icon(playing ? 'pause' : 'play');
      button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} video`);
    });
    const range = root.querySelector('.yt-seek');
    if (range) { range.max = duration; range.value = video.currentTime; range.style.setProperty('--progress', `${video.currentTime / duration * 100}%`); }
    const time = root.querySelector('.yt-time');
    if (time) time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  }
  function pauseAll() {
    generation += 1; allowed = false;
    all('video').forEach(video => video.pause());
  }
  function pause() {
    const playing = all('video').filter(video => !video.paused || pending.has(video)).map(video => video.closest('.yt-media').dataset.mediaId);
    if (playing.length) remembered = playing;
    pauseAll();
  }
  function resume() {
    const ids = remembered; remembered = [];
    ids.forEach(id => { const matches = all('video').filter(video => video.closest('.yt-media').dataset.mediaId === id); if (matches.length) void play(matches.at(-1)); });
  }
  function bind(scope) {
    scope.querySelectorAll('.yt-media video').forEach(video => {
      if (video.dataset.bound) return;
      video.dataset.bound = 'true';
      if (demo) video.muted = true;
      const id = video.closest('.yt-media').dataset.mediaId;
      video.playbackRate = state.speed;
      video.addEventListener('loadedmetadata', () => { video.currentTime = Math.min(state.progress[id] || 0, Math.max(0, video.duration - .1)); sync(video); });
      video.addEventListener('play', () => {
        if (!allowed || !video.isConnected) { video.pause(); return; }
        all('video').forEach(other => { if (other !== video) other.pause(); }); sync(video);
      });
      video.addEventListener('pause', () => sync(video));
      video.addEventListener('timeupdate', () => { if (video.isConnected) state.progress[id] = video.currentTime; sync(video); });
      video.addEventListener('ended', () => { if (!video.isConnected || !allowed) return; state.progress[id] = 0; sync(video); if (!video.loop) onEnded(id); });
      video.addEventListener('error', () => { if (!video.isConnected) return; video.closest('.yt-media').querySelector('.yt-media-error').hidden = false; onError('The demo clip could not be loaded. Replay to try again.'); });
    });
  }
  async function play(video) {
    if (!video) return;
    allowed = true;
    const request = generation;
    pending.add(video);
    if (video.ended) video.currentTime = 0;
    try { await video.play(); if (request !== generation || !video.isConnected) video.pause(); }
    catch (error) { if (request === generation && video.isConnected && error.name !== 'AbortError') { sync(video); onError('Press play to start the demo clip.'); } }
    finally { pending.delete(video); }
  }
  function toggle(root) { const video = root.querySelector('video'); if (video.paused) void play(video); else { remembered = []; video.pause(); } }
  function seek(input) {
    const video = input.closest('.yt-media').querySelector('video');
    state.progress[input.closest('.yt-media').dataset.mediaId] = Number(input.value);
    if (video.readyState) { video.currentTime = Number(input.value); sync(video); } else video.load();
  }
  function speed() {
    state.speed = state.speed === 1 ? 1.5 : state.speed === 1.5 ? 2 : 1;
    all('video').forEach(video => { video.playbackRate = state.speed; });
    all('.yt-speed').forEach(button => { button.textContent = `${state.speed}×`; });
  }
  async function fullscreen(root) {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.querySelector('video').webkitEnterFullscreen) root.querySelector('video').webkitEnterFullscreen();
      else onError('Fullscreen isn’t available in this browser. Expand the widget for a larger player.');
    } catch { onError('Fullscreen isn’t available here. The expanded player is still available.'); }
  }
  return { bind, pause, resume, pauseAll, play, toggle, seek, speed, fullscreen,
    reset() { pauseAll(); remembered = []; },
    pauseScope(scope) { scope.querySelectorAll('video').forEach(video => video.pause()); },
  };
}
