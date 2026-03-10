# GPT Domain App

ChatGPT App built with Next.js App Router that exposes an MCP server at `/mcp` and renders a widget in ChatGPT using OpenAI Apps SDK bridge APIs.

## Overview

This repository demonstrates a complete MCP-enabled ChatGPT App:

- MCP endpoint (`app/mcp/route.ts`) that registers resources and tools
- Shared tool registry (`mcpTools.ts`) used by both server and widget UI
- Client widget page (`app/page.tsx`) that displays tool definitions and outputs
- ChatGPT iframe bootstrap (`app/layout.tsx`) for routing/fetch compatibility
- Global CORS middleware (`middleware.ts`) required for MCP communication

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4
- `@modelcontextprotocol/sdk` + `mcp-handler`
- Zod
- pnpm

## Project structure

```text
app/
├── hooks/                    # OpenAI Apps SDK interaction hooks
├── mcp/route.ts              # MCP server: resource + tool registration
├── custom-page/page.tsx      # Secondary example page
├── page.tsx                  # Main widget page shown in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Environment-aware base URL resolution
middleware.ts                 # CORS headers + OPTIONS handling
mcpTools.ts                   # Shared MCP tool definitions
```

## Available scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Run local dev server with Turbopack |
| `pnpm build` | Build production app |
| `pnpm start` | Run production server |

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

To verify a production build locally:

```bash
pnpm build
pnpm start
```

## MCP architecture

`app/mcp/route.ts` creates a handler with `createMcpHandler` and, for each entry in `MCP_TOOLS`:

1. Fetches the widget HTML from `resourcePath`
2. Registers a resource with `text/html+skybridge`
3. Registers a tool with a Zod-generated `inputSchema`
4. Returns `content`, `structuredContent`, and `_meta` on invocation

`widgetMeta()` centralizes required OpenAI metadata keys such as:

- `openai/outputTemplate`
- `openai/toolInvocation/invoking`
- `openai/toolInvocation/invoked`
- `openai/resultCanProduceWidget`

## ChatGPT embedding behavior

`NextChatSDKBootstrap` in `app/layout.tsx` is required for stable rendering inside ChatGPT:

- sets `<base href>` for iframe-safe asset resolution
- patches `history.pushState` / `replaceState` behavior
- rewrites fetch requests to the app origin when embedded
- strips injected `<html>` attributes that can cause hydration mismatches

When running outside ChatGPT, the main page intentionally shows a banner when `window.openai` is not present.

## CORS and deployment

`middleware.ts` applies permissive CORS headers (`*`) to all routes and handles `OPTIONS` preflight requests. This is necessary for ChatGPT to call the MCP endpoint.

`baseUrl.ts` automatically selects:

- `http://localhost:3000` in development
- `VERCEL_PROJECT_PRODUCTION_URL` in production
- `VERCEL_BRANCH_URL` or `VERCEL_URL` in preview contexts

No custom environment variables are required for base URL resolution.

## Adding a new MCP tool

1. Add a new entry to `MCP_TOOLS` in `mcpTools.ts`.
2. Provide tool metadata, template URI, resource path, and input schema fields.
3. Ensure the widget page/route for that `resourcePath` exists under `app/`.
4. `app/mcp/route.ts` will auto-register the resource and tool from the shared registry.
5. Invoke the tool from ChatGPT and validate widget rendering/output.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- Model Context Protocol: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
