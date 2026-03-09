# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget inside ChatGPT conversations.

## Overview

This project combines:

- An MCP server route (`app/mcp/route.ts`) built with `mcp-handler`
- A shared MCP tool registry (`mcpTools.ts`)
- A client widget UI (`app/page.tsx`) that reads tool results from the OpenAI Apps bridge
- A bootstrap layer in `app/layout.tsx` to make iframe embedding behave correctly
- Global CORS middleware (`middleware.ts`) so ChatGPT can call the MCP endpoint

## Tech stack

- Next.js App Router + TypeScript (strict)
- React 19
- Tailwind CSS v4
- `@modelcontextprotocol/sdk` + `mcp-handler`
- Zod for tool input validation
- pnpm for package management

## Repository layout

```text
app/
├── mcp/route.ts              # MCP resource + tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget UI rendered in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # CORS headers for all routes + preflight handling
mcpTools.ts                   # Shared MCP tool definitions (source of truth)
```

## How MCP wiring works

1. `mcpTools.ts` defines each tool's metadata and input fields.
2. `app/mcp/route.ts` loops over that registry and:
   - fetches widget HTML from each tool's `resourcePath`
   - registers a `text/html+skybridge` resource
   - registers the matching tool with Zod input schema and OpenAI metadata
3. The tool handler returns:
   - `content` (text response)
   - `structuredContent` (typed payload for UI)
   - `_meta` (widget template/invocation metadata)
4. ChatGPT resolves `openai/outputTemplate` and renders the widget content.

`widgetMeta()` in `app/mcp/route.ts` centralizes required OpenAI metadata fields for consistency across tools.

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

- App URL: `http://localhost:3000`
- MCP endpoint: `http://localhost:3000/mcp`

### Build and run production mode

```bash
pnpm build
pnpm start
```

## Scripts

- `pnpm dev` - start Next.js with Turbopack
- `pnpm build` - create production build
- `pnpm start` - run production server

## Using in ChatGPT

1. Deploy the app (typically to Vercel).
2. Configure a ChatGPT connector to point to `https://<your-domain>/mcp`.
3. Invoke a registered tool (for example `show_content`) from ChatGPT.
4. ChatGPT renders the associated widget resource returned by the MCP server.

When running outside ChatGPT, the homepage intentionally shows an informational banner when `window.openai` is unavailable.

## Deployment behavior

- `baseUrl.ts` resolves the base URL automatically:
  - `http://localhost:3000` in development
  - `VERCEL_PROJECT_PRODUCTION_URL` in production
  - `VERCEL_BRANCH_URL` or `VERCEL_URL` in preview environments
- `middleware.ts` sets permissive CORS headers and handles `OPTIONS` preflight globally.
- `NextChatSDKBootstrap` in `app/layout.tsx` is required for iframe-safe navigation/fetch behavior in ChatGPT.

## Adding a new MCP tool

1. Add a new item to `MCP_TOOLS` in `mcpTools.ts`.
2. Supply:
   - tool id/title/description
   - template URI + resource path
   - invocation text and widget metadata
   - `inputSchemaFields` with name/type/description/required
3. Ensure the `resourcePath` returns valid HTML for the widget.
4. `app/mcp/route.ts` will auto-register the tool/resource from the registry.
5. Update widget UI in `app/` as needed to render the tool output.

## References

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP specification: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
