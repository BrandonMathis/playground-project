# AGENTS.md

## Project Overview

This is a **ChatGPT App** built with Next.js (App Router) that exposes an **MCP (Model Context Protocol) server** at `/mcp`. It is designed to be deployed on **Vercel** and rendered as an interactive widget inside ChatGPT conversations via the OpenAI Apps SDK.

## Tech Stack

- **Framework:** Next.js 16+ (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler` (`createMcpHandler`)
- **Validation:** Zod (for MCP tool input schemas)
- **Package Manager:** pnpm
- **Deployment:** Vercel

## Architecture

### MCP Server (`app/mcp/route.ts`)

The core of this app. It exports `GET` and `POST` handlers created via `createMcpHandler`. Inside the handler callback:

1. **Register resources** with `server.registerResource()` — HTML content served as `text/html+skybridge` with `openai/*` metadata for ChatGPT widget rendering.
2. **Register tools** with `server.registerTool()` — Each tool has a Zod input schema and returns `structuredContent` plus `_meta` with OpenAI widget metadata (`openai/outputTemplate`, `openai/toolInvocation/invoking`, etc.).

When adding new tools or resources, follow the existing `ContentWidget` pattern: define the widget config object, then register both a resource (template) and a tool that references it.

### Widget / Frontend (`app/page.tsx`)

A `"use client"` page that renders the widget UI shown inside ChatGPT. It reads tool output via `useWidgetProps()` and adapts to the ChatGPT environment using hooks from `app/hooks/`.

When not inside ChatGPT (`window.openai` is absent), the page shows an informational banner.

### ChatGPT SDK Bootstrap (`app/layout.tsx`)

The root layout injects `NextChatSDKBootstrap` in `<head>`, which:
- Sets `<base href>` to the app's origin for correct asset loading in iframes
- Patches `history.pushState`/`replaceState` for iframe-safe routing
- Patches `fetch` to rewrite cross-origin requests back to the app origin
- Runs a `MutationObserver` to strip attributes ChatGPT may inject on `<html>`

**Do not remove or significantly alter this bootstrap** without understanding the iframe embedding constraints.

### CORS Middleware (`middleware.ts`)

All routes have permissive CORS headers (`Access-Control-Allow-Origin: *`). This is required for ChatGPT to communicate with the MCP server. The middleware handles OPTIONS preflight and adds headers to all responses.

### Base URL Resolution (`baseUrl.ts`)

Exports `baseURL` which resolves to `localhost:3000` in development or the appropriate Vercel URL in production/preview. Used by the MCP handler and layout bootstrap. No custom environment variables are needed — it relies on Vercel-provided env vars (`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_BRANCH_URL`, `VERCEL_URL`).

## Project Structure

```
app/
├── mcp/route.ts          # MCP server — tools & resources
├── hooks/                # OpenAI Apps SDK React hooks
│   ├── index.ts          # Barrel exports
│   ├── types.ts          # window.openai type definitions
│   ├── use-widget-props  # Read tool output in the widget
│   ├── use-display-mode  # PiP / inline / fullscreen state
│   ├── use-call-tool     # Invoke MCP tools from the widget
│   ├── use-send-message  # Send messages to ChatGPT
│   └── ...               # Other SDK interaction hooks
├── custom-page/page.tsx  # Example secondary page
├── page.tsx              # Main widget UI
├── layout.tsx            # Root layout + SDK bootstrap
└── globals.css           # Global styles (Tailwind)
baseUrl.ts                # Environment-aware base URL
middleware.ts             # CORS middleware (required)
```

## Key Conventions

- **App Router only** — no `pages/` directory. All routes live under `app/`.
- **Client components** use `"use client"` directive. The main page and all hooks are client-side.
- **Server logic** is limited to the MCP route handler and layout (RSC).
- **Path alias** `@/*` maps to the project root (configured in `tsconfig.json`).
- **No ESLint/Prettier config** — rely on TypeScript strict mode and editor defaults.
- **No test framework** is configured.

## Adding a New MCP Tool

1. Define a `ContentWidget` config object in `app/mcp/route.ts` with: `id`, `title`, `templateUri`, `invoking`/`invoked` messages, `html`, `description`, and `widgetDomain`.
2. Register a resource via `server.registerResource()` with `text/html+skybridge` MIME type and `openai/*` metadata.
3. Register a tool via `server.registerTool()` with a Zod input schema and `_meta` from `widgetMeta()`.
4. The tool handler should return `content`, `structuredContent`, and `_meta`.
5. If the tool needs a new widget UI, create a new page under `app/` and fetch its HTML in the handler.

## Running Locally

```bash
pnpm install
pnpm dev        # starts on http://localhost:3000 with Turbopack
```

The MCP endpoint is available at `http://localhost:3000/mcp`. Outside of a ChatGPT session, the widget page shows a "no window.openai detected" banner — this is expected.

## Deployment

Push to a Vercel-connected repo. No `vercel.json` is needed — defaults work. The Vercel-provided environment variables handle base URL resolution automatically.

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `pnpm dev` | 3000 | Serves widget UI + MCP endpoint |

No external services (databases, caches, Docker) are required.

### Running

- `pnpm dev` starts the dev server with Turbopack on `http://localhost:3000`.
- The MCP endpoint at `/mcp` accepts POST requests only (GET returns 405). Test initialization with: `curl -X POST http://localhost:3000/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}'`
- The MCP handler uses in-memory session state; only the first initialize request per server instance succeeds via curl. Subsequent requests require proper session management (handled by ChatGPT in production).
- Outside of ChatGPT, the homepage shows a "no `window.openai` detected" banner — this is expected behavior, not a bug.

### Linting & Type Checking

- No ESLint config exists. Use `npx tsc --noEmit` for TypeScript type checking.
- Build check: `pnpm build`

### Gotchas

- The `@modelcontextprotocol/sdk` peer dependency requires `zod@^3.25`. If the lockfile resolves an incompatible zod version (e.g. 3.24.x), both build and dev server will fail with `Module not found: Can't resolve 'zod/v3'`. Fix by running `pnpm add zod@3` to get the latest compatible 3.x release.
- Native build scripts for `@tailwindcss/oxide` and `sharp` must be allowed. The `pnpm.onlyBuiltDependencies` field in `package.json` handles this non-interactively. Do NOT run `pnpm approve-builds` (interactive).
- Next.js 16 emits a deprecation warning about the "middleware" file convention recommending "proxy" instead — this is cosmetic and does not affect functionality.
- If a stale dev server holds port 3000, delete `/workspace/.next/dev/lock` and kill the old process before restarting.
