# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders a widget UI inside ChatGPT using OpenAI Apps SDK bridge APIs.

## Overview

This project combines three parts:

1. **MCP server** (`app/mcp/route.ts`) that registers tools/resources.
2. **Widget frontend** (`app/page.tsx`) rendered by ChatGPT inside an iframe.
3. **Shared tool registry** (`mcpTools.ts`) that keeps tool metadata centralized so MCP registration and UI summaries stay in sync.

The default tool is `show_content`, which returns structured content and renders the homepage as a widget template.

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
├── mcp/route.ts              # MCP route handlers, resource/tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget UI rendered in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
mcpTools.ts                   # Shared MCP tool definitions used by server/UI
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # Global CORS handling for MCP/browser requests
```

## How MCP registration works

`app/mcp/route.ts` loops over each entry in `MCP_TOOLS` and performs the same lifecycle:

1. Fetches Apps-SDK-compatible HTML from the configured `resourcePath`.
2. Registers a `text/html+skybridge` resource for that HTML.
3. Registers the corresponding tool with a Zod-generated input schema.
4. Returns `content`, `structuredContent`, and `_meta` in tool responses.

The `widgetMeta()` helper keeps OpenAI metadata keys consistent between tool and resource registration.

## Homepage and tool summary behavior

The homepage reads from the shared tool definitions and displays:

- Tool name and identifier
- Tool description shown to the model
- Expected input fields and required/optional status
- Tool status/invocation metadata

Because both server registration and homepage rendering depend on `mcpTools.ts`, adding/changing a tool in one place updates both behaviors.

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Start dev server

```bash
pnpm dev
```

- App URL: `http://localhost:3000`
- MCP URL: `http://localhost:3000/mcp`

### Build and run production

```bash
pnpm build
pnpm start
```

## NPM scripts

- `pnpm dev` - Start Next.js dev server with Turbopack
- `pnpm build` - Create production build
- `pnpm start` - Run production server

## Using the app in ChatGPT

1. Deploy the app (typically on Vercel).
2. In ChatGPT, create a connector to `https://<your-domain>/mcp`.
3. Invoke a registered MCP tool (for example, `show_content`).
4. ChatGPT resolves `openai/outputTemplate` and renders the widget resource.

When running outside ChatGPT, the widget page intentionally displays a banner if `window.openai` is unavailable.

## Deployment notes

- `baseUrl.ts` resolves:
  - `http://localhost:3000` in development
  - production Vercel URL in production
  - preview/branch Vercel URL otherwise
- `middleware.ts` injects permissive CORS headers and handles `OPTIONS` preflight.
- `app/layout.tsx` injects `NextChatSDKBootstrap`; this is required for iframe-safe routing and fetch behavior in ChatGPT.

## Contributor workflow: add a new MCP tool

1. Add an entry in `mcpTools.ts` with IDs, descriptions, input fields, and widget metadata.
2. Create/update the UI route under `app/` referenced by `resourcePath`.
3. Confirm `app/mcp/route.ts` can generate the correct Zod schema from the tool's `inputSchemaFields`.
4. Run `pnpm build` to verify server/client compile together.
5. Test the tool through `/mcp` and confirm widget rendering in ChatGPT.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
