# Maps Widget Lab

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
- Desktop and mobile layout checks.

## Suggested commit message

```text
feat: add six interactive Maps-inspired widgets with compact and expanded states
```
