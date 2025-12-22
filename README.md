
# Welcome to Your Skill Garden: A Deep Dive

Welcome to Skill Garden, your personal space to cultivate new talents, track your progress, and watch your abilities grow. This guide will walk you through every feature of the app, explaining both how to use it and how it works under the hood.

## Table of Contents
1.  [Getting Started](#getting-started)
2.  [Core Concepts](#core-concepts)
    -   [Stems: Your Skill Categories](#stems-your-skill-categories)
    -   [Leaves: Your Individual Skills](#leaves-your-individual-skills)
    -   [Quests: Your Actionable Steps](#quests-your-actionable-steps)
    -   [Mastery Level: Tracking Progress](#mastery-level-tracking-progress)
3.  [The User Interface (UI/UX)](#the-user-interface-uiux)
    -   [Main Dashboard Layout](#main-dashboard-layout)
    -   [The Collapsible Sidebar](#the-collapsible-sidebar)
    -   [The Main Content Area](#the-main-content-area)
    -   [The Skill Details Sheet](#the-skill-details-sheet)
4.  [How Features Work](#how-features-work)
    -   [Planting & Editing Stems/Leaves](#planting--editing-stemsleaves)
    -   [Managing Quests (Drag-and-Drop)](#managing-quests-drag-and-drop)
    -   [Search Functionality](#search-functionality)
5.  [The Animation System](#the-animation-system)
6.  [The AI Suggestion Engine (Free Forever)](#the-ai-suggestion-engine-free-forever)

---

## Getting Started

When you first open the app, you'll be greeted by the welcome screen.

-   **Sign In Anonymously:** Simply click the **"Sign In Anonymously"** button. This creates a private, anonymous account for you using Firebase Authentication, allowing you to start building your garden immediately without needing an email or password. Your data is securely stored and tied to this anonymous account.

## Core Concepts

Your Skill Garden is organized like a plant, with a clear hierarchy for learning.

### Stems: Your Skill Categories

A **Stem** is a major category or area of interest you want to develop. Think of it as a main branch of your skill plant.
-   **Examples:** "Web Development", "Creative Writing", "Data Science", "Digital Marketing".
-   Each Stem has a unique name, description, icon, and color to help you identify it.

### Leaves: Your Individual Skills

A **Leaf** represents a single, specific skill you want tolearn that belongs to a Stem.
-   **Examples:** If your Stem is "Web Development", your Leaves might be "Learn React Hooks", "Master CSS Flexbox", or "Build a REST API".

### Quests: Your Actionable Steps

A **Quest** is a small, concrete task or goal you set for yourself to master a Leaf. Breaking a skill down into quests makes learning more manageable.
-   **Example:** For the "Learn React Hooks" Leaf, your Quests could be "Complete the `useState` tutorial", "Build a component with `useEffect`", and "Read about the `useContext` hook".

### Mastery Level: Tracking Progress

The Mastery Level of a Leaf is calculated automatically based on the percentage of Quests you have completed for it. This gives you a clear visual indicator of how far you've come. The Stem's overall mastery is the average of all its Leaves.

---

## The User Interface (UI/UX)

The app is designed to be clean, intuitive, and responsive, using ShadCN UI components and Tailwind CSS for styling.

### Main Dashboard Layout

The main view is a two-panel layout: a `Sidebar` on the left for navigation and a `Main Content Area` on the right to display the details of your selected skill category. This entire layout is wrapped in a centered container (`max-w-screen-2xl mx-auto`) to ensure it looks great on all screen sizes.

### The Collapsible Sidebar

The sidebar is your garden's control center.

-   **Toggle View:** You can collapse and expand the sidebar using the `PanelLeftClose` / `PanelLeftOpen` button. This is animated smoothly using `framer-motion`.
-   **User Profile:** At the bottom, it displays your user information (or "Anonymous User").
-   **Stem List:** The main area of the sidebar lists all your Stems. Each `StemItem` shows the Stem's icon, name, and the number of skills.
    -   **Animated Progress Bar:** A beautiful gradient progress bar (`AnimatedStemProgress`) shows the average mastery of all skills within that Stem. The gradient and width are animated with `framer-motion` as your progress changes.
-   **Action Buttons:**
    -   **New Stem:** Opens a dialog (`AddStemDialog`) to create a new skill category.
    -   **Get Suggestions:** Opens the AI-powered suggestion dialog (`SuggestionDialog`) to discover new skill bundles.
-   **Search Bar:** A powerful search bar at the top lets you instantly find Stems, Leaves, or even specific Quests.

### The Main Content Area

This area dynamically displays the content of the selected Stem.

-   **Empty State:** If no Stem is selected (or you have no Stems), you're greeted with a welcome message and buttons to "Plant Your First Stem" or "Get AI Suggestions".
-   **Stem View:** When a Stem is selected, its header displays the name, description, and action buttons.
    -   **Leaves Carousel:** Your skills (Leaves) are displayed in a horizontal carousel (`embla-carousel-react`). This allows you to have many skills in a category without cluttering the UI. Each `Leaf` is a clickable icon that opens the detail view.
    -   **Action Buttons:** The header provides quick access to:
        - **Edit:** Opens the `EditStemDialog` to change the Stem's details.
        - **Suggest:** Opens the `SuggestSkillsDialog` to get AI-powered skill ideas for *this specific Stem*.
        - **New Skill:** Opens the `AddLeafDialog` to manually add a new skill.
        - **More Options (⋮):** A dropdown menu to delete the entire Stem (with a confirmation alert).

### The Skill Details Sheet

Clicking on a Leaf in the carousel opens a bottom sheet (`Sheet` component from ShadCN) with all the details for that skill.

-   **Editable Title:** Click the pencil icon to edit the skill's name directly.
-   **Mastery Progress:** A `Progress` bar at the top shows your completion percentage for this skill's quests.
-   **Quest Management:**
    -   Add new quests with the `+ Add Quest` button.
    -   Check off quests to update your mastery level.
    -   Click quest text to edit it inline.
    -   Reorder quests via drag-and-drop, powered by `dnd-kit`.
-   **AI Quest Suggestions:** Click the "Suggest" button with the `Wand2` icon to have the AI generate a list of relevant quests for you.
-   **Notes & Reflections:** A `Textarea` is provided to jot down notes, thoughts, or code snippets related to the skill.
-   **Deletion:** A trash can icon allows you to delete the skill.

---

## How Features Work

### Planting & Editing Stems/Leaves

-   All data (Stems, Leaves, Quests) is stored in **Firestore** under a user-specific path (`/users/{userId}/...`), ensuring your data is private and secure.
-   When you add or edit an item, the app uses functions like `setDoc` or `updateDoc` to save the changes to the database in real-time.
-   The UI is reactive, using the `useCollection` hook to listen for database changes and automatically update what you see on the screen.

### Managing Quests (Drag-and-Drop)

-   The quest list in the `LeafDetails` sheet uses the `@dnd-kit` library to enable reordering.
-   When you drag and drop a quest, the `handleDragEnd` function calculates the new order and updates the `quests` array in the component's state.
-   A debounced `onSave` function then pushes this updated array to Firestore, persisting your new order.

### Search Functionality

-   Search is implemented client-side for speed using the **`fuse.js`** library.
-   A `useMemo` hook prepares a flat array of all searchable items (Stems, Leaves, and Quests).
-   As you type in the search bar, `fuse.js` performs a fuzzy search on this array, and the results are displayed instantly in the sidebar.

---

## The Animation System

The app uses **`framer-motion`** to create a fluid and polished user experience.

-   **Sidebar:** The `motion.aside` component animates its width when collapsing and expanding. Internal elements use `AnimatePresence` and `motion.div` to gracefully fade and slide in and out.
-   **Progress Bars:** `motion.div` is used in `AnimatedStemProgress` to animate the width of the progress bar when the mastery value changes, providing satisfying visual feedback.
-   **Dialogs & Sheets:** ShadCN components have built-in animations, which are powered by `tailwindcss-animate` and CSS keyframes, giving them a smooth entrance and exit.

---

## The AI Suggestion Engine (Free Forever)

The most powerful feature of Skill Garden is its AI-powered suggestion engine, which is implemented using a **completely free, zero-cost** solution.

-   **Technology:** Instead of a paid service, the app uses the **Hugging Face Inference API**. This allows it to access powerful open-source language models without any API keys, subscriptions, or rate limits for typical use.
-   **Model:** The app primarily uses `mistralai/Mistral-7B-Instruct-v0.2`, a high-quality, free-to-use model hosted by Hugging Face.
-   **How It Works:**
    1.  When you request suggestions (for new bundles or quests), the client-side component makes a `fetch` request to a Next.js API route (`/api/ai/suggest`).
    2.  This API route is the *only* part of the app that runs on the server. It securely holds the Hugging Face logic.
    3.  The API route imports functions from `src/lib/google-ai.ts` (the filename is a remnant of a previous implementation, but it now contains Hugging Face logic).
    4.  This file uses the `@huggingface/inference` client to construct a prompt based on your existing skills and sends it to the Mistral-7B model.
    5.  The model generates a list of suggestions. The API route parses the model's text response to extract the clean JSON data.
    6.  The JSON data is sent back to your client, where it's displayed in the suggestion dialog.

This setup ensures that the AI features are not only powerful but also sustainable and completely free for you to use, forever.
