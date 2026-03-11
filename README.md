# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders widget UI inside ChatGPT conversations using the OpenAI Apps SDK bridge APIs.

## Overview

This codebase demonstrates a complete MCP + widget loop:

- A tool is defined in `mcpTools.ts`
- `app/mcp/route.ts` registers that tool and its widget resource
- ChatGPT invokes the tool and renders the returned widget template
- `app/page.tsx` consumes tool output with OpenAI Apps SDK hooks

The project currently ships one tool, `show_content`, which returns structured content and renders the homepage widget.

## Tech stack

- **Framework:** Next.js App Router (TypeScript strict mode)
- **Runtime/UI:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm
- **Deployment target:** Vercel

## Project structure

```text
app/
├── mcp/route.ts              # MCP GET/POST handlers, resource + tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget UI rendered in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap injection
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # Global CORS handling for MCP/browser requests
mcpTools.ts                   # MCP tool definitions (single source of truth)
```

## Scripts

```bash
pnpm dev    # Start local dev server (Turbopack)
pnpm build  # Production build
pnpm start  # Start production server
```

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

### Verify production build locally

```bash
pnpm build
pnpm start
```

## MCP architecture and request flow

1. `createMcpHandler` in `app/mcp/route.ts` creates `GET` and `POST` handlers at `/mcp`.
2. For each tool in `MCP_TOOLS`, the handler fetches widget HTML and creates a `ContentWidget` config.
3. `registerResource` publishes a `text/html+skybridge` template with `openai/widget*` metadata.
4. `registerTool` publishes the tool with a Zod schema derived from `inputSchemaFields`.
5. The tool handler returns:
   - `content` (human-readable text)
   - `structuredContent` (machine-readable payload for widget props)
   - `_meta` with `openai/outputTemplate` and invocation metadata
6. ChatGPT resolves the template URI and renders the widget in an iframe.

`widgetMeta()` centralizes required OpenAI metadata keys so resources and tool responses stay consistent.

## Tool configuration (`mcpTools.ts`)

`mcpTools.ts` is the canonical registry for MCP tools. Each tool definition includes:

- Tool identity (`id`, `title`, `description`)
- Widget wiring (`templateUri`, `widgetDescription`, `widgetDomain`, `resourcePath`)
- Invocation status strings (`invoking`, `invoked`)
- Input schema fields (`inputSchemaFields`) used to generate Zod schemas in `route.ts`

Adding tools is mostly declarative: add a new entry in `MCP_TOOLS` and ensure the referenced widget route exists.

## Using the app in ChatGPT

1. Deploy the app (typically Vercel).
2. In ChatGPT, configure a connector to `https://<your-domain>/mcp`.
3. Invoke one of the registered tools (currently `show_content`).
4. ChatGPT renders the widget template returned by `openai/outputTemplate`.

When running outside ChatGPT, `app/page.tsx` intentionally shows a banner if `window.openai` is unavailable.

## Deployment notes

- `baseUrl.ts` resolves:
  - `http://localhost:3000` in development
  - Vercel production URL in production
  - Vercel preview/branch URL in preview deployments
- `middleware.ts` injects permissive CORS headers and handles `OPTIONS` preflight.
- `app/layout.tsx` injects `NextChatSDKBootstrap`, which is required for iframe-safe routing/fetch behavior inside ChatGPT.

## Troubleshooting

- **Widget renders blank in ChatGPT**
  - Confirm the tool response includes `_meta["openai/outputTemplate"]`.
  - Confirm the matching resource is registered with `text/html+skybridge`.
- **MCP route fails cross-origin requests**
  - Confirm `middleware.ts` is active and returning CORS headers for `OPTIONS`, `GET`, and `POST`.
- **Widget works locally but not in deployment**
  - Confirm `baseUrl.ts` resolves to the deployed domain and not localhost.
  - Verify your ChatGPT connector points to the deployed `/mcp` endpoint.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
