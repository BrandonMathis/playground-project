# GPT Domain App

This repository is a Next.js 16 ChatGPT App that exposes an MCP endpoint at `/mcp` and renders an interactive widget inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## Overview

The app uses a single tool registry (`mcpTools.ts`) as the source of truth for:

- Tool identity and user-facing copy (`id`, `title`, `description`, invocation text)
- Input schema field definitions (`string`, `number`, `boolean`)
- Widget metadata (`templateUri`, `widgetDescription`, `widgetDomain`)
- Resource source path used to fetch widget HTML (`resourcePath`)

At runtime, `app/mcp/route.ts` loops over that registry and registers MCP resources + tools automatically.

## Architecture

### Core files

```text
app/
├── mcp/route.ts              # MCP resource/tool registration from MCP_TOOLS
├── page.tsx                  # Main widget UI; tool directory and runtime context
├── layout.tsx                # Root layout + NextChatSDKBootstrap for ChatGPT iframe use
├── custom-page/page.tsx      # Example secondary page
├── globals.css               # Global styles
└── hooks/                    # OpenAI Apps SDK helper hooks
mcpTools.ts                   # Shared MCP tool definitions consumed by UI + server
baseUrl.ts                    # Environment-aware base URL resolution (dev + Vercel)
middleware.ts                 # Global permissive CORS and OPTIONS preflight handling
```

### MCP request flow

1. `createMcpHandler` provides `GET` and `POST` handlers for `/mcp`.
2. For each item in `MCP_TOOLS`, HTML is fetched from `resourcePath`.
3. A `text/html+skybridge` resource is registered with `openai/widget*` metadata.
4. A tool is registered with a generated Zod input schema and invocation metadata.
5. Tool handlers return:
   - `content` (chat-visible output)
   - `structuredContent` (widget-readable payload)
   - `_meta` (OpenAI widget metadata)
6. ChatGPT uses `openai/outputTemplate` to render the widget resource.

## ChatGPT iframe compatibility

`app/layout.tsx` includes `NextChatSDKBootstrap`, which is required for app behavior inside ChatGPT:

- Sets `<base href>` to the deployed app origin
- Rewrites `history.pushState` / `history.replaceState` usage for iframe-safe routing
- Patches same-origin `fetch` calls to the app origin when embedded
- Handles external links through `window.openai.openExternal`
- Removes ChatGPT-injected HTML attributes that can cause hydration issues

Do not remove this bootstrap unless you fully understand the embedding constraints.

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

## Running in ChatGPT

1. Deploy the app (typically to Vercel).
2. In ChatGPT, configure a connector to `https://<your-domain>/mcp`.
3. Invoke a registered MCP tool to render the widget template.

When `window.openai` is missing (for example, regular browser dev mode), the homepage intentionally displays a banner indicating it is outside a ChatGPT runtime.

## Deployment behavior

`baseUrl.ts` resolves the app base URL automatically:

- Development: `http://localhost:3000`
- Vercel production: `https://$VERCEL_PROJECT_PRODUCTION_URL`
- Vercel preview/branch: `https://$VERCEL_BRANCH_URL` or `https://$VERCEL_URL`

No custom environment variables are required for base URL selection.

## Add a new MCP tool

1. Add a new object to `MCP_TOOLS` in `mcpTools.ts`.
2. Provide:
   - Unique `id`
   - `templateUri`, `resourcePath`, and widget metadata fields
   - `inputSchemaFields` entries with names, types, descriptions, and required flags
3. Ensure the page at `resourcePath` exists and returns the expected HTML.
4. Start the app and verify the tool appears on the homepage tool directory.
5. Call the tool through ChatGPT and confirm both chat output and widget rendering.

Because registration is data-driven, no extra manual `registerTool` or `registerResource` calls are needed beyond updating `MCP_TOOLS`.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
