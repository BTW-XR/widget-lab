import { icon } from './icons.js';
import { places } from './data.js';

// An original, self-contained schematic map. No tiles, API key, or network calls.
const streetNetwork = `
  M-30 307 150 234 282 164 410 81 650-10
  M-10 365 172 283 309 212 463 116 645 48
  M-25 155 103 189 244 236 360 290 476 353 620 410
  M58-20 103 70 157 158 215 251 283 420
  M215-20 235 68 290 156 343 247 422 420
  M395-20 407 55 452 139 511 253 583 420
  M-20 58 99 96 205 127 316 154 442 188 620 235
  M-10 419 99 357 210 311 340 342 403 385
  M120-10 149 47 199 32 224 96
  M299-20 321 54 376 40 403 97
  M453-20 478 38 545 13 563 82
  M104 70 59 90 42 155
  M157 158 192 140 225 199
  M290 156 325 136 356 190
  M343 247 390 221 425 278
  M452 139 489 119 526 179
  M511 253 551 231 600 252
  M103 189 68 239 103 257
  M215 251 177 320 219 347
  M283 420 315 364 343 370
  M360 290 317 311 338 350
  M476 353 439 319 462 284
  M19 308 54 350 28 375
  M600 108 558 127 585 182`;

const baseMap = `
  <rect width="600" height="400" fill="#f0f1ed"/>
  <path d="M0 0H110L135 67 98 90 31 73 0 105Z" fill="#c9e6bd"/>
  <path d="m303 0 18 50 48-14 36-36Z" fill="#c6e4b9"/>
  <path d="M477 0h123v126l-46-15-20-49-42 16Z" fill="#d3e8c4"/>
  <path d="m-10 362 57-31 38 28-24 41H0Zm329-140 27 44 50-26-26-47Z" fill="#cee6c1"/>
  <path d="m433 306 29 46 71 39 28-16-45-82Z" fill="#c6e4ba"/>
  <path d="M579-10c-32 81 35 141-1 220s27 133 20 210" fill="none" stroke="#b3dce7" stroke-width="15"/>
  <g fill="#e8e6df" stroke="#dddcd5" stroke-width="1">
    <path d="m112 107 44 13 16 30-24 15Z"/><path d="m163 60 27-9 20 40-27 11Z"/>
    <path d="m243 79 31-12 35 59-27 17Z"/><path d="m330 73 43-13 17 34-36 21Z"/>
    <path d="m424 91 20-10 23 36-23 12Z"/><path d="m370 127 43-26 21 37-46 25Z"/>
    <path d="m303 185 27-16 17 28-30 19Z"/><path d="m228 175 29-16 14 23-27 16Z"/>
    <path d="m174 209 33 10 8 19-33 18-18-31Z"/><path d="m112 204 27 9-21 36-23-8Z"/>
    <path d="m361 260 42-22 15 28-37 24Z"/><path d="m425 212 49 13 21 37-52 19Z"/>
    <path d="m282 262 18-11 25 44-16 10Z"/><path d="m237 294 37-18 15 28-39 20Z"/>
    <path d="m118 314 28-13 12 30-27 11Z"/><path d="m164 348 38-18 19 40-38 18Z"/>
    <path d="m318 350 22 9-16 28-20-7Z"/><path d="m375 324 29-17 34 43-24 17Z"/>
    <path d="m518 173 25-12 16 32-23 10Z"/><path d="m544 277 34 7 11 35-28-13Z"/>
  </g>
  <path d="m348 128 68-39 31 53-66 38Z" fill="#f4ead0"/>
  <path d="m226 202 54-30 28 45-60 31Z" fill="#f4ead0"/>
  <path d="${streetNetwork}" fill="none" stroke="#d9dcd8" stroke-width="12" stroke-linejoin="round"/>
  <path d="${streetNetwork}" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>
  <path d="M-30 307 150 234 282 164 410 81 650-10" fill="none" stroke="#e4d3a4" stroke-width="17"/>
  <path d="M-30 307 150 234 282 164 410 81 650-10" fill="none" stroke="#fff1c5" stroke-width="13"/>
  <path d="M-10 365 172 283 309 212 463 116 645 48" fill="none" stroke="#d4d9d9" stroke-width="15"/>
  <path d="M-10 365 172 283 309 212 463 116 645 48" fill="none" stroke="#fff" stroke-width="10"/>
  <g font-family="Arial,sans-serif" font-size="10" fill="#7c827b" text-anchor="middle">
    <text x="226" y="200" transform="rotate(-29 226 200)">Peachtree Rd</text>
    <text x="347" y="195" transform="rotate(-31 347 195)">New Peachtree Rd</text>
    <text x="194" y="114" transform="rotate(17 194 114)">Park Avenue</text>
    <text x="431" y="303" transform="rotate(29 431 303)">Buford Highway</text>
    <text x="270" y="100" transform="rotate(61 270 100)">Oakcliff Rd</text>
    <text x="194" y="363">Chamblee</text><text x="500" y="81">Northwoods</text>
    <text x="65" y="47" fill="#63885b" font-size="11">Autumn Park</text>
    <text x="512" y="349" fill="#63885b">Honeysuckle</text><text x="512" y="362" fill="#63885b">Park</text>
    <text x="87" y="163" font-size="13" letter-spacing="2" fill="#92958e">DORAVILLE</text>
  </g>`;

export function mapMarkup({ kind = 'search', place = places[0], category = 'coffee', expanded = false, zoom = 1, step = 0, alternate = false, markerIds = null } = {}) {
  const route = kind === 'route' || kind === 'navigation';
  const destination = `${place.x * 6} ${place.y * 4}`;
  const normalRoute = `M162 296 172 283 309 212 358 182 ${destination}`;
  const alternative = `M162 296 215 251 282 164 355 116 ${destination}`;
  const navRoute = step > 1 ? `M309 212 358 182 ${destination}` : normalRoute;
  const routePath = alternate ? alternative : kind === 'navigation' ? navRoute : normalRoute;
  const visiblePlaces = route || kind === 'detail' ? [place] : places.filter(p => markerIds ? markerIds.includes(p.id) : p.category === category);
  return `<div class="map map-${kind}" aria-label="Illustrated demo map of Doraville"><div class="map-plane" style="--map-zoom:${zoom}">
    <svg class="map-art" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">${baseMap}
      ${route ? `<path d="${alternate ? normalRoute : alternative}" class="route-alternative"/><path d="${routePath}" class="route-halo"/><path d="${routePath}" class="route-line"/>` : ''}
    </svg>
    ${visiblePlaces.map(p => `<button class="map-marker ${p.category} ${route || kind === 'detail' ? 'destination-marker' : ''}" style="left:${p.x}%;top:${p.y}%" data-action="view-place" data-place="${p.id}" aria-label="View ${p.name}">${icon(p.category === 'parks' ? 'park' : p.category === 'food' ? 'food' : 'coffee')}<span>${p.name}</span></button>`).join('')}
    <span class="my-location ${kind === 'navigation' ? 'navigation-location' : ''}" style="left:${kind === 'navigation' && step === 3 ? place.x : kind === 'navigation' && step > 1 ? 51.5 : 27}%;top:${kind === 'navigation' && step === 3 ? place.y : kind === 'navigation' && step > 1 ? 53 : 74}%" aria-label="Your demo location">${kind === 'navigation' ? icon('navigation') : ''}</span>
    ${route && kind !== 'navigation' ? `<span class="map-route-label">${alternate ? place.minutes + 2 : place.minutes} min</span>` : ''}
    </div><span class="map-attribution"><b>Google</b><span>Illustrated demo map</span></span>
    ${expanded ? `<div class="map-zoom"><button data-action="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button data-action="zoom-out" aria-label="Zoom out">${icon('minus')}</button></div>` : ''}
    </div>`;
}
