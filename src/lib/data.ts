import type { Garden, Quest } from './types';

export const initialGarden: Garden = [
  {
    id: 'stem-1',
    name: 'Frontend Development',
    leaves: [
      {
        id: 'leaf-1-1',
        stemId: 'stem-1',
        name: 'HTML',
        masteryLevel: 0, // This will be calculated
        notes: 'The backbone of the web. Semantic HTML is crucial for accessibility.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        quests: [
          { id: 'q1-1-1', text: 'Read MDN docs on semantic HTML', completed: true },
          { id: 'q1-1-2', text: 'Build a complex form', completed: true },
          { id: 'q1-1-3', text: 'Get a 100 on Lighthouse accessibility', completed: true },
        ],
      },
      {
        id: 'leaf-1-2',
        stemId: 'stem-1',
        name: 'CSS',
        masteryLevel: 0, // This will be calculated
        notes: 'Styling the web. Flexbox and Grid are my favorite features.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
        quests: [
          { id: 'q1-2-1', text: 'Complete a course on Flexbox and Grid', completed: true },
          { id: 'q1-2-2', text: 'Replicate a complex website layout', completed: true },
          { id: 'q1-2-3', text: 'Build a responsive dashboard from scratch', completed: false },
        ],
      },
      {
        id: 'leaf-1-3',
        stemId: 'stem-1',
        name: 'JavaScript',
        masteryLevel: 0, // This will be calculated
        notes: 'The language of the web. Exploring modern ES features.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        quests: [
          { id: 'q1-3-1', text: 'Understand async/await and promises deeply', completed: true },
          { id: 'q1-3-2', text: 'Build a small app with multiple API calls', completed: false },
          { id: 'q1-3-3', text: 'Contribute to an open-source JS project', completed: false },
        ],
      },
       {
        id: 'leaf-1-4',
        stemId: 'stem-1',
        name: 'React',
        masteryLevel: 0, // This will be calculated
        notes: 'Building user interfaces with components.',
        link: 'https://react.dev/',
        quests: [
            { id: 'q1-4-1', text: 'Follow the official React tutorial', completed: true },
            { id: 'q1-4-2', text: 'Build a "to-do" list app with state management', completed: false },
            { id: 'q1-4-3', text: 'Deploy a multi-page React app to Netlify', completed: false },
        ],
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
        masteryLevel: 0,
        notes: 'JavaScript on the server. Great for building fast and scalable network applications.',
        link: 'https://nodejs.org/',
        quests: [
            { id: 'q2-1-1', text: 'Create a simple Express server', completed: true },
            { id: 'q2-1-2', text: 'Build a REST API with CRUD operations', completed: false },
            { id: 'q2-1-3', text: 'Integrate with a PostgreSQL database', completed: false },
        ],
      },
      {
        id: 'leaf-2-2',
        stemId: 'stem-2',
        name: 'Databases',
        masteryLevel: 0,
        notes: 'Learning about both SQL (PostgreSQL) and NoSQL (Firestore) databases.',
        link: '',
        quests: [
            { id: 'q2-2-1', text: 'Understand primary keys vs foreign keys', completed: false },
            { id: 'q2-2-2', text: 'Design a schema for a social media app', completed: false },
        ],
      },
    ],
  },
];
