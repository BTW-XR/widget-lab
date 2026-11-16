// Fictional creators and metrics. Every media file is a short, local demo clip.
export const channels = [
  { id: 'elsewhere', name: 'Somewhere Else', handle: '@somewhereelse', initials: 'se', color: '#e6d6bc', ink: '#695338', subscribers: '128K', bio: 'Slow journeys. Small discoveries. A different point of view.' },
  { id: 'form', name: 'Form & Function', handle: '@formandfunction', initials: 'f.', color: '#dcded7', ink: '#52594c', subscribers: '84.2K', bio: 'The spaces, shapes, and quiet details that make everyday life better.' },
  { id: 'field', name: 'Field Notes', handle: '@fieldnotes', initials: 'fn', color: '#dae4ce', ink: '#536b41', subscribers: '62.8K', bio: 'A closer look at the little things. Take a breath and stay curious.' },
];
export const videos = [
  { id: 'kyoto', title: 'Getting lost in Kyoto, on purpose', channel: 'elsewhere', category: 'Travel', image: 'japan', duration: 12, views: '42K', age: '2 days ago', likes: '2.1K', description: 'Take the quieter street. Find a little light. A short visual escape through Kyoto’s old neighborhood.', tag: 'A DIFFERENT PACE', headline: 'Take the long way home.' },
  { id: 'architecture', title: 'The art of looking up', channel: 'form', category: 'Design', image: 'architecture', duration: 12, views: '18K', age: '1 day ago', likes: '936', description: 'A new perspective on familiar places. Glass, geometry, and the city above us.', tag: 'EVERYDAY DESIGN', headline: 'A new point of view.' },
  { id: 'ocean', title: 'Nothing to do. Nowhere to be.', channel: 'elsewhere', category: 'Travel', image: 'coast', duration: 12, views: '67K', age: '5 days ago', likes: '3.4K', description: 'A little room to breathe. Twelve quiet seconds at the water’s edge.', tag: 'SLOW MOMENTS', headline: 'Stay a little longer.' },
  { id: 'space', title: 'Less, but better: a space to think', channel: 'form', category: 'Design', image: 'desk', duration: 12, views: '24K', age: '3 days ago', likes: '1.8K', description: 'Simple shapes, soft light, and a space for your next good idea.', tag: 'LESS, BUT BETTER', headline: 'Make room for a good idea.' },
  { id: 'bloom', title: 'A five-second reset, in full bloom', channel: 'field', category: 'Nature', image: 'flower', duration: 5, views: '91K', age: '6 hours ago', likes: '4.7K', description: 'Look a little closer. A tiny moment of life in the garden, filmed in motion.', tag: 'LITTLE WONDERS', headline: 'The small things.' },
];
export const shorts = ['bloom', 'kyoto', 'ocean'];
export const widgets = [
  { id: 'search', number: '01', title: 'Search', caption: 'Follow a little curiosity', group: 'discover', icon: 'search' },
  { id: 'discover', number: '02', title: 'For you', caption: 'Your next good watch', group: 'discover', icon: 'home' },
  { id: 'player', number: '03', title: 'Now playing', caption: 'A moment, uninterrupted', group: 'watch', icon: 'play' },
  { id: 'shorts', number: '04', title: 'Shorts', caption: 'A little inspiration goes a long way', group: 'watch', icon: 'shorts' },
  { id: 'subscriptions', number: '05', title: 'Subscriptions', caption: 'More from your kind of people', group: 'library', icon: 'subscriptions' },
  { id: 'later', number: '06', title: 'Watch later', caption: 'Good things are worth saving', group: 'library', icon: 'clock' },
];
export const getVideo = id => videos.find(video => video.id === id) || videos[0];
export const getChannel = id => channels.find(channel => channel.id === id) || channels[0];
export const mediaPath = video => `./assets/youtube/${video.image}.mp4`;
export const imagePath = video => `./assets/youtube/${video.image}.jpg`;
export const formatTime = seconds => `${Math.floor((Number(seconds) || 0) / 60)}:${String(Math.floor((Number(seconds) || 0) % 60)).padStart(2, '0')}`;
