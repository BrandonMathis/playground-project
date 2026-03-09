# Brandon's Playground Project

This repository is a Next.js ChatGPT App that exposes an MCP server at `/mcp` and renders widget UI inside ChatGPT.

## What this app does

- Registers MCP resources and tools in `app/mcp/route.ts`
- Serves widget HTML using the `text/html+skybridge` MIME type
- Renders a client-side widget in `app/page.tsx`
- Uses OpenAI Apps SDK hooks in `app/hooks/*` to read tool output and adapt to ChatGPT display modes
- Includes iframe-safe bootstrap logic in `app/layout.tsx`
- Applies permissive CORS headers in `middleware.ts` so ChatGPT can call the MCP endpoint

## Current MCP tool

The app currently registers one tool:

- **Tool name:** `show_content`
- **Input schema:** `{ name: string }`
- **Behavior:** returns text content plus `structuredContent` with `name` and `timestamp`
- **Output template:** `ui://widget/content-template.html`

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript (strict mode)
- React 19
- Tailwind CSS v4
- `@modelcontextprotocol/sdk`
- `mcp-handler`
- Zod
- pnpm

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Run

```bash
pnpm dev
```

Open `http://localhost:3000` for the widget page.

The MCP endpoint is available at:

```text
http://localhost:3000/mcp
```

## Project structure

```text
app/
├── mcp/route.ts            # MCP handler (resources + tools)
├── hooks/                  # OpenAI Apps SDK hooks used by client UI
├── custom-page/page.tsx    # Secondary client page
├── page.tsx                # Main widget page
├── layout.tsx              # Root layout + ChatGPT iframe bootstrap
└── globals.css             # Global styles
baseUrl.ts                  # Runtime base URL resolution
middleware.ts               # CORS headers and OPTIONS preflight handling
next.config.ts              # Uses baseURL as Next.js assetPrefix
```

## Architecture notes

### MCP server (`app/mcp/route.ts`)

- Built with `createMcpHandler`
- Registers a resource via `server.registerResource(...)`
- Registers a tool via `server.registerTool(...)`
- Includes OpenAI metadata (`openai/outputTemplate`, invocation status strings, widget flags)

### ChatGPT bootstrap (`app/layout.tsx`)

`NextChatSDKBootstrap` is responsible for iframe compatibility:

- sets `<base href>` so assets resolve correctly
- patches `history.pushState` and `history.replaceState`
- intercepts `fetch` so same-origin requests are rewritten to the app origin when needed
- strips unexpected attributes ChatGPT may inject on `<html>`

### CORS middleware (`middleware.ts`)

Adds `Access-Control-Allow-*` headers to every response and handles `OPTIONS` preflight requests with a 204 response.

### Base URL resolution (`baseUrl.ts`)

Resolves to:

- `http://localhost:3000` in development
- Vercel production or preview URLs in deployed environments

## Working in ChatGPT vs local browser

- Inside ChatGPT, `window.openai` is available and hooks in `app/hooks/*` can read tool output/display state.
- Outside ChatGPT, the homepage shows an informational banner when `window.openai` is not present. This is expected behavior for local testing.

## Adding another MCP tool

1. Define a new widget config object in `app/mcp/route.ts` (id, title, template URI, status text, description, domain).
2. Register the HTML resource with `server.registerResource(...)`.
3. Register the tool with a Zod input schema and OpenAI metadata.
4. Return `content`, `structuredContent`, and `_meta` from the tool handler.
5. If needed, create/update UI pages under `app/` for the widget.

## Scripts

- `pnpm dev` - run development server
- `pnpm build` - create production build
- `pnpm start` - run production server

## Deployment

Deploy to Vercel. Runtime URL selection is handled automatically via Vercel environment variables consumed by `baseUrl.ts`.
