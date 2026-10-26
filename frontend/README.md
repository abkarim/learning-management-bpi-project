# Learning Management Frontend

This is the frontend application for the Learning Management Platform. It is built with React, TypeScript, Vite, and Tailwind CSS to provide a modern, responsive interface for managing courses, learners, dashboards, and administrative workflows.

## Tech Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- ESLint
- Lucide React (icons)
- Recharts (charts and analytics)
- date-fns and react-day-picker (date utilities)
- shadcn-style component structure in `src/components/ui`

This project uses a component-driven architecture and a lightweight design system, with shared UI primitives and utility helpers in the `src` folder.

## Prerequisites

Before running the app, make sure you have the following installed:

- Node.js 20 or newer
- npm 10 or newer

## Getting Started

From the `frontend` folder, install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

This will start Vite in development mode. By default, the app is usually available at:

```text
http://localhost:5173
```

If the port is changed because of a conflict, Vite will print the correct local URL in the terminal.

## Available Scripts

```bash
npm run dev
```
Runs the frontend in development mode with hot reloading.

```bash
npm run build
```
Creates a production build for deployment.

```bash
npm run preview
```
Serves the production build locally for testing.

```bash
npm run lint
```
Runs ESLint to check code quality and consistency.

## Project Structure

```text
frontend/
├── public/                 # Static assets
├── src/
│   ├── App.tsx            # Main app component
│   ├── index.css          # Global styling and Tailwind setup
│   ├── main.tsx           # App entry point
│   ├── assets/            # Images, icons, and other static resources
│   ├── components/
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/
│       └── utils.ts      # Utility helpers
├── package.json           # Scripts and dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite config with React + Tailwind setup
├── eslint.config.js       # ESLint config
├── index.html             # HTML entry point
└── README.md              # Frontend documentation
```

## Styling and UI

The app uses Tailwind CSS for layout and styling, with reusable UI building blocks organized under `src/components/ui`. The project also includes a utility helper for combining class names in `src/lib/utils.ts` and supports a clean design system built around reusable primitives and common patterns.

## Path Aliases

The project uses the `@` alias to point to the `src` directory. Example:

```ts
import { Button } from "@/components/ui/button";
```

This keeps imports cleaner and more maintainable.

## Development Workflow

1. Create or update components in `src/components`.
2. Keep page-level logic in `src/App.tsx` or feature-specific modules.
3. Reuse existing UI primitives instead of creating duplicate styles.
4. Validate with:

```bash
npm run lint
npm run build
```

5. Test the app locally with `npm run dev` before pushing changes.

## Environment Variables

This frontend currently does not require a custom environment file for local development. If the backend API URL or other runtime configuration is added later, it should be defined in a `.env` file using the `VITE_` prefix, for example:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Notes

- The frontend is designed to work alongside the backend service in the same project.
- Most daily work happens in the `src` directory, where components, styles, and utility logic are stored.
- The app is ready for extension with dashboards, authentication flows, course management, analytics, and admin screens.

## Recommended Workflow for Contributors

- Run `npm install` once after cloning the repo.
- Start with `npm run dev` for active development.
- Make small, focused UI changes.
- Run `npm run build` before finalizing work.
- Keep the codebase consistent with the existing project structure and naming patterns.

## Quick Start Summary

```bash
cd frontend
npm install
npm run dev
```

If you need to create a production build:

```bash
npm run build
```

This setup gives you a clean local development environment for the Learning Management frontend.
