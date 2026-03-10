# GPT Domain App

GPT Domain App is a Next.js 16 ChatGPT App that exposes an MCP server at `/mcp`
and renders widget content inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## Overview

This project demonstrates a full MCP + widget loop:

- MCP tools are declared in a shared registry (`mcpTools.ts`)
- The MCP route (`app/mcp/route.ts`) auto-registers resources and tools from that registry
- Widget UI is rendered by the app routes (for example `app/page.tsx`)
- ChatGPT invokes a tool, receives `structuredContent`, and renders the widget template

## Current capabilities

- MCP endpoint at `/mcp` (both `GET` and `POST`)
- Dynamic tool/resource registration from `MCP_TOOLS`
- Tool input validation with Zod schemas generated from tool field metadata
- Widget metadata (`openai/*`) centralized via `widgetMeta()`
- ChatGPT-safe browser bootstrap in `app/layout.tsx` for iframe routing/fetch behavior
- Global permissive CORS middleware required for ChatGPT MCP communication

## Tech stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict mode)
- UI: React 19
- Styling: Tailwind CSS v4
- MCP server: `@modelcontextprotocol/sdk` + `mcp-handler`
- Validation: Zod
- Package manager: pnpm

## Project structure

```text
app/
├── mcp/route.ts           # MCP handler + resource/tool registration
├── hooks/                 # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx   # Example secondary route
├── page.tsx               # Main widget UI and MCP tool directory
├── layout.tsx             # Root layout + NextChatSDKBootstrap
└── globals.css            # Global styles
baseUrl.ts                 # Runtime base URL resolution (local + Vercel)
middleware.ts              # CORS headers for all routes + OPTIONS handling
mcpTools.ts                # Shared MCP tool definition registry
```

## MCP request flow

1. ChatGPT calls a tool on `/mcp`.
2. `createMcpHandler` in `app/mcp/route.ts` serves the MCP transport.
3. The tool definition from `MCP_TOOLS` is mapped to:
   - `server.registerResource(...)` for the widget template
   - `server.registerTool(...)` for tool execution
4. Tool execution returns:
   - `content` for plain text response
   - `structuredContent` for typed payload
   - `_meta` with widget rendering metadata
5. ChatGPT resolves `openai/outputTemplate` and displays the widget.

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

## NPM scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Starts Next.js with Turbopack |
| `pnpm build` | Produces production build with Turbopack |
| `pnpm start` | Serves the production build |

## Working in ChatGPT

1. Deploy this app (typically on Vercel).
2. Configure a ChatGPT connector pointing at `https://<your-domain>/mcp`.
3. Invoke one of the registered MCP tools.

When running outside ChatGPT, the main page intentionally shows a banner when
`window.openai` is not available.

## Adding a new MCP tool

1. Add a new entry to `MCP_TOOLS` in `mcpTools.ts`:
   - `id`, `title`, `description`
   - `templateUri`, `resourcePath`, and widget metadata strings
   - `inputSchemaFields` describing tool inputs
2. Ensure the referenced `resourcePath` route renders the desired widget HTML.
3. Confirm `app/mcp/route.ts` can fetch that route HTML at runtime.
4. Run the app and invoke the new tool through ChatGPT to verify rendering.

Because registration is driven from `MCP_TOOLS`, new entries are picked up by
both the server route and the UI summary on `app/page.tsx`.

## Deployment behavior

`baseUrl.ts` resolves the app base URL with this order:

- `http://localhost:3000` in development
- `VERCEL_PROJECT_PRODUCTION_URL` in production
- `VERCEL_BRANCH_URL` or `VERCEL_URL` in preview contexts

`middleware.ts` adds permissive CORS headers for all paths and handles
`OPTIONS` preflight requests.

`app/layout.tsx` includes `NextChatSDKBootstrap`. Do not remove this without
understanding iframe embedding constraints in ChatGPT.

## Troubleshooting

- **Widget does not render in ChatGPT**
  - Verify `openai/outputTemplate` and resource URI are aligned.
  - Ensure the resource is returned as `text/html+skybridge`.
- **Tool input validation fails**
  - Check `inputSchemaFields` type/required values in `mcpTools.ts`.
- **Cross-origin or fetch issues in ChatGPT iframe**
  - Confirm bootstrap scripts in `app/layout.tsx` are intact.
  - Confirm CORS middleware is active for `/mcp`.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP specification: https://modelcontextprotocol.io
- Next.js documentation: https://nextjs.org/docs
