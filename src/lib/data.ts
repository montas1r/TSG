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
        masteryLevel: 100, // This will be calculated
        notes: 'The backbone of the web. Semantic HTML is crucial for accessibility.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        quests: {
          learn: { text: 'Read MDN docs on semantic HTML', completed: true },
          practice: { text: 'Build a complex form', completed: true },
          prove: { text: 'Get a 100 on Lighthouse accessibility', completed: true },
        },
      },
      {
        id: 'leaf-1-2',
        stemId: 'stem-1',
        name: 'CSS',
        masteryLevel: 70, // This will be calculated
        notes: 'Styling the web. Flexbox and Grid are my favorite features.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
        quests: {
          learn: { text: 'Complete a course on Flexbox and Grid', completed: true },
          practice: { text: 'Replicate a complex website layout', completed: true },
          prove: { text: 'Build a responsive dashboard', completed: false },
        },
      },
      {
        id: 'leaf-1-3',
        stemId: 'stem-1',
        name: 'JavaScript',
        masteryLevel: 30, // This will be calculated
        notes: 'The language of the web. Exploring modern ES features.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        quests: {
          learn: { text: 'Understand async/await and promises', completed: true },
          practice: { text: 'Build a small app with API calls', completed: false },
          prove: { text: 'Contribute to an open-source JS project', completed: false },
        },
      },
       {
        id: 'leaf-1-4',
        stemId: 'stem-1',
        name: 'React',
        masteryLevel: 10, // This will be calculated
        notes: 'Building user interfaces with components.',
        link: 'https://react.dev/',
        quests: {
          learn: { text: 'Follow the official React tutorial', completed: false },
          practice: { text: 'Build a "to-do" list app', completed: false },
          prove: { text: 'Deploy a multi-page React app', completed: false },
        },
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
        masteryLevel: 10,
        notes: 'JavaScript on the server. Great for building fast and scalable network applications.',
        link: 'https://nodejs.org/',
        quests: {
          learn: { text: 'Create a simple Express server', completed: false },
          practice: { text: 'Build a REST API', completed: false },
          prove: { text: 'Integrate with a database', completed: false },
        },
      },
      {
        id: 'leaf-2-2',
        stemId: 'stem-2',
        name: 'Databases',
        masteryLevel: 10,
        notes: 'Learning about both SQL (PostgreSQL) and NoSQL (Firestore) databases.',
        link: '',
        quests: {
          learn: { text: 'Understand primary keys and foreign keys', completed: false },
          practice: { text: 'Design a schema for a simple app', completed: false },
          prove: { text: 'Perform complex queries with joins', completed: false },
        },
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
        masteryLevel: 30,
        notes: 'User-centered design is key. Focus on empathy and usability testing.',
        link: '',
        quests: {
          learn: { text: 'Read "Don\'t Make Me Think"', completed: true },
          practice: { text: 'Create a user flow diagram', completed: false },
          prove: { text: 'Conduct a usability test', completed: false },
        },
      },
      {
        id: 'leaf-3-2',
        stemId: 'stem-3',
        name: 'Color Theory',
        masteryLevel: 10,
        notes: 'Just getting started with the basics of color theory.',
        link: '',
        quests: {
          learn: { text: 'Learn about the color wheel', completed: false },
          practice: { text: 'Create a palette on coolors.co', completed: false },
          prove: { text: 'Apply a consistent color system to a project', completed: false },
        },
      },
    ],
  },
];
