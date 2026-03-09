# GPT Domain App

A Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an
interactive widget UI inside ChatGPT conversations.

## Overview

This repository demonstrates a complete OpenAI Apps SDK + MCP integration:

- A typed MCP tool registry in `mcpTools.ts`
- Dynamic MCP resource/tool registration in `app/mcp/route.ts`
- A widget UI that reads tool output in `app/page.tsx`
- ChatGPT iframe compatibility bootstrap in `app/layout.tsx`
- Global CORS middleware in `middleware.ts` for MCP requests

The main page doubles as a live "tool directory", so it stays aligned with the
same `MCP_TOOLS` registry used by the server.

## Tech stack

- **Framework:** Next.js App Router
- **Language:** TypeScript (strict mode)
- **UI runtime:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Project structure

```text
app/
├── mcp/route.ts              # MCP route: register resources/tools from MCP_TOOLS
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget/tool directory page
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
mcpTools.ts                   # Shared MCP tool definitions
middleware.ts                 # Global CORS handling for browser/MCP requests
```

## MCP architecture

`app/mcp/route.ts` builds the MCP endpoint with `createMcpHandler` and then
iterates through `MCP_TOOLS` to:

1. Fetch the HTML for each tool's `resourcePath`
2. Register an MCP resource with MIME type `text/html+skybridge`
3. Register an MCP tool with a Zod input schema derived from the shared
   `inputSchemaFields`
4. Return `content`, `structuredContent`, and `_meta` from the tool handler

`widgetMeta()` centralizes required OpenAI metadata keys:

- `openai/outputTemplate`
- `openai/toolInvocation/invoking`
- `openai/toolInvocation/invoked`
- `openai/widgetAccessible`
- `openai/resultCanProduceWidget`

## Current MCP tools

Tools are defined in `mcpTools.ts`.

### `show_content`

- **Title:** Show Content
- **Purpose:** Fetch and display homepage content personalized with a `name`
  input
- **Template URI:** `ui://widget/content-template.html`
- **Resource path:** `/`
- **Input schema:**
  - `name` (`string`, required): The name to display in output content

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

1. Deploy the app (typically on Vercel).
2. Configure a ChatGPT connector that points to `https://<your-domain>/mcp`.
3. Call a registered MCP tool (for example `show_content`) from ChatGPT.

When opened outside ChatGPT, `app/page.tsx` intentionally shows a banner when
`window.openai` is unavailable.

## Deployment behavior

`baseUrl.ts` resolves runtime base URL automatically:

- Development: `http://localhost:3000`
- Vercel production: `VERCEL_PROJECT_PRODUCTION_URL`
- Vercel preview: `VERCEL_BRANCH_URL` or `VERCEL_URL`

`middleware.ts` applies permissive CORS headers to all routes and handles
`OPTIONS` preflight requests.

`app/layout.tsx` injects `NextChatSDKBootstrap` for iframe-safe behavior in
ChatGPT:

- Sets `<base href>`
- Patches `history.pushState` and `history.replaceState`
- Rewrites certain fetch calls to app origin
- Uses a mutation observer to strip unsupported attributes from `<html>`

## Contributor workflow

1. Update `mcpTools.ts` when adding or changing a tool contract.
2. Ensure `app/mcp/route.ts` can register the new resource/tool pair.
3. Validate corresponding widget UI under `app/`.
4. Run `pnpm build` before opening a PR.

## Troubleshooting

- **Widget shows fallback banner locally:** expected outside ChatGPT.
- **Tool output does not render widget:** verify `openai/outputTemplate` matches
  the registered resource URI.
- **Cross-origin errors in embedded mode:** verify CORS middleware is active and
  `baseURL` resolves to the deployed app domain.

## References

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- Model Context Protocol: https://modelcontextprotocol.io
- Next.js documentation: https://nextjs.org/docs
