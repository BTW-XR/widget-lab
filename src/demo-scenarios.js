const click = (action, label, attributes = '') => ({ selector: `[data-action="${action}"]${attributes}`, label });
const input = (name, value, label) => ({ selector: `[name="${name}"]`, value, label });
const expand = id => click('expand', 'Expand for a little more', `[data-widget="${id}"]`);
const close = () => click('close-dialog', 'Back to the compact widget');
const mode = value => click('travel-mode', `Try ${value === 'drive' ? 'driving' : value === 'walk' ? 'walking' : 'transit'}`, `[data-mode="${value}"]`);
const category = value => click('category', `Explore ${value === 'coffee' ? 'coffee & tea' : value}`, `[data-category="${value}"]`);
const tab = value => click('saved-tab', value === 'want' ? 'Open Want to go' : 'Open Favorites', `[data-tab="${value}"]`);
const detail = value => click('detail-tab', `Read the ${value}`, `[data-tab="${value}"]`);
const savedPlace = id => click('save', 'Update saved places', `[data-place="${id}"]`);
const next = () => click('next-turn', 'Preview the next turn');
const maps = {
  search: {
    compact: [input('place-search', 'tea', 'Search for a little tea'), input('place-search', 'coffee', 'Find nearby coffee'), input('place-search', '', 'Clear the search'), click('recenter', 'Back to your neighborhood')],
    expanded: [input('place-search', 'park', 'Find somewhere green'), click('view-place', 'Open Autumn Park', '[data-place="autumn"]'), detail('reviews')],
  },
  explore: {
    compact: [category('food'), category('parks'), category('coffee')],
    expanded: [click('cycle-category', 'Discover another category'), click('view-place', 'Take a look at Miss Gogi', '[data-place="gogi"]'), detail('menu')],
  },
  place: {
    compact: [savedPlace('molly'), savedPlace('molly')],
    expanded: [detail('menu'), detail('reviews'), detail('overview'), click('directions', 'Plan a visit', '[data-place="molly"]'), mode('walk')],
  },
  directions: {
    compact: [mode('walk'), mode('transit'), input('destination', 'moonbird', 'Choose Moonbird Coffee'), mode('drive')],
    expanded: [click('route', 'Take the quieter route', '[data-alternate="true"]'), click('route', 'Compare the recommended route', '[data-alternate="false"]'), click('start-navigation', 'Start this little journey'), next()],
  },
  navigation: {
    compact: [next(), click('mute', 'Mute simulated guidance'), next(), next(), click('mute', 'Turn guidance back on')],
    expanded: [click('restart-navigation', 'Replay the route'), next(), click('end-navigation', 'End the journey')],
  },
  saved: {
    compact: [tab('favorites'), savedPlace('moonbird'), tab('want'), savedPlace('molly')],
    expanded: [click('view-place', 'Revisit White Windmill', '[data-place="whitewind"]'), detail('menu')],
  },
};
const topic = value => click('topic', `Explore ${value.toLowerCase()}`, `[data-topic="${value}"]`);
const channel = value => click('channel', value === 'all' ? 'Back to all channels' : 'Explore a creator', `[data-channel="${value}"]`);
const saveVideo = id => click('save', 'Update Watch later', id ? `[data-video="${id}"]` : '');
const play = label => click('toggle-play', label);
const seek = value => ({ selector: '.yt-seek', value, label: 'Jump to another moment' });
const youtube = {
  search: {
    compact: [input('video-search', 'Kyoto', 'Find a slow day in Kyoto'), saveVideo('kyoto'), input('video-search', 'Design', 'Search for a new perspective'), input('video-search', '', 'Start a fresh search')],
    expanded: [click('search-term', 'Explore the little things in nature', '[data-query="Nature"]'), click('watch', 'Play this discovery', '[data-video="bloom"]'), play('Pause for a moment')],
  },
  discover: {
    compact: [topic('Design'), click('another-video', 'Try another recommendation'), saveVideo(), topic('Travel'), click('another-video', 'Find a different journey'), topic('Nature')],
    expanded: [topic('All'), click('watch', 'Watch a little Kyoto', '[data-video="kyoto"]'), play('Pause this preview')],
  },
  player: {
    compact: [{ ...play('Play a little Kyoto'), duration: 2000 }, play('Pause for a moment'), seek(3), click('speed', 'Try 1.5× playback'), click('like', 'Like this discovery'), saveVideo('kyoto')],
    expanded: [play('Continue watching'), seek(6), click('speed', 'Try 2× playback'), click('subscribe', 'Update this subscription')],
  },
  shorts: {
    compact: [{ ...play('Play a small discovery'), duration: 2000 }, click('like', 'Like this Short'), saveVideo('bloom'), click('next-short', 'Swipe to the next Short'), click('next-short', 'One more small discovery')],
    expanded: [click('previous-short', 'Revisit the previous Short'), click('subscribe', 'Update this creator subscription'), click('next-short', 'Keep exploring')],
  },
  subscriptions: {
    compact: [channel('field'), click('subscribe', 'Follow Field Notes', '[data-channel="field"]'), click('notifications', 'Turn on demo notifications', '[data-channel="field"]'), channel('form'), channel('all')],
    expanded: [channel('field'), click('notifications', 'Turn demo notifications off', '[data-channel="field"]'), channel('all')],
  },
  later: {
    compact: [saveVideo('architecture'), saveVideo('ocean')],
    expanded: [click('shuffle', 'Shuffle and play your list'), seek(5), play('Pause this saved video')],
  },
};
function sequence(collection, id, single) {
  const scene = collection[id];
  return single ? [...scene.compact, expand(id), ...scene.expanded, close()] : scene.compact;
}
export const mapsScenario = (id, single) => sequence(maps, id, single);
export const youtubeScenario = (id, single) => sequence(youtube, id, single);
