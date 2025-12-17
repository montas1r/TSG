import type { Garden } from './types';

export const initialGarden: Garden = [
  {
    id: 'stem-1',
    name: 'Frontend Development',
    leaves: [
      {
        id: 'leaf-1-1',
        stemId: 'stem-1',
        name: 'HTML',
        masteryLevel: 100,
        notes: 'The backbone of the web. Semantic HTML is crucial for accessibility.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      },
      {
        id: 'leaf-1-2',
        stemId: 'stem-1',
        name: 'CSS',
        masteryLevel: 85,
        notes: 'Styling the web. Flexbox and Grid are my favorite features.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      },
      {
        id: 'leaf-1-3',
        stemId: 'stem-1',
        name: 'JavaScript',
        masteryLevel: 75,
        notes: 'The language of the web. Exploring modern ES features.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      },
       {
        id: 'leaf-1-4',
        stemId: 'stem-1',
        name: 'React',
        masteryLevel: 60,
        notes: 'Building user interfaces with components.',
        link: 'https://react.dev/',
      },
    ],
  },
  {
    id: 'stem-2',
    name: 'Backend Development',
    leaves: [
      {
        id: 'leaf-2-1',
        stemId: 'stem-2',
        name: 'Node.js',
        masteryLevel: 40,
        notes: 'JavaScript on the server. Great for building fast and scalable network applications.',
        link: 'https://nodejs.org/',
      },
      {
        id: 'leaf-2-2',
        stemId: 'stem-2',
        name: 'Databases',
        masteryLevel: 25,
        notes: 'Learning about both SQL (PostgreSQL) and NoSQL (Firestore) databases.',
        link: '',
      },
    ],
  },
  {
    id: 'stem-3',
    name: 'Design Principles',
    leaves: [
      {
        id: 'leaf-3-1',
        stemId: 'stem-3',
        name: 'UI/UX Fundamentals',
        masteryLevel: 90,
        notes: 'User-centered design is key. Focus on empathy and usability testing.',
        link: '',
      },
      {
        id: 'leaf-3-2',
        stemId: 'stem-3',
        name: 'Color Theory',
        masteryLevel: 10,
        notes: 'Just getting started with the basics of color theory.',
        link: '',
      },
    ],
  },
];
