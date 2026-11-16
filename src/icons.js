const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  expand: '<path d="M14 4h6v6M20 4l-6 6M10 20H4v-6M4 20l6-6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  'chevron-down': '<path d="m7 10 5 5 5-5"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  coffee: '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2"/>',
  food: '<path d="M5 3v5a3 3 0 0 0 6 0V3M8 3v18m12 0V3c-4 3-5 9 0 9"/>',
  park: '<path d="m12 2-6 7h3l-5 7h7v6h2v-6h7l-5-7h3Z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  heart: '<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 0 9 8 15 8-6 12-11 8-15Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  directions: '<path d="m12 2 10 10-10 10L2 12Z"/><path d="M8 15v-4h8m-3-3 3 3-3 3"/>',
  navigation: '<path d="m12 3 8 18-8-5-8 5Z"/>',
  car: '<path d="m5 6-2 7v6h3v-3h12v3h3v-6l-2-7ZM3 12h18M7 6V4h10v2M6 14h1m10 0h1"/>',
  walk: '<circle cx="14" cy="4" r="2"/><path d="m7 21 4-7 2-6m-7 4 5-4 4 1 3 4 3 1m-9 0 4 3 1 4"/>',
  train: '<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 10h14M9 3v7m6-7v7M8 21l2-3m6 3-2-3M8 14h1m6 0h1"/>',
  turn: '<path d="M6 21V10a4 4 0 0 1 4-4h10m-6-5 6 5-6 5"/>',
  straight: '<path d="M12 22V3m-7 7 7-7 7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-9 11 9 5 9-5M3 18l9 5 9-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m0-6-6 6"/>',
  swap: '<path d="M8 3v16m-4-4 4 4 4-4M16 21V5m-4 4 4-4 4 4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1"/>',
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.pin}</svg>`;
}
export function mapsLogo() {
  return '<svg class="maps-logo" viewBox="0 0 32 44" aria-hidden="true"><defs><clipPath id="map-pin-clip"><path d="M16 0C7 0 0 7 0 16c0 10 12 21 14 26 1 2 3 2 4 0 2-5 14-16 14-26C32 7 25 0 16 0Z"/></clipPath></defs><g clip-path="url(#map-pin-clip)"><path fill="#34a853" d="M0 0h32v44H0z"/><path fill="#4285f4" d="M0 0h32v13L17 30 0 11Z"/><path fill="#1a73e8" d="M0 0h21L0 23Z"/><path fill="#fbbc04" d="m0 23 11-12 12 12L0 45Z"/><path fill="#ea4335" d="M0 4 12 16 0 30Z"/></g><circle cx="16" cy="16" r="6" fill="white"/></svg>';
}
