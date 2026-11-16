import { icon } from './icons.js';
import { getVideo, formatTime } from './data.js';

// Keep native media elements alive during unrelated widget updates.
// Progress belongs to a video, not to a compact or expanded presentation.
export function createMediaController(state, { onEnded, onError }) {
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
  function pauseAll(except = null) {
    document.querySelectorAll('.yt-media video').forEach(video => { if (video !== except) video.pause(); });
  }
  function bind(scope = document) {
    scope.querySelectorAll('.yt-media video').forEach(video => {
      if (video.dataset.bound) return;
      video.dataset.bound = 'true';
      const id = video.closest('.yt-media').dataset.mediaId;
      video.playbackRate = state.speed;
      video.addEventListener('loadedmetadata', () => { video.currentTime = Math.min(state.progress[id] || 0, Math.max(0, video.duration - 0.1)); sync(video); });
      video.addEventListener('play', () => { pauseAll(video); sync(video); });
      video.addEventListener('pause', () => sync(video));
      video.addEventListener('timeupdate', () => { state.progress[id] = video.currentTime; sync(video); });
      video.addEventListener('ended', () => { state.progress[id] = 0; sync(video); if (!video.loop) onEnded(id); });
      video.addEventListener('error', () => { video.closest('.yt-media').querySelector('.yt-media-error').hidden = false; onError('The demo clip could not be loaded. Try again.'); });
    });
  }
  async function play(video) {
    if (!video) return;
    if (video.ended) video.currentTime = 0;
    try { await video.play(); }
    catch { sync(video); onError('Press play to start the demo clip.'); }
  }
  function toggle(root) { const video = root.querySelector('video'); if (video.paused) void play(video); else video.pause(); }
  function seek(input) { const video = input.closest('.yt-media').querySelector('video'); const time = Number(input.value); state.progress[input.closest('.yt-media').dataset.mediaId] = time; if (video.readyState) video.currentTime = time; else video.load(); }
  function speed(root) {
    state.speed = state.speed === 1 ? 1.5 : state.speed === 1.5 ? 2 : 1;
    document.querySelectorAll('.yt-media video').forEach(video => { video.playbackRate = state.speed; });
    document.querySelectorAll('.yt-speed').forEach(button => { button.textContent = `${state.speed}×`; });
  }
  async function fullscreen(root) {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.requestFullscreen) await root.requestFullscreen();
      else if (root.querySelector('video').webkitEnterFullscreen) root.querySelector('video').webkitEnterFullscreen();
      else onError('Fullscreen isn’t available in this browser. Expand the widget for a larger player.');
    } catch { onError('Fullscreen isn’t available here. The expanded player is still available.'); }
  }
  return { bind, pauseAll, play, toggle, seek, speed, fullscreen };
}
