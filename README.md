# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## Overview

This repository provides:

- An MCP endpoint (`app/mcp/route.ts`) with an example tool (`show_content`)
- A registered MCP widget resource (`text/html+skybridge`) rendered by ChatGPT
- A client widget UI (`app/page.tsx`) that reads tool output via custom Apps SDK hooks
- ChatGPT iframe hardening in `app/layout.tsx` (base URL, history patching, fetch patching)
- Global CORS middleware (`middleware.ts`) required for ChatGPT-to-MCP communication

## Tech stack

- **Framework:** Next.js App Router (TypeScript strict mode)
- **Runtime/UI:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Project structure

```text
app/
├── mcp/route.ts              # MCP resources + tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget UI rendered in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # Global CORS handling for MCP/browser requests
```

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

- App URL: `http://localhost:3000`
- MCP URL: `http://localhost:3000/mcp`

### Build and run production mode

```bash
pnpm build
pnpm start
```

## Available scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start Next.js development server with Turbopack |
| `pnpm build` | Build production assets with Turbopack |
| `pnpm start` | Run the production server |

## MCP architecture

`app/mcp/route.ts` exports handlers created by `createMcpHandler`. The MCP flow is:

1. Register one or more resources with `server.registerResource()`.
2. Register tools with `server.registerTool()` and Zod input schemas.
3. Return `content`, `structuredContent`, and `_meta` from tool handlers.
4. Set `openai/outputTemplate` so ChatGPT knows which widget to render.

The `widgetMeta()` helper centralizes OpenAI metadata keys to keep tool registration consistent.

## ChatGPT integration notes

When loaded inside ChatGPT, `window.openai` APIs are available to the widget. Outside ChatGPT, `app/page.tsx` intentionally shows a fallback banner.

`NextChatSDKBootstrap` in `app/layout.tsx` is required for iframe-safe behavior:

- Sets `<base href>` for asset resolution
- Patches history APIs for embedded routing
- Rewrites fetch requests so cross-origin calls resolve correctly
- Removes ChatGPT-injected attributes that may interfere with rendering

## Deployment notes

- `baseUrl.ts` resolves the correct origin for:
  - local development (`http://localhost:3000`)
  - Vercel production
  - Vercel preview/branch deployments
- `middleware.ts` adds permissive CORS headers and handles `OPTIONS` preflights.
- Deployments are expected to run on Vercel without custom environment variables.

## Adding a new MCP tool

1. Define a widget config object in `app/mcp/route.ts` (`id`, `title`, template URI, status text, HTML, and widget metadata).
2. Register a resource with MIME type `text/html+skybridge`.
3. Register a tool with `server.registerTool()` and a Zod input schema.
4. Return `content`, `structuredContent`, and `_meta` in the tool handler.
5. Add or update UI pages under `app/` when a new widget view is needed.

## Contributor workflow

1. Pick an issue and move it to **In Progress** in Linear.
2. Implement changes on the current issue branch.
3. Run at least `pnpm build` before opening a PR.
4. Commit with a clear issue-scoped message (for example: `THI-7: improve README contributor docs`).
5. Open a PR with a concise summary and any validation notes.

## Troubleshooting

- **Widget does not render in ChatGPT**
  - Confirm the connector points to `https://<deployment>/mcp`
  - Verify tool responses include `openai/outputTemplate` metadata
- **Cross-origin errors in browser/ChatGPT**
  - Confirm `middleware.ts` is active and returns CORS headers on all routes
- **Unexpected asset or route resolution in iframe**
  - Confirm `NextChatSDKBootstrap` is still included in `app/layout.tsx`

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
