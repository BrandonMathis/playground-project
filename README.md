# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders a widget UI inside ChatGPT through the OpenAI Apps SDK bridge.

## Overview

This repository contains:

- An MCP endpoint (`app/mcp/route.ts`) built with `createMcpHandler`
- A shared MCP tool registry (`mcpTools.ts`) used by both server and UI
- A widget homepage (`app/page.tsx`) that summarizes registered tools
- ChatGPT iframe bootstrap logic (`app/layout.tsx`) for routing/fetch compatibility
- Global CORS middleware (`middleware.ts`) required for MCP communication

## Tech stack

- **Framework:** Next.js App Router (TypeScript strict mode)
- **Runtime/UI:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Scripts

```bash
pnpm dev    # start local dev server with Turbopack
pnpm build  # production build
pnpm start  # run production server
```

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install and run

```bash
pnpm install
pnpm dev
```

- App URL: `http://localhost:3000`
- MCP URL: `http://localhost:3000/mcp`

Outside of a ChatGPT session, the homepage intentionally displays a banner when `window.openai` is unavailable.

## Project structure

```text
app/
├── mcp/route.ts              # MCP resources and tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget UI rendered in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # Global CORS handling for MCP/browser requests
mcpTools.ts                   # Shared MCP tool definitions (single source of truth)
```

## Architecture and request flow

1. ChatGPT calls `GET`/`POST /mcp`.
2. `app/mcp/route.ts` creates handlers with `createMcpHandler`.
3. For each tool in `MCP_TOOLS`:
   - register a `text/html+skybridge` resource
   - register a tool with a Zod input schema and OpenAI metadata
4. Tool execution returns:
   - `content` (human-readable response)
   - `structuredContent` (machine-friendly payload)
   - `_meta` (`openai/outputTemplate` and invocation state text)
5. ChatGPT renders the widget using the registered output template URI.

`widgetMeta()` centralizes required OpenAI metadata to keep resources and tools consistent.

## Core implementation notes

### MCP server (`app/mcp/route.ts`)

- Loads tool widget HTML from each tool's `resourcePath`
- Builds input schemas from typed field definitions in `mcpTools.ts`
- Registers both resource and tool for every entry in `MCP_TOOLS`

### Tool registry (`mcpTools.ts`)

- Defines tool identity, prompt metadata, widget metadata, and input fields
- Keeps homepage tool listing in sync with MCP server registration

### Widget frontend (`app/page.tsx`)

- Reads tool output via `useWidgetProps`
- Displays runtime info (display mode, tool count, render timestamp)
- Renders tool cards from `MCP_TOOLS` instead of hard-coded values

### ChatGPT bootstrap (`app/layout.tsx`)

- Sets `<base href>` for asset loading in iframes
- Patches `history.pushState` and `replaceState`
- Patches `fetch` to route iframe-origin requests back to app origin
- Opens cross-origin links through `window.openai.openExternal` when available

### CORS middleware (`middleware.ts`)

- Handles `OPTIONS` preflight requests
- Applies permissive CORS headers to all routes

## Deployment

Deploy to Vercel without custom environment variables.

`baseUrl.ts` resolves:

- `http://localhost:3000` in development
- `VERCEL_PROJECT_PRODUCTION_URL` in production
- `VERCEL_BRANCH_URL` or `VERCEL_URL` in preview

## Adding a new MCP tool

1. Add a new entry to `MCP_TOOLS` in `mcpTools.ts`:
   - IDs/titles/descriptions
   - template URI and resource path
   - invoking/invoked messages
   - typed input schema fields
2. Ensure `resourcePath` points to a page that returns renderable HTML.
3. Confirm the widget appears in the homepage tool directory.
4. Test tool invocation through ChatGPT and verify widget rendering.

## Troubleshooting

- **Tool renders text but no widget:** verify `openai/outputTemplate` matches the registered resource URI.
- **Widget cannot fetch app routes in ChatGPT:** check `NextChatSDKBootstrap` fetch patch logic in `app/layout.tsx`.
- **MCP calls fail from browser/ChatGPT:** confirm CORS headers are present from `middleware.ts`.
- **Wrong host in production:** verify Vercel environment variables used by `baseUrl.ts`.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
