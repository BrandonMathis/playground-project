# GPT Domain App

GPT Domain App is a Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget UI inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## Overview

This project demonstrates how to:

- Serve MCP tools and resources from a Next.js App Router route (`app/mcp/route.ts`)
- Return widget templates with `text/html+skybridge` so ChatGPT can render app UI
- Read MCP tool output in a client widget with React hooks in `app/hooks/`
- Run safely inside ChatGPT iframes using `NextChatSDKBootstrap` in `app/layout.tsx`
- Allow cross-origin MCP access via permissive CORS middleware (`middleware.ts`)

## Tech stack

- Framework: Next.js 16 (App Router, Turbopack)
- Language: TypeScript (strict mode)
- UI runtime: React 19
- MCP: `@modelcontextprotocol/sdk` + `mcp-handler`
- Validation: Zod
- Styling: Tailwind CSS v4
- Package manager: pnpm

## Repository structure

```text
app/
├── mcp/route.ts          # MCP endpoint: resources + tools
├── hooks/                # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx  # Secondary example route
├── page.tsx              # Main widget UI
├── layout.tsx            # Root layout + NextChatSDKBootstrap
└── globals.css           # Global styles
baseUrl.ts                # Environment-aware app base URL
middleware.ts             # Global CORS handling
```

## Core request flow

1. ChatGPT calls `/mcp` with a tool invocation request.
2. `createMcpHandler` handles `GET` and `POST` requests in `app/mcp/route.ts`.
3. The tool returns:
   - `content` for conversational output
   - `structuredContent` for typed tool output
   - `_meta` including widget metadata such as `openai/outputTemplate`
4. ChatGPT resolves the registered resource template and renders the widget in an iframe.
5. `app/page.tsx` reads widget props and adapts behavior based on ChatGPT runtime APIs.

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

### Run production build locally

```bash
pnpm build
pnpm start
```

## Available scripts

- `pnpm dev`: Start Next.js dev server with Turbopack
- `pnpm build`: Create production build
- `pnpm start`: Start production server

## MCP implementation notes

`app/mcp/route.ts` follows a consistent widget pattern:

1. Define a widget config object (`id`, `title`, `templateUri`, `html`, status messages).
2. Register a resource with MIME type `text/html+skybridge`.
3. Register a tool with a Zod input schema.
4. Return `content`, `structuredContent`, and `_meta` from the tool handler.

The `widgetMeta()` helper centralizes OpenAI metadata keys so resource/tool wiring stays consistent.

## Adding a new MCP tool

1. Add a new widget config in `app/mcp/route.ts`.
2. Register a resource with `server.registerResource(...)`.
3. Register a tool with `server.registerTool(...)` and a Zod schema.
4. Return `content`, `structuredContent`, and `_meta` from the tool handler.
5. If the tool needs custom UI, add/update a page under `app/` and point the resource HTML to it.

## ChatGPT runtime behavior

- Outside ChatGPT, the main page intentionally shows an informational banner when `window.openai` is unavailable.
- Inside ChatGPT, hooks under `app/hooks/` provide access to widget props, display mode, and tool/message bridge methods.
- `NextChatSDKBootstrap` in `app/layout.tsx` is required for iframe-safe history and fetch behavior.

## Deployment

This app is designed for Vercel deployments.

- `baseUrl.ts` resolves:
  - `http://localhost:3000` in development
  - production domain from `VERCEL_PROJECT_PRODUCTION_URL`
  - preview/branch domain from Vercel preview environment variables
- `middleware.ts` applies permissive CORS headers and handles `OPTIONS` preflight requests.

No custom `vercel.json` is required for the current setup.

## Troubleshooting

- Widget does not render in ChatGPT:
  - Confirm `/mcp` is reachable from the deployed domain.
  - Verify `openai/outputTemplate` and resource URI values match.
- Requests fail in iframe:
  - Ensure `NextChatSDKBootstrap` is still injected in `app/layout.tsx`.
- MCP calls blocked by browser policy:
  - Verify `middleware.ts` still sets CORS headers for all routes.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- Model Context Protocol: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
