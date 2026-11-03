# Task Manager

A task manager built with Next.js, React, and tRPC. Create, edit, and delete tasks, then browse the list with cursor-based pagination and infinite scrolling.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white)](https://trpc.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

> **Storage notice:** Tasks are stored in memory and the API is public. This project is intended for local use and demos, not for storing personal or sensitive information or for deployment as a multi-user service.

## Features

- Server-rendered task list with hydrated client-side queries
- Create and edit tasks with shared validation, inline errors, and character counters
- Delete tasks after confirmation, with toast feedback
- Cursor-based pagination with automatic loading and a keyboard-accessible “Load more” button
- Loading, empty, and recoverable error states
- Responsive light and dark themes, keyboard focus indicators, and reduced-motion support

## Technology

- Next.js 16 App Router and React 19
- TypeScript with strict checking
- tRPC 11, TanStack Query 5, and Zod 4
- Tailwind CSS 4, Lucide React, and Sonner
- Vitest, jsdom, and Testing Library

## Requirements

- Node.js 20.9 or newer
- pnpm 12.16.1 (the version declared in `package.json`)

No environment variables are required for local development.

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/mariana-reis/nextjs-trpc-task-manager.git
```

### 2. Open the project folder

```bash
cd nextjs-trpc-task-manager
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app starts with 25 fictional sample tasks so pagination is visible immediately.

## Available commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm test` | Run the test suite once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests and generate coverage reports |

The coverage summary is printed in the terminal. The HTML report is available at `coverage/index.html`.

## Project structure

```text
app/
├── api/trpc/[trpc]/route.ts      tRPC HTTP endpoint
├── tasks/
│   ├── new/page.tsx              create task
│   └── [id]/
│       ├── page.tsx              edit task
│       └── edit/page.tsx         edit route alias
├── globals.css                   theme tokens and global styles
├── layout.tsx                    root layout and providers
└── page.tsx                      task list and server-side data loading
components/
├── ui/                           shared interface components
└── ...                           task list, forms, and views
data/                             in-memory store and sample data
hooks/                            mutation and intersection-observer hooks
lib/                              tRPC clients, query client, and providers
server/api/                       tRPC context, router, and procedures
types/                            task types and Zod schemas
utils/                            formatting, errors, styles, and constants
```

Tests are colocated with the code they cover in `*.test.ts` and `*.test.tsx` files. Vitest uses jsdom and two workers.

## How it works

### Data and validation

The task router receives its store through the tRPC context. `createTaskStore()` provides an isolated in-memory store, while the application uses a seeded singleton. Zod schemas in `types/task.ts` are shared by the form and API, so titles, descriptions, IDs, and pagination parameters are validated at the boundary.

The `task.list` procedure returns `{ items, nextCursor }`. The cursor is based on the last task’s creation time, and timestamps created by the store are kept strictly increasing to support pagination.

### Server rendering and client queries

The home page loads the first task page on the server by calling the tRPC router directly, then hydrates the TanStack Query cache for the client. Browser requests use tRPC’s `httpBatchLink` and the `/api/trpc` route. The edit page similarly loads its task on the server; the client view handles loading and error states.

### Infinite scrolling

An `IntersectionObserver` watches a sentinel near the end of the list and requests another page when needed. A “Load more” button provides a manual, keyboard-accessible alternative. While a page is loading, the list exposes its busy state and a loading indicator.

## API procedures

| Procedure | Type | Purpose |
| --- | --- | --- |
| `task.list` | Query | Return a page of tasks |
| `task.byId` | Query | Find a task for the edit view |
| `task.create` | Mutation | Create a task |
| `task.update` | Mutation | Update a task |
| `task.delete` | Mutation | Delete a task |

Input validation errors are flattened by the tRPC error formatter so the client can show useful messages near the relevant fields.

## Tests and coverage

Run the tests and generate a coverage report with:

```bash
pnpm test:coverage
```

The suite covers the store and pagination, Zod schemas, router procedures and error formatting, UI components, forms, mutation hooks, and intersection-observer behavior. The most recent coverage run reported 100% statement, branch, function, and line coverage. Coverage measures execution, not correctness by itself.

## Limitations

- In-memory tasks are lost when the server process restarts and are not shared across server instances.
- API procedures are public and have no authentication, authorization, or rate limiting.
- Mutations invalidate and reload task queries rather than updating the cache optimistically.
- The project has unit and component tests, but no end-to-end tests.
