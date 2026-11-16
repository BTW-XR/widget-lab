import { widgets } from './data.js';
import { icon, mapsLogo } from './icons.js';
import { createMapContext } from './maps-context.js';
import { createGallery } from './demo.js';
import { mapsScenario } from './demo-scenarios.js';

document.querySelector('#brand-mark').innerHTML = mapsLogo();
document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
createGallery({ widgets, createContext: createMapContext, scenarios: mapsScenario, icon,
  grid: document.querySelector('#widget-grid'), dialog: document.querySelector('#widget-dialog'), content: document.querySelector('#dialog-content'),
});
