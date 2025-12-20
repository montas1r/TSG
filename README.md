# Welcome to Your Skill Garden: A User Manual

Welcome to Skill Garden, your personal space to cultivate new talents, track your progress, and watch your abilities grow. This guide will walk you through every feature of the app.

## Table of Contents
1.  [Getting Started](#getting-started)
2.  [Core Concepts](#core-concepts)
    -   [Stems: Your Skill Categories](#stems-your-skill-categories)
    -   [Leaves: Your Individual Skills](#leaves-your-individual-skills)
    -   [Quests: Your Actionable Steps](#quests-your-actionable-steps)
    -   [Mastery Level: Tracking Progress](#mastery-level-tracking-progress)
3.  [Using the Garden](#using-the-garden)
    -   [Planting Your First Stem](#planting-your-first-stem)
    -   [Getting AI-Powered Suggestions](#getting-ai-powered-suggestions)
    -   [Adding a New Leaf (Skill)](#adding-a-new-leaf-skill)
    -   [Working with a Skill (The Detail View)](#working-with-a-skill-the-detail-view)
    -   [Editing and Deleting Stems](#editing-and-deleting-stems)
    -   [Searching Your Garden](#searching-your-garden)
4.  [The Secret Feature](#the-secret-feature)

---

## Getting Started

When you first open the app, you'll be greeted by the welcome screen.

-   **Sign In Anonymously:** Simply click the **"Sign In Anonymously"** button. This creates a private account for you on the device, allowing you to start building your garden immediately without needing an email or password.

## Core Concepts

Your Skill Garden is organized like a plant.

### Stems: Your Skill Categories

A **Stem** is a major category or area of interest you want to develop. Think of it as a main branch of your skill plant.
-   **Examples:** "Web Development", "Creative Writing", "Data Science", "Digital Marketing".
-   Each Stem has a unique name, description, icon, and color to help you identify it.

### Leaves: Your Individual Skills

A **Leaf** represents a single, specific skill you want to learn that belongs to a Stem.
-   **Examples:** If your Stem is "Web Development", your Leaves might be "Learn React Hooks", "Master CSS Flexbox", or "Build a REST API".

### Quests: Your Actionable Steps

A **Quest** is a small, concrete task or goal you set for yourself to master a Leaf. Breaking a skill down into quests makes learning more manageable.
-   **Example:** For the "Learn React Hooks" Leaf, your Quests could be "Complete the `useState` tutorial", "Build a component with `useEffect`", and "Read about the `useContext` hook".

### Mastery Level: Tracking Progress

The Mastery Level of a Leaf is calculated automatically based on the percentage of Quests you have completed for it. This gives you a clear visual indicator of how far you've come. The Stem's overall mastery is the average of all its Leaves.

---

## Using the Garden

### Planting Your First Stem

If your garden is empty, you'll be prompted to create your first Stem.
1.  Click the **"Plant Your First Stem"** button.
2.  In the dialog, give your Stem a **name** (e.g., "Graphic Design").
3.  Optionally, add a **description**.
4.  Click the icon and color buttons to **customize its appearance**.
5.  Click **"Plant Stem"**. Your new category will appear in the left-hand sidebar.

### Getting AI-Powered Suggestions

Don't know where to start? Let our AI help you!
1.  Click the **"Get Suggestions"** button (or **"Get AI Suggestions"** if your garden is empty).
2.  Our AI will analyze your existing skills (or provide popular starting points if you have none) and suggest "Skill Bundles".
3.  Each bundle is a pre-packaged Stem with several beginner-friendly Leaves.
4.  Browse the suggestions in the accordion and click **"Plant this Bundle"** to add it directly to your garden.

### Adding a New Leaf (Skill)

Once you have a Stem, you can add skills to it.
1.  Select the desired Stem from the left sidebar.
2.  Click the **plus icon (+)** in the header or the **"Plant a Skill"** button if the stem is empty.
3.  In the dialog, enter the name of the skill you want to learn.
4.  Click **"Plant Skill"**. The new Leaf will appear in the horizontal scrolling area.

### Working with a Skill (The Detail View)

Click on any Leaf in the horizontal scroller to open its detail panel. This is where you manage your learning process.

-   **Editing the Skill Name:** Click the **pencil icon** next to the skill's name. The title will become an editable text field. Type your new name and press Enter or click away to save.
-   **Adding Quests:** Click the **"+ Add Quest"** button to create a new task. An input field will appear.
-   **Completing Quests:** Simply click the **checkbox** next to a quest to mark it as complete. Watch your Mastery Level progress bar fill up!
-   **Editing Quests:** Click directly on the quest text to edit it. Changes are saved automatically when you click away.
-   **Reordering Quests:** Click and hold the **grip icon (⋮)** to the left of a quest and drag it up or down to change its order.
-   **Adding Notes & Links:** Use the "Notes & Reflections" and "Resource Link" fields to jot down thoughts, code snippets, or link to helpful articles and tutorials.
-   **Deleting a Skill:** Click the red **trash can icon** in the top-right corner of the detail panel to permanently remove the skill.

### Editing and Deleting Stems

1.  Select the Stem you wish to manage from the sidebar.
2.  Click the **vertical dots (⋮)** in the header.
3.  - **Edit Stem:** This opens a dialog where you can change the Stem's name, description, icon, and color.
    - **Delete Stem:** This will permanently remove the Stem and **all the Leaves and Quests within it**. A confirmation will be required.

### Searching Your Garden

Use the **search bar** at the top of the left sidebar to instantly find what you're looking for. You can search for:
-   Stem names
-   Leaf names
-   Quest text

The results are categorized to help you quickly navigate to the right item.

## The Secret Feature

The most powerful function in the Skill Garden is the **AI-powered suggestion engine**. Located in `src/ai/flows/suggest-related-skills.ts`, this "secret" function uses a powerful Google AI model to act as your personal learning coach, providing intelligent and relevant skill recommendations based on your unique journey.

Happy gardening! We hope you enjoy watching your skills flourish.