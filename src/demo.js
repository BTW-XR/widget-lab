// One gallery, independent interaction contexts, and cancellable demo tracks.
// Both manual events and scripted steps go through dispatch().
import { createDemoPointer, demoDelay } from './demo-pointer.js';
const glyph = name => `<svg viewBox="0 0 24 24" aria-hidden="true" class="demo-icon">${name === 'pause' ? '<path d="M7 5h4v14H7zm6 0h4v14h-4z"/>' : name === 'stop' ? '<rect x="6" y="6" width="12" height="12" rx="2"/>' : '<path d="M7 5 19 12 7 19Z"/>'}</svg>`;

export function createGallery({ widgets, createContext, scenarios, grid, dialog, content, icon, youtube = false }) {
  const tracks = new Map();
  let mode = null;
  let filter = 'all';
  let savedFilter = null;
  let modal = null;
  let origin = null;
  let automatic = false;
  let toastTimer;
  const markupCache = new WeakMap();
  function updateMarkup(node, html) {
    // Preserve focused controls while only the current action caption changes.
    if (markupCache.get(node) === html) return;
    node.innerHTML = html; markupCache.set(node, html);
  }
  const toolbar = document.createElement('div');
  toolbar.className = 'demo-toolbar';
  document.querySelector('.interaction-hint').replaceWith(toolbar);
  const article = id => grid.querySelector(`[data-widget-id="${id}"]`);
  const widgetFor = id => widgets.find(widget => widget.id === id);
  const contextFor = id => tracks.get(id)?.context || normal;
  const roots = context => [
    ...widgets.filter(widget => contextFor(widget.id) === context).map(widget => article(widget.id)).filter(Boolean),
    ...(modal?.context === context ? [content] : []),
  ];
  const scope = track => modal?.context === track.context ? content : article(track.id);
  const runnable = track => track.status === 'running' && !document.hidden && (!modal || modal.context === track.context);

  function makeContext(owner = null) {
    let context;
    const effects = {
      render: ids => renderContext(context, ids),
      open: id => open(id, context),
      roots: () => roots(context),
      canOpen: () => !automatic || mode !== 'all',
      toast: message => { if (!automatic) toast(message); },
      error: message => { const track = tracks.get(owner); if (track) fail(track, message); else toast(message); },
    };
    context = createContext(effects, !!owner);
    context.owner = owner;
    return context;
  }
  const normal = makeContext();

  function toast(message) {
    let element = modal ? dialog.querySelector('.demo-toast') : document.querySelector(youtube ? '#yt-toast' : '#toast');
    if (!element && modal) { element = document.createElement('div'); element.className = 'demo-toast'; element.setAttribute('role', 'status'); dialog.append(element); }
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('visible'), 2800);
  }
  function controls(id) {
    const track = tracks.get(id);
    const running = track?.status === 'running';
    const verb = !track ? 'Demo' : running ? 'Pause demo for' : track.status === 'paused' ? 'Resume demo for' : 'Replay demo for';
    return `<button class="demo-button ${track ? 'is-active' : ''}" data-demo="toggle" data-widget="${id}" title="${verb} ${widgetFor(id).title}" aria-label="${verb} ${widgetFor(id).title}">${glyph(running ? 'pause' : 'play')}</button>${track ? `<button class="demo-button" data-demo="stop" data-widget="${id}" title="Exit demo for ${widgetFor(id).title}" aria-label="Exit demo for ${widgetFor(id).title}">${glyph('stop')}</button>` : ''}`;
  }
  function description(track) {
    if (!track) return '';
    if (track.status === 'manual') return 'Your turn · Exit demo to restore';
    if (track.status === 'error') return 'Demo paused · Replay to try again';
    if (track.status === 'paused') return `Paused · ${track.label}`;
    if (modal && modal.context !== track.context) return 'Paused while a widget is expanded';
    return track.label;
  }
  function syncControls() {
    const active = [...tracks.values()].some(track => track.status === 'running');
    const paused = [...tracks.values()].some(track => track.status === 'paused');
    updateMarkup(toolbar, `<button class="demo-all" data-demo="all">${glyph(mode === 'all' && active ? 'pause' : 'play')}<span>${mode !== 'all' ? 'Demo all' : active ? 'Pause all' : paused ? 'Resume all' : 'Replay all'}</span></button>${tracks.size ? `<button class="demo-exit" data-demo="stop-all">${glyph('stop')}<span>Exit demos</span></button>` : '<span class="demo-hint">See them in action</span>'}`);
    widgets.forEach(widget => {
      const node = article(widget.id);
      if (!node) return;
      const track = tracks.get(widget.id);
      node.dataset.demoState = track?.status || 'idle';
      updateMarkup(node.querySelector('.demo-controls'), controls(widget.id));
      const caption = node.querySelector('.widget-caption');
      caption.textContent = track ? description(track) : widget.caption || widget.subtitle;
      caption.classList.toggle('demo-caption', !!track);
    });
    if (modal) {
      const id = modal.context.owner || modal.id;
      updateMarkup(content.querySelector('.demo-controls'), controls(id));
      content.querySelector('.mini-eyebrow').textContent = tracks.has(id) ? description(tracks.get(id)) : 'A LITTLE MORE ROOM';
    }
    tracks.forEach(track => track.pointer.sync(track.status, !!modal && modal.context !== track.context));
  }
  function cardMarkup(widget) {
    return `<article class="widget-item" data-widget-id="${widget.id}"><div class="widget-label"><div><span class="widget-number">${widget.number}</span><h2>${widget.title}</h2></div><div class="widget-tools"><span class="demo-controls"></span><button class="expand-button" data-action="expand" data-widget="${widget.id}" aria-label="Expand ${widget.title}" title="Expand ${widget.title}">${icon('expand')}</button></div></div><div class="widget-card ${youtube ? `yt-card yt-${widget.id}-card` : `${widget.id}-card`}"></div><p class="widget-caption"></p></article>`;
  }
  function renderGrid() {
    widgets.forEach(widget => contextFor(widget.id).pause?.());
    grid.innerHTML = widgets.filter(widget => filter === 'all' || widget.group === filter).map(cardMarkup).join('');
    widgets.forEach(widget => renderCard(widget.id));
    document.querySelectorAll('[data-filter]').forEach(button => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
    });
    syncControls();
  }
  function renderCard(id) {
    const card = article(id)?.querySelector('.widget-card');
    if (!card) return;
    const context = contextFor(id);
    context.pauseScope?.(card);
    card.innerHTML = context.render(id);
    context.bind?.(card);
  }
  function renderModal() {
    if (!modal) return;
    const { id, context } = modal;
    const widget = widgetFor(id);
    context.pauseScope?.(content);
    content.innerHTML = `<div class="dialog-header"><div class="dialog-heading-icon">${icon(widget.icon)}</div><div class="dialog-heading"><p class="mini-eyebrow">A LITTLE MORE ROOM</p><h2 id="${youtube ? 'yt-' : ''}dialog-title">${widget.title}</h2></div><span class="demo-controls"></span><button class="dialog-close" data-action="close-dialog" aria-label="Collapse ${widget.title}"><span>Back to widgets</span>${icon('close')}</button></div><div class="${youtube ? `yt-dialog-body yt-dialog-${id}` : `dialog-body dialog-${id}`}">${context.render(id, true)}</div>`;
    dialog.dataset.widget = id;
    context.bind?.(content);
    syncControls();
  }
  function renderContext(context, ids = widgets.map(widget => widget.id)) {
    widgets.forEach(widget => { if (contextFor(widget.id) === context && ids.includes(widget.id)) renderCard(widget.id); });
    if (modal?.context === context && ids.includes(modal.id)) renderModal();
    syncControls();
  }
  function open(id, context) {
    if (automatic && mode === 'all') return;
    if (!widgetFor(id)) return;
    if (!modal) origin = document.activeElement;
    modal?.context.pause?.();
    context.pause?.();
    modal = { id, context };
    renderModal();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
    content.querySelector('.dialog-close').focus({ preventScroll: true });
    for (const track of tracks.values()) if (track.context !== context) { cancel(track); track.context.pause?.(); }
    context.resume?.();
    syncControls();
  }
  function close() {
    if (!modal) return;
    const previous = modal;
    previous.context.pause?.();
    modal = null; dialog.close(); content.innerHTML = '';
    dialog.querySelector('.demo-toast')?.remove();
    document.body.classList.remove('dialog-open');
    renderCard(previous.context.owner || previous.id);
    for (const track of tracks.values()) if (runnable(track)) { track.context.resume?.(); schedule(track); }
    if (origin?.isConnected) origin.focus({ preventScroll: true });
    syncControls();
  }
  function dispatch(context, target) {
    const { action, widget } = target.dataset;
    if (action === 'expand') open(widget, context);
    else if (action === 'close-dialog') close();
    else context.act(action, target.dataset, target);
  }
  function cancel(track) {
    clearTimeout(track.timer);
    track.controller?.abort();
    track.pointer.cancel();
    roots(track.context).forEach(root => root.querySelectorAll('.demo-hover').forEach(node => node.classList.remove('demo-hover')));
  }
  function fail(track, message) {
    cancel(track); track.status = 'error'; track.context.pause?.(); syncControls();
    console.warn(`Demo ${track.id}: ${message}`);
  }
  function schedule(track, delay = 1000) {
    clearTimeout(track.timer);
    if (!runnable(track)) return;
    track.timer = setTimeout(() => tick(track), delay);
  }
  async function tick(track) {
    if (!runnable(track)) return;
    const controller = new AbortController();
    track.controller = controller;
    const { signal } = controller;
    const started = performance.now();
    const active = () => !signal.aborted && runnable(track);
    roots(track.context).forEach(root => root.querySelectorAll('.demo-hover').forEach(node => node.classList.remove('demo-hover')));
    if (track.index === track.steps.length) {
      if (modal?.context === track.context) close();
      track.context.pause?.(); track.context.reset(); track.index = 0;
      renderContext(track.context);
    }
    const step = track.steps[track.index];
    const target = scope(track)?.querySelector(step.selector);
    if (!target || target.disabled) { fail(track, `Missing control: ${step.selector}`); return; }
    track.label = step.label; syncControls();
    target.classList.add('demo-hover');
    if (modal?.context === track.context) target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    try {
      await track.pointer.move(target, { signal });
      await demoDelay(90, signal);
      if (!active()) return;
      // Rendering replaces nodes; never retain an action target across ticks.
      const current = scope(track)?.querySelector(step.selector);
      if (!current) { fail(track, 'The current control is no longer available.'); return; }
      track.pointer.align(current);
      track.pointer.press();
      await demoDelay(100, signal);
      if (!active()) return;
      if ('value' in step && current.matches('input[type="range"]')) {
        await track.pointer.drag(current, { value: step.value, signal, onInput: track.context.input });
      } else if ('value' in step && current.matches('input[type="search"]')) {
        const value = String(step.value);
        current.value = ''; track.context.input(current);
        track.pointer.release();
        for (let length = 1; length <= value.length; length++) {
          await demoDelay(Math.min(65, 340 / value.length), signal);
          if (!active()) return;
          current.value = value.slice(0, length); track.context.input(current);
        }
      } else {
        automatic = true;
        try {
          if ('value' in step) { current.value = step.value; track.context.input(current); }
          else dispatch(track.context, current);
        } finally { automatic = false; }
      }
      if (!active()) return;
      track.pointer.release();
      track.index += 1;
      schedule(track, step.holdMs ?? Math.max(260, 1250 - (performance.now() - started)));
    } catch (error) { if (!signal.aborted) fail(track, error.message); }
  }
  function start(id, single) {
    if (tracks.has(id)) stop(id, false);
    const context = makeContext(id);
    const track = { id, context, status: 'running', index: 0, label: 'Starting demo…', steps: scenarios(id, single) };
    track.pointer = createDemoPointer(id, () => modal?.context === context ? dialog : article(id));
    tracks.set(id, track);
    renderCard(id); syncControls(); schedule(track, 400);
  }
  function pause(track) { cancel(track); track.status = 'paused'; track.context.pause?.(); }
  function resume(track) { track.status = 'running'; if (runnable(track)) track.context.resume?.(); schedule(track); }
  function stop(id, finish = true) {
    const track = tracks.get(id);
    if (!track) return;
    cancel(track); track.status = 'stopped'; track.context.pause?.();
    if (modal?.context === track.context) close();
    track.pointer.destroy();
    tracks.delete(id); renderCard(id);
    if (finish && !tracks.size) finishSession();
    syncControls();
  }
  function finishSession() {
    mode = null;
    if (savedFilter !== null) { filter = savedFilter; savedFilter = null; renderGrid(); }
  }
  function stopAll() {
    [...tracks.keys()].forEach(id => stop(id, false));
    finishSession(); syncControls();
  }
  function begin(singleId = null) {
    stopAll(); close(); normal.pause?.();
    savedFilter = filter; mode = singleId ? 'single' : 'all';
    if (!singleId) { filter = 'all'; renderGrid(); }
    (singleId ? [singleId] : widgets.map(widget => widget.id)).forEach(id => start(id, !!singleId));
  }
  function command(button) {
    const { demo: action, widget: id } = button.dataset;
    if (action === 'stop-all') stopAll();
    if (action === 'all') {
      if (mode !== 'all') begin();
      else if ([...tracks.values()].some(track => track.status === 'running')) tracks.forEach(track => { if (track.status === 'running') pause(track); else track.context.pause?.(); });
      else if ([...tracks.values()].some(track => track.status === 'paused')) tracks.forEach(track => { if (track.status === 'paused') resume(track); });
      else begin();
    }
    if (action === 'stop') stop(id);
    if (action === 'toggle') {
      const track = tracks.get(id);
      if (!track) { if (mode === 'all') start(id, false); else begin(id); }
      else if (track.status === 'running') pause(track);
      else if (track.status === 'paused') resume(track);
      else start(id, mode === 'single');
    }
    syncControls();
  }
  function eventContext(target) {
    if (dialog.contains(target) && modal) return modal.context;
    const id = target.closest('[data-widget-id]')?.dataset.widgetId;
    return id ? contextFor(id) : normal;
  }
  function takeOver(event) {
    if (event.target.closest('[data-demo]')) return;
    if (event.type === 'keydown' && !['Enter', ' ', 'Escape', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'k'].includes(event.key) && !event.target.matches('input,select,textarea')) return;
    const track = tracks.get(eventContext(event.target).owner);
    if (track && ['running', 'paused'].includes(track.status)) { cancel(track); track.status = 'manual'; syncControls(); }
  }
  document.addEventListener('pointerdown', takeOver, true);
  document.addEventListener('keydown', takeOver, true);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-demo]');
    if (button) { command(button); return; }
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) { stopAll(); filter = filterButton.dataset.filter; renderGrid(); return; }
    const target = event.target.closest('[data-action]');
    if (!target) return;
    if (target.dataset.action === 'reset') { stopAll(); close(); normal.reset(true); filter = 'all'; renderGrid(); toast('A fresh start. Your demo is reset.'); return; }
    takeOver(event);
    const context = eventContext(target);
    const data = { ...target.dataset };
    dispatch(context, target);
    if (!target.isConnected) {
      const root = modal?.context === context ? content : article(context.owner || event.target.closest('[data-widget-id]')?.dataset.widgetId);
      [...(root?.querySelectorAll('[data-action]') || [])].find(node => Object.entries(data).every(([key, value]) => node.dataset[key] === value))?.focus({ preventScroll: true });
    }
  });
  document.addEventListener('input', event => { if (event.target.matches('select')) return; takeOver(event); eventContext(event.target).input(event.target); });
  document.addEventListener('change', event => { if (event.target.matches('select')) { takeOver(event); eventContext(event.target).input(event.target); } });
  document.addEventListener('focusin', event => { if (event.target.name === 'place-search') eventContext(event.target).input(event.target); });
  document.addEventListener('submit', event => { event.preventDefault(); takeOver(event); const input = event.target.querySelector('input'); if (input) eventContext(input).input(input); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.search-overlay')) eventContext(event.target).dismissSearch?.(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal) eventContext(event.target).dismissSearch?.();
    if (event.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); const tabs = [...event.target.parentElement.querySelectorAll('[role="tab"]')];
      tabs[(tabs.indexOf(event.target) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].click();
    }
    if (modal?.id === 'shorts' && !event.target.matches('input,select,textarea')) {
      const action = { ArrowDown: 'next-short', ArrowUp: 'previous-short', k: 'toggle-play' }[event.key];
      if (action) { event.preventDefault(); const target = content.querySelector(`[data-action="${action}"]`); if (target) dispatch(modal.context, target); }
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); if (modal?.context.owner) { const track = tracks.get(modal.context.owner); cancel(track); track.status = 'manual'; } close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { normal.pause?.(); tracks.forEach(track => { if (track.status === 'running') pause(track); else track.context.pause?.(); }); syncControls(); } });
  window.addEventListener('pagehide', () => { tracks.forEach(track => { cancel(track); track.pointer.destroy(); track.context.pause?.(); }); normal.pause?.(); });
  renderGrid();
}
