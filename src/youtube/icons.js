import { icon as sharedIcon } from '../icons.js';
const paths = {
  play: '<path d="m8 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 4h4v16H7zm7 0h4v16h-4z" fill="currentColor" stroke="none"/>',
  next: '<path d="m5 5 11 7-11 7Z" fill="currentColor" stroke="none"/><path d="M19 5v14"/>',
  previous: '<path d="m19 5-11 7 11 7Z" fill="currentColor" stroke="none"/><path d="M5 5v14"/>',
  home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
  like: '<path d="M8 10 12 3c1-1 3 0 2 3l-1 3h6a2 2 0 0 1 2 3l-2 7a2 2 0 0 1-2 2H8ZM3 10h5v11H3Z"/>',
  dislike: '<path d="m8 14 4 7c1 1 3 0 2-3l-1-3h6a2 2 0 0 0 2-3l-2-7a2 2 0 0 0-2-2H8ZM3 14h5V3H3Z"/>',
  shorts: '<path d="m16 2-10 6a4 4 0 0 0 0 7l2 1-3 2a3 3 0 0 0 3 5l10-6a4 4 0 0 0 0-7l-2-1 3-2a3 3 0 0 0-3-5Z"/><path d="m10 9 6 3-6 3Z" fill="currentColor" stroke="none"/>',
  subscriptions: '<path d="M7 2h10M4 5h16"/><rect x="2" y="8" width="20" height="14" rx="2"/><path d="m10 11 6 4-6 4Z" fill="currentColor" stroke="none"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M9 21h6"/>',
  belloff: '<path d="m3 3 18 18M18 13V8a6 6 0 0 0-9-5M6 8c0 6-3 8-3 9h14M9 21h6"/>',
  queue: '<path d="M3 5h13M3 10h13M3 15h8m5-1 7 4-7 4Z"/>',
  remove: '<path d="M5 7h14M9 4h6M7 7l1 14h8l1-14M10 10v7m4-7v7"/>',
  more: '<circle cx="12" cy="4" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="20" r="1"/>',
  verified: '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="m8 12 3 3 5-6" stroke="white" stroke-width="2"/>',
  full: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  up: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  history: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6M12 7v5l3 2"/>',
  shuffle: '<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 3-2 4-4M14 8c1-2 2-3 4-3h3m-4-4 4 4-4 4"/>',
};
export function icon(name, className = '') {
  if (!paths[name]) return sharedIcon(name, className);
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
