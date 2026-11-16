// One persistent pointer per demo track, outside the markup that widgets replace.
export function createDemoPointer(id, getHost) {
  const node = document.createElement('span');
  node.className = 'demo-pointer';
  node.dataset.pointerFor = id;
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = '<span class="demo-pointer-ring"></span><span class="demo-pointer-dot"></span>';
  const ring = node.querySelector('.demo-pointer-ring');
  let host;
  let position = { x: 0, y: 0 };
  let size;
  let motion;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transform = point => `translate(${point.x}px, ${point.y}px)`;

  function freeze() {
    if (!motion) return;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
    position = { x: matrix.m41, y: matrix.m42 };
    node.style.transform = transform(position);
    motion.cancel(); motion = null;
  }
  function attach() {
    const next = getHost();
    if (!next || !next.clientWidth || !next.clientHeight) return;
    if (host !== next || !node.isConnected) {
      freeze();
      position = size
        ? { x: position.x / size.width * next.clientWidth, y: position.y / size.height * next.clientHeight }
        : { x: next.clientWidth - 28, y: Math.min(next.clientHeight - 40, 350) };
      host = next;
      host.append(node);
      node.style.transform = transform(position);
    }
    size = { width: host.clientWidth, height: host.clientHeight };
  }
  function pointFor(target, value) {
    attach();
    const rect = target.getBoundingClientRect();
    const bounds = host.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    if (target.matches('input[type="range"]')) {
      const fraction = (Number(value ?? target.value) - Number(target.min || 0)) / (Number(target.max || 100) - Number(target.min || 0));
      x = rect.left + 7 + Math.max(0, Math.min(1, fraction)) * (rect.width - 14);
    } else if (target.matches('input[type="search"]')) x = rect.right - Math.min(26, rect.width / 2);
    return { x: x - bounds.left - host.clientLeft + host.scrollLeft,
      y: rect.top + rect.height / 2 - bounds.top - host.clientTop + host.scrollTop };
  }
  async function move(target, { duration = 440, value, signal } = {}) {
    if (signal?.aborted) return;
    attach(); freeze();
    const destination = pointFor(target, value);
    const from = transform(position);
    position = destination;
    node.style.transform = transform(destination);
    const animation = node.animate([{ transform: from }, { transform: transform(destination) }], {
      duration: reduced() ? 0 : duration, easing: 'cubic-bezier(.4, 0, .2, 1)',
    });
    motion = animation;
    const abort = () => freeze();
    signal?.addEventListener('abort', abort, { once: true });
    try { await animation.finished; } catch { /* A pause freezes an unfinished move. */ }
    finally { signal?.removeEventListener('abort', abort); if (motion === animation) motion = null; }
  }
  function press() {
    node.classList.add('is-pressed');
    ring.getAnimations().forEach(animation => animation.cancel());
    if (!reduced()) ring.animate([
      { transform: 'translate(-50%, -50%) scale(.5)', opacity: .65 },
      { transform: 'translate(-50%, -50%) scale(2.2)', opacity: 0 },
    ], { duration: 480, easing: 'ease-out' });
  }
  function release() { node.classList.remove('is-pressed'); }
  function cancel() { freeze(); release(); ring.getAnimations().forEach(animation => animation.cancel()); }
  function drag(target, { value, signal, onInput }) {
    freeze();
    if (signal.aborted) return Promise.resolve();
    const from = Number(target.value);
    const started = performance.now();
    return new Promise(resolve => {
      let frame;
      const finish = () => { cancelAnimationFrame(frame); signal.removeEventListener('abort', finish); resolve(); };
      const update = now => {
        if (signal.aborted) { finish(); return; }
        const progress = reduced() ? 1 : Math.min(1, (now - started) / 320);
        target.value = from + (Number(value) - from) * progress;
        onInput(target);
        // The dot and the native slider thumb share the exact same value each frame.
        position = pointFor(target); node.style.transform = transform(position);
        if (progress < 1) frame = requestAnimationFrame(update); else finish();
      };
      signal.addEventListener('abort', finish, { once: true });
      frame = requestAnimationFrame(update);
    });
  }
  return {
    move, drag, press, release, cancel,
    sync(status, blocked) {
      attach();
      node.hidden = ['manual', 'error', 'stopped'].includes(status) || blocked;
      node.classList.toggle('is-paused', status === 'paused');
    },
    align(target, value) {
      freeze(); position = pointFor(target, value); node.style.transform = transform(position);
    },
    destroy() { cancel(); node.remove(); },
  };
}

export function demoDelay(ms, signal) {
  if (signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', finish); resolve(); };
    const timer = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
}
