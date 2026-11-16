// All locations, reviews, timings, and routes in this prototype are mock data.
export const places = [
  { id: 'molly', name: 'MollyTea', type: 'Tea house', category: 'coffee', rating: '4.7', reviews: 104, distance: '1.0 mi', minutes: 6, closes: '11 pm', address: '6035 Peachtree Rd, Doraville', color: 'pink', tagline: 'A little tea, a little joy.', photo: 'tea', x: 65, y: 42 },
  { id: 'moonbird', name: 'Moonbird Coffee', type: 'Coffee shop', category: 'coffee', rating: '4.8', reviews: 218, distance: '0.4 mi', minutes: 3, closes: '6 pm', address: '5394 New Peachtree Rd, Doraville', color: 'tan', tagline: 'Good coffee. A slower morning.', photo: 'coffee', x: 32, y: 55 },
  { id: 'whitewind', name: 'White Windmill', type: 'Bakery & café', category: 'coffee', rating: '4.6', reviews: 86, distance: '0.8 mi', minutes: 5, closes: '9 pm', address: '5881 Buford Hwy, Doraville', color: 'cream', tagline: 'Something warm, freshly baked.', photo: 'bakery', x: 76, y: 69 },
  { id: 'gogi', name: 'Miss Gogi', type: 'Korean barbecue', category: 'food', rating: '4.6', reviews: 342, distance: '0.9 mi', minutes: 5, closes: '10 pm', address: '6035 Peachtree Rd, Doraville', color: 'peach', tagline: 'Good food, better company.', photo: 'food', x: 57, y: 35 },
  { id: 'kura', name: 'Kura Revolving Sushi', type: 'Sushi restaurant', category: 'food', rating: '4.5', reviews: 629, distance: '1.1 mi', minutes: 7, closes: '10 pm', address: '6035 Peachtree Rd, Doraville', color: 'pink', tagline: 'Your next favorite bite.', photo: 'food', x: 72, y: 58 },
  { id: 'autumn', name: 'Autumn Park', type: 'Neighborhood park', category: 'parks', rating: '4.8', reviews: 72, distance: '0.6 mi', minutes: 4, closes: '8 pm', address: '3100 Autumn Dr, Doraville', color: 'green', tagline: 'A little room to breathe.', photo: 'park', x: 24, y: 30 },
  { id: 'honeysuckle', name: 'Honeysuckle Park', type: 'Park & walking trail', category: 'parks', rating: '4.7', reviews: 151, distance: '1.3 mi', minutes: 8, closes: '8 pm', address: '3037 Pleasant Valley Dr, Doraville', color: 'green', tagline: 'Take the long way around.', photo: 'park', x: 84, y: 25 },
];
export const widgets = [
  { id: 'search', number: '01', title: 'Search', subtitle: 'A place to start', group: 'discover', icon: 'search' },
  { id: 'explore', number: '02', title: 'Explore nearby', subtitle: 'Find your next favorite', group: 'discover', icon: 'explore' },
  { id: 'place', number: '03', title: 'Place details', subtitle: 'The essentials, at a glance', group: 'discover', icon: 'pin' },
  { id: 'directions', number: '04', title: 'Directions', subtitle: 'A better way to get there', group: 'travel', icon: 'directions' },
  { id: 'navigation', number: '05', title: 'Navigation', subtitle: 'One turn at a time', group: 'travel', icon: 'navigation' },
  { id: 'saved', number: '06', title: 'Saved places', subtitle: 'Keep the good ones close', group: 'saved', icon: 'bookmark' },
];
export const travelModes = {
  drive: { label: 'Drive', icon: 'car', multiplier: 1, distance: '1.6 mi', via: 'Peachtree Rd', description: 'Fastest route · usual traffic' },
  walk: { label: 'Walk', icon: 'walk', multiplier: 3, distance: '1.0 mi', via: 'New Peachtree Rd', description: 'Mostly flat · sidewalks' },
  transit: { label: 'Transit', icon: 'train', multiplier: 2, distance: '1.8 mi', via: 'Bus 39', description: 'Departs in 4 min · $2.50' },
};
