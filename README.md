# GPT Domain App

This repository is a Next.js 16 ChatGPT App that exposes an MCP server at `/mcp`
and renders an interactive widget inside ChatGPT conversations.

It is designed to run locally for development and deploy cleanly to Vercel for
production use.

## Table of contents

- [What this app provides](#what-this-app-provides)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [How the MCP flow works](#how-the-mcp-flow-works)
- [Tool registry model](#tool-registry-model)
- [Local development](#local-development)
- [Using the app in ChatGPT](#using-the-app-in-chatgpt)
- [Deployment notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Useful links](#useful-links)

## What this app provides

- An MCP endpoint at `app/mcp/route.ts` (`GET` and `POST` on `/mcp`)
- Dynamic MCP resource and tool registration from a shared registry (`mcpTools.ts`)
- A widget UI (`app/page.tsx`) that displays available tools and tool output
- OpenAI Apps SDK bridge hooks under `app/hooks/`
- Iframe-safe bootstrapping in `app/layout.tsx` for ChatGPT embedding
- Global CORS middleware in `middleware.ts` so ChatGPT can call the MCP server

## Tech stack

- **Framework:** Next.js App Router, TypeScript (strict mode)
- **Runtime/UI:** React 19
- **MCP server:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Schema validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm (npm lockfile is present for compatibility)

## Project layout

```text
app/
├── hooks/                    # OpenAI Apps SDK hooks for widget integration
├── mcp/route.ts              # MCP route: resource + tool registration
├── custom-page/page.tsx      # Example secondary route
├── globals.css               # Global styles
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── page.tsx                  # Main widget UI rendered by ChatGPT
baseUrl.ts                    # Environment-aware base URL resolution
mcpTools.ts                   # Shared tool registry consumed by UI + MCP route
middleware.ts                 # CORS headers and OPTIONS preflight handling
```

## How the MCP flow works

1. The `/mcp` route is created with `createMcpHandler(...)`.
2. For each entry in `MCP_TOOLS`, the server fetches widget HTML from
   `resourcePath` and registers a `text/html+skybridge` resource.
3. The server registers a tool with:
   - title/description metadata
   - a Zod input schema built from the registry definition
   - OpenAI widget metadata (`openai/outputTemplate`, invocation status text, etc.)
4. The tool handler returns:
   - `content` (human-readable text)
   - `structuredContent` (typed payload for the widget)
   - `_meta` (widget metadata for rendering)
5. ChatGPT uses `openai/outputTemplate` to render the widget view.

## Tool registry model

`mcpTools.ts` is the single source of truth for each MCP tool definition:

- tool id and title
- model-facing description
- template URI and invocation messages
- widget metadata fields
- input schema fields
- resource path used to load widget HTML

Both the server (`app/mcp/route.ts`) and the widget page (`app/page.tsx`) consume
this registry, so tool docs shown in the UI stay in sync with MCP behavior.

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Run development server

```bash
pnpm dev
```

- App URL: `http://localhost:3000`
- MCP URL: `http://localhost:3000/mcp`

### Build and run production mode locally

```bash
pnpm build
pnpm start
```

## Using the app in ChatGPT

1. Deploy the app (typically on Vercel).
2. In ChatGPT, configure your connector to point at:
   `https://<your-domain>/mcp`
3. Invoke one of the registered MCP tools from ChatGPT.
4. ChatGPT renders the corresponding widget resource in the conversation.

When opening the site directly in a browser (outside ChatGPT), the widget page
shows an informational banner if `window.openai` is unavailable.

## Deployment notes

- `baseUrl.ts` resolves base URL automatically:
  - `http://localhost:3000` in development
  - Vercel production URL in production
  - Vercel preview/branch URL in preview environments
- `app/layout.tsx` injects `NextChatSDKBootstrap` for iframe-safe routing and
  fetch behavior in ChatGPT. This bootstrap is required for embedded operation.
- `middleware.ts` adds permissive CORS headers globally and handles `OPTIONS`
  requests for MCP and browser interoperability.

## Troubleshooting

- **Widget loads but no ChatGPT context is available**
  - Expected outside ChatGPT. The banner on `app/page.tsx` confirms this state.
- **MCP calls fail due to CORS**
  - Verify `middleware.ts` is present and active.
- **Wrong widget content appears**
  - Ensure each tool's `templateUri` and `resourcePath` in `mcpTools.ts` are
    correct and unique.
- **Tool schema errors**
  - Check `inputSchemaFields` in `mcpTools.ts`; these are transformed into Zod
    schemas at runtime.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP specification: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
