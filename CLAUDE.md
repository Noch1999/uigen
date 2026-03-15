# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run db:reset     # Reset the database (destructive)
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

Environment setup: copy `.env.example` to `.env` and optionally add `ANTHROPIC_API_KEY`. The app works without it using a mock provider.

## Architecture

**UIGen** is an AI-powered React component generator with live preview. Users describe components in a chat interface; Claude generates and edits them via tool use with results previewed instantly.

### Data Flow

1. User sends a chat message via `ChatContext` (`useChat` hook from Vercel AI SDK)
2. Request hits `/api/chat/route.ts` with messages + serialized file system state
3. The route calls `streamText` with Claude (or mock provider), passing two tools: `str_replace_editor` and `file_manager`
4. Claude streams back text and tool calls; tool results update the virtual file system
5. On completion, the updated file system is saved to Prisma
6. The `FileSystemContext` applies changes client-side and the preview re-renders

### Key Abstractions

**Virtual File System** (`src/lib/file-system.ts`): An in-memory tree of files/directories. Serializes to JSON for persistence in the DB. No files are written to disk.

**Language Model Provider** (`src/lib/provider.ts`): Returns either the Anthropic Claude model or a deterministic mock. The mock enables development without an API key.

**AI Tools** (`src/lib/tools/`):
- `str-replace.ts` — precise in-place text replacement in virtual files (like a code editor)
- `file-manager.ts` — create, delete, rename files/directories in the virtual FS

**Generation Prompt** (`src/lib/prompts/generation.tsx`): System prompt that instructs Claude on how to generate React components, including JSX/TSX conventions and which tools to use.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Transforms JSX/TSX to plain JS in-browser (using `@babel/standalone`) so the preview iframe can execute it without a build step.

### Layout

`MainContent` (`src/app/main-content.tsx`) is the root UI shell:
- **Left panel (35%):** Chat — `ChatContext` drives message list and input
- **Right panel (65%):** Tabs toggle between:
  - **Preview** — iframe rendering the generated component live
  - **Code** — file tree + Monaco editor

### Auth & Persistence

- JWT sessions via `jose` with passwords hashed by `bcrypt` (`src/lib/auth.ts`, `src/actions/`)
- SQLite + Prisma stores users and projects (schema at `prisma/schema.prisma`)
- Anonymous users get a localStorage-tracked session (`src/lib/anon-work-tracker.ts`); their work is migrated to their account on sign-up

### Path Alias

`@/*` maps to `src/*` throughout the project.
