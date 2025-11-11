# Contributing Guide

Thank you for your interest in contributing to this project!
We welcome contributions of all kinds: bug fixes, features, documentation improvements, UI polishing, etc.

Please take a moment to follow the guidelines below to ensure a smooth and consistent contribution process.

---

## Workflow Overview

1. **Pick an Issue**

    * Choose an existing issue in the GitHub Issues tab.
    * If your contribution is not tied to an existing issue, create one first to describe the goal and allow discussion.

2. **Create a Branch**

    * Always branch off from the `dev` branch.
    * Use the following naming convention:

      ```
      feature/short-description
      fix/short-description
      chore/short-description
      ```

      Example:

      ```
      feature/add-daily-aggregates
      fix/incorrect-humidity-scale
      ```

3. **Develop Your Changes**

    * Follow the **Clean Code** and **UI Consistency** guidelines below.
    * Test your changes locally and verify there are no regressions or unintended side effects.

4. **Open a Pull Request**

    * Create a PR **into `dev`**, not `main`.
    * Link the PR to the issue it resolves.
    * Describe what was changed, why, and how to test it.
    * Request review.

5. **Review & Merge**

    * Once approved, the PR will be merged into `dev`.
    * Releases to `main` are handled by maintainers.

---

## Clean Code Guidelines

Please maintain code clarity, readability and consistency:

* **Do not repeat yourself** — if a utility, component, or function already exists, reuse it.
* Favor **modular and reusable components** over one-off implementations.
* Use **clear and descriptive naming**.
* Write code that is easy to understand and maintain.
* Keep functions small and focused on a single task.
* **Indentation:** use **4 spaces**, not 2 tabs or 2 spaces.
* Add comments when logic is not obvious.
* Prefer pure functions and avoid unnecessary side effects.

Before submitting a PR:

* Test your changes thoroughly.
* Consider potential edge cases and side effects.

---

## UI / Design Consistency

When contributing UI changes:

* Follow the **existing design direction** and tone of the interface.
* Use **Tailwind CSS** utility classes for styling.
* Use **shadcn/ui components** where applicable.
* Respect the project’s **color scheme** and spacing rhythm.
* Keep components accessible and responsive.

If introducing new UI patterns, discuss them in an issue before implementing.

---

## Testing & Quality Checks

* Ensure your code **compiles** (`pnpm run build`) and runs without warnings or errors.
* If your change affects data ingestion, aggregation, or dashboard display, test:

    * multiple terrariums
    * extreme or unusual sensor values
    * temporary network failures (for device communication)

---

## Setting Up the Project Locally

### Prerequisites

* Node.js (LTS recommended)
* pnpm / npm / yarn (project uses `pnpm` recommended)
* MongoDB instance (local or remote)

### Installation

```bash
git clone https://github.com/BenoitPrmt/terrarium-monitor.git
cd terrarium-monitor

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env.local
# Update .env.local with your credentials (auth, database, etc.)

# Start the dev server
pnpm dev
```

The project should now be available at:
```
http://localhost:4000
```

---

## Communication

If you are unsure about anything — **ask first** by commenting on the issue.
It’s much easier to clarify direction early than to redo work later.

---

## Thank You

Your contributions help improve the project for everyone.
Thank you for taking the time to follow these guidelines and for helping build something great. ❤️
