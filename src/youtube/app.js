import { widgets } from './data.js';
import { icon } from './icons.js';
import { createYouTubeContext } from './context.js';
import { createGallery } from '../demo.js';
import { youtubeScenario } from '../demo-scenarios.js';

document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
createGallery({ widgets, createContext: createYouTubeContext, scenarios: youtubeScenario, icon, youtube: true,
  grid: document.querySelector('#youtube-grid'), dialog: document.querySelector('#youtube-dialog'), content: document.querySelector('#yt-dialog-content'),
});
