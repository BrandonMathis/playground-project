# GPT Domain App

`gpt-domain-app` is a Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget inside ChatGPT conversations.

## Overview

This repository demonstrates a complete ChatGPT App pattern:

- MCP endpoint implemented in `app/mcp/route.ts`
- Tool registry defined in `mcpTools.ts`
- Widget UI rendered from App Router pages under `app/`
- Apps SDK bridge hooks for reading tool output and interacting with ChatGPT
- CORS middleware and iframe-safe bootstrap logic needed for embedded execution

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **UI:** React 19 + Tailwind CSS v4
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Package manager:** pnpm
- **Deployment target:** Vercel

## Repository layout

```text
app/
├── mcp/route.ts                # MCP server (resource + tool registration)
├── hooks/                      # OpenAI Apps SDK helper hooks
├── page.tsx                    # Main widget UI page
├── custom-page/page.tsx        # Example secondary UI route
├── layout.tsx                  # Root layout + NextChatSDKBootstrap injection
└── globals.css                 # Global styles
baseUrl.ts                      # Environment-aware base URL resolution
mcpTools.ts                     # MCP tool definitions consumed by route.ts
middleware.ts                   # Global CORS headers + OPTIONS handling
```

## MCP request and render flow

1. ChatGPT calls `GET /mcp` or `POST /mcp`.
2. `createMcpHandler` initializes the MCP server and registers resources/tools.
3. For each entry in `MCP_TOOLS`:
   - A `text/html+skybridge` resource is registered.
   - A tool is registered with a generated Zod input schema.
4. Tool execution returns:
   - `content` for plain text fallback
   - `structuredContent` for widget data
   - `_meta` containing OpenAI widget metadata
5. ChatGPT resolves `openai/outputTemplate` and renders the widget using the registered resource template.

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Start the app

```bash
pnpm dev
```

- App URL: `http://localhost:3000`
- MCP URL: `http://localhost:3000/mcp`

### Build for production

```bash
pnpm build
pnpm start
```

## Using the app in ChatGPT

1. Deploy to a publicly reachable URL (Vercel recommended).
2. Configure a ChatGPT connector pointing to `https://<your-domain>/mcp`.
3. Invoke one of the registered tools.
4. ChatGPT renders the returned widget template in the conversation.

Outside ChatGPT, the main page intentionally shows a banner when `window.openai` is not present.

## Adding a new MCP tool

1. Add a new `McpToolDefinition` entry in `mcpTools.ts`:
   - id/title/description
   - template URI and invocation messages
   - widget metadata fields
   - resource path and input schema fields
2. Add or update the UI route under `app/` that the tool will render.
3. Confirm `app/mcp/route.ts` can fetch the UI HTML via `resourcePath`.
4. Run the app and invoke the tool to verify:
   - schema validation
   - widget rendering
   - expected `structuredContent` payload

No additional registration file is needed beyond `mcpTools.ts`; route registration is data-driven from this array.

## Deployment notes

- `baseUrl.ts` resolves:
  - localhost in development
  - Vercel production URL in production
  - Vercel preview/branch URL for non-production deploys
- `middleware.ts` applies permissive CORS headers required by ChatGPT MCP calls.
- `app/layout.tsx` injects `NextChatSDKBootstrap` for iframe-safe URL, history, and fetch behavior.

## Troubleshooting

- **Widget not rendering in ChatGPT**
  - Verify tool `_meta` includes `openai/outputTemplate`.
  - Confirm the resource template URI matches the tool metadata exactly.
- **`/mcp` requests failing due to CORS**
  - Check that middleware is running and returning `Access-Control-Allow-*` headers.
- **Incorrect resource HTML**
  - Confirm `resourcePath` points to a valid route and returns expected HTML.
- **Unexpected behavior outside ChatGPT**
  - The app intentionally degrades when `window.openai` is absent; this is expected locally.

## References

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP specification: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
