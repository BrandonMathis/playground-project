# GPT Domain App

ChatGPT App built with Next.js (App Router) that exposes an MCP endpoint at `/mcp` and renders interactive widget UI inside ChatGPT conversations.

## Overview

This project combines three pieces:

1. **MCP server** (`app/mcp/route.ts`) that registers tools and widget resources.
2. **Widget UI** (`app/page.tsx`) that reads tool outputs via OpenAI Apps SDK hooks.
3. **Embedding/runtime glue** (`app/layout.tsx`, `middleware.ts`, `baseUrl.ts`) to make ChatGPT iframe behavior reliable in local and deployed environments.

## Tech stack

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript (strict mode)
- **UI:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Schema validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Repository structure

```text
app/
├── mcp/route.ts              # MCP endpoint, tool/resource registration
├── hooks/                    # OpenAI Apps SDK React hooks
├── custom-page/page.tsx      # Secondary example page
├── page.tsx                  # Main widget page
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Environment-aware base URL resolution
middleware.ts                 # CORS headers + preflight handling
mcpTools.ts                   # Tool definitions consumed by app/mcp/route.ts
```

## Available scripts

- `pnpm dev` - Start local development server with Turbopack.
- `pnpm build` - Build production bundle.
- `pnpm start` - Start production server from the built output.

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

### Production mode locally

```bash
pnpm build
pnpm start
```

## MCP architecture

`app/mcp/route.ts` uses `createMcpHandler` and loops over `MCP_TOOLS` from `mcpTools.ts`.

For each tool definition, it:

1. Fetches HTML content from the tool's `resourcePath`.
2. Registers a `text/html+skybridge` resource (`server.registerResource`).
3. Registers the tool (`server.registerTool`) with Zod input schema generated from `inputSchemaFields`.
4. Returns `content`, `structuredContent`, and `_meta` including `openai/outputTemplate`.

`widgetMeta()` centralizes OpenAI metadata to keep tool behavior consistent.

## Widget behavior

- `app/page.tsx` is a client component that consumes tool outputs via hooks in `app/hooks/`.
- If `window.openai` is unavailable (normal outside ChatGPT), the page intentionally shows a fallback banner.

## ChatGPT embedding requirements

- `app/layout.tsx` injects `NextChatSDKBootstrap` to make iframe navigation/fetch behavior safe in ChatGPT.
- `middleware.ts` applies permissive CORS headers and handles `OPTIONS` preflight requests for all routes.
- `baseUrl.ts` resolves host URLs for local, Vercel preview, and Vercel production environments.

## Adding a new MCP tool

1. Add a new definition to `MCP_TOOLS` in `mcpTools.ts` (`id`, descriptions, `templateUri`, `resourcePath`, input fields, etc.).
2. Ensure the referenced UI route exists under `app/` (for example `/custom-page`).
3. Confirm input field types map to supported Zod types (`string`, `number`, `boolean`).
4. Start the app and invoke the tool via ChatGPT against `/mcp`.

Because registration is data-driven from `MCP_TOOLS`, most new tool work happens in `mcpTools.ts` plus the associated UI route.

## Deployment

Deploy to Vercel (no custom `vercel.json` required). Runtime URL selection is handled automatically from Vercel environment variables in `baseUrl.ts`.

## References

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP: https://modelcontextprotocol.io
- Next.js: https://nextjs.org/docs
