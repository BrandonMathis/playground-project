# Brandon's Playground Project

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## Overview

This repository is an MCP-enabled app scaffold that demonstrates:

- Server-side MCP tool and resource registration at `app/mcp/route.ts`
- A shared MCP tool registry in `mcpTools.ts`
- A widget page (`app/page.tsx`) that summarizes registered tools from that same shared registry
- ChatGPT iframe compatibility wiring in `app/layout.tsx`
- Global CORS middleware required for ChatGPT-to-app communication

The current tool set is intentionally simple, but the architecture is designed so adding new tools is straightforward and consistent.

## Tech stack

- **Framework:** Next.js App Router (TypeScript strict mode)
- **UI runtime:** React 19
- **MCP libraries:** `@modelcontextprotocol/sdk` and `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Project structure

```text
app/
├── mcp/route.ts              # MCP GET/POST handlers + dynamic tool/resource registration
├── hooks/                    # OpenAI Apps SDK React hooks
├── custom-page/page.tsx      # Example secondary page
├── page.tsx                  # Main widget and MCP tool directory UI
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Environment-aware app origin resolver
middleware.ts                 # CORS headers and OPTIONS preflight
mcpTools.ts                   # Shared MCP tool definitions
```

## How MCP wiring works

1. `mcpTools.ts` defines each tool's id, metadata, input schema fields, and resource path.
2. `app/mcp/route.ts` loops over `MCP_TOOLS` and:
   - fetches the corresponding widget HTML from the app
   - registers a `text/html+skybridge` resource
   - registers an MCP tool with a generated Zod schema
3. Tool calls return:
   - `content` (assistant-readable text)
   - `structuredContent` (typed payload used by the widget)
   - `_meta` (OpenAI widget metadata like `openai/outputTemplate`)
4. ChatGPT resolves the output template URI and renders the widget.

The same `MCP_TOOLS` array is also consumed by `app/page.tsx`, so the homepage tool directory auto-updates when new tools are added.

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

### Production build

```bash
pnpm build
pnpm start
```

## Running inside ChatGPT

1. Deploy the app (typically on Vercel).
2. Configure ChatGPT to use `https://<your-domain>/mcp` as the MCP endpoint.
3. Invoke a registered tool (for example `show_content`).
4. ChatGPT renders the corresponding widget using the registered template URI.

Outside ChatGPT, the homepage displays a banner when `window.openai` is not available. That behavior is expected.

## Deployment notes

- `baseUrl.ts` resolves hostnames for local, preview, and production environments using Vercel-provided environment variables.
- `middleware.ts` applies permissive CORS headers for all routes and handles preflight requests.
- `app/layout.tsx` injects `NextChatSDKBootstrap` to keep routing and `fetch` behavior stable when embedded in ChatGPT iframes.

## Adding a new MCP tool

1. Add a new entry to `MCP_TOOLS` in `mcpTools.ts`:
   - id, title, description
   - template URI and resource path
   - invoking/invoked text
   - input schema fields
2. Add or update the widget page referenced by `resourcePath` under `app/`.
3. Verify the tool appears in:
   - `/mcp` registrations (server-side)
   - the homepage MCP Tool Directory (client-side)
4. Run `pnpm build` to confirm the app compiles cleanly.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
