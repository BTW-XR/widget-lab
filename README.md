# Web Widget Lab

Two connected collections: **Maps** and **YouTube**. Use the switch in the header to move between them. The Maps gallery remains at `/index.html`; the YouTube gallery is at `/youtube.html`.

## YouTube collection

Six YouTube-inspired widgets use the same compact-and-expanded approach:

| Widget | Compact state | Expanded state |
| --- | --- | --- |
| Search | Search box, prompts, inline results | Larger video search results |
| For you | Topic filters and one recommendation | A small browsable video collection |
| Now playing | Native video, transport controls, like, save | Creator subscription, description, related videos or queue |
| Shorts | One portrait clip, like, save, next | Larger portrait player, creator details, keyboard navigation |
| Subscriptions | Creator filters and a relevant upload | Full channel feed, profile, subscription controls |
| Watch later | Two saved videos and Play all | Full saved queue, remove, shuffle and sequential playback |

Playback is real HTML video: play/pause, seek, playback speed, and fullscreen where supported. Only one clip plays at a time. Photo previews are silent 12-second motion clips; the nature sample is an actual 5-second video. No account, YouTube API, or external media request is needed at runtime. Channel identities, views, and likes are mock data.

Search for `Kyoto`, `design`, or `nature`; open a result, save it, and see it in Watch later. Play all advances through the saved queue. Shorts support next/previous, with arrow keys in the expanded view. Subscriptions, likes, Watch later, and simulated notification preferences persist on this device. Notification controls do not request OS permissions or send alerts.

YouTube source lives in `src/youtube/`: `data.js` for mock content, `views.js` for widget markup, `app.js` for state and actions, `media.js` for native playback, and `styles.css` for presentation. `src/collections.css` adds the shared collection switch. The local server supports byte ranges for media seeking.

Media attribution:

- Kyoto: [Unsplash image source](https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e).
- Architecture: [Unsplash image source](https://images.unsplash.com/photo-1511818966892-d7d671e672a2).
- Ocean: [Unsplash image source](https://images.unsplash.com/photo-1518837695005-2083093ee35b).
- Workspace: [Unsplash image source](https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85).
- Flower video and extracted poster: [MDN CC0 sample](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4).

Photo motion previews were rendered locally with FFmpeg. All final assets are included in `assets/youtube/`; FFmpeg is not needed to run or build the project. This is an independent UI study, not an official YouTube product.

## Maps collection

Six connected, Google Maps-inspired widgets for exploring focused web experiences. Each widget has a compact card and an expanded view. All place data, reviews, prices, routes, and travel times are fictional demo content; the map is an original SVG illustration.

## Run locally

Requires Node.js 18 or newer. No dependencies or API keys are needed.

```sh
cd /Users/chenyang/Desktop/BTW/gen-widgets
npm run dev
```

Open http://127.0.0.1:4173. Set `PORT` to use another port. Reload the browser after editing source files.

```sh
npm run check   # JavaScript syntax checks
npm run build   # Copy the static application to dist/
```

## The six widgets

| Widget | Compact state | Expanded state |
| --- | --- | --- |
| Search | Floating search, nearby categories, location | Search results and a larger map |
| Explore nearby | Category filters and two nearby places | All matching places beside a map |
| Place details | Photo, rating, open status, primary actions | Overview, sample menu, review, and location |
| Directions | Travel mode, destination, estimated journey | Two selectable routes and route map |
| Navigation | Next turn and remaining journey | Step list and manually advancing route simulation |
| Saved places | Want to go and Favorites lists | Full saved list and location map |

Search for `tea`, `coffee`, `sushi`, or `park`. Selecting a place updates the place and directions widgets. Start a route to enter navigation; use the arrow to advance through the simulated turns. Saved places persist in localStorage when available. Reset demo restores the sample lists and initial state.

The navigation mute control demonstrates UI state only; the demo does not play audio or use GPS. Maps and routes are illustrations, not real navigation.

## Source structure

- `src/app.js`: widget renderers, shared state, interactions, and dialog lifecycle.
- `src/data.js`: mock places and travel modes.
- `src/map.js`: original SVG map, markers, and route rendering.
- `src/icons.js`: shared SVG icon helpers.
- `src/styles.css`: design tokens, widget styles, expanded states, responsive breakpoints.
- `scripts/serve.mjs`: dependency-free local static server.
- `scripts/build.mjs`: static build output.

All application assets are local. The MollyTea image is reused from the user's supplied visual reference and cropped through CSS. The representative café photograph is from [Unsplash](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb). It illustrates mock businesses rather than their actual interiors. This is an independent UI study, not an official Google product.

## Basic verification

- Syntax checks and production build.
- Browser smoke check: search → place → save → walking directions → simulated arrival.
- YouTube smoke check: search → playback → like/save, speed, seek → next queued video, channel subscription, notifications, Shorts, and topic filters.
- Saved videos and subscriptions survive reload; the collection switch retains access to all six Maps widgets.
- Desktop and mobile layout checks.

## Suggested commit message

```text
feat: add six YouTube widgets with native playback and persistent personal collections
```
