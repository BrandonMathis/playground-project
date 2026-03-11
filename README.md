# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders a widget UI inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## Overview

This repository is a minimal, production-ready template for building ChatGPT Apps that:

- serve MCP tools from a Next.js App Router route
- return `text/html+skybridge` resources for widget rendering
- render tool output in a client-side widget UI
- handle iframe constraints required by ChatGPT

The default sample tool is `show_content`.

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
├── mcp/route.ts                # MCP server: tools + resources exposed at /mcp
├── hooks/                      # ChatGPT/OpenAI bridge hooks for widget components
│   ├── use-widget-props.ts     # Reads structured tool output in the widget
│   ├── use-call-tool.ts        # Invokes MCP tools from client components
│   └── ...                     # Display mode, messaging, and window.openai helpers
├── custom-page/page.tsx        # Secondary example route
├── page.tsx                    # Main widget UI shown in ChatGPT
├── layout.tsx                  # Root layout + NextChatSDKBootstrap
└── globals.css                 # Global styles
baseUrl.ts                      # Runtime base URL resolution (local + Vercel)
middleware.ts                   # Global CORS handling for MCP/browser requests
mcpTools.ts                     # Central metadata used to describe tool definitions
```

## Scripts

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `pnpm dev`   | Start local dev server (Turbopack)   |
| `pnpm build` | Create production build (Turbopack)  |
| `pnpm start` | Run production server from build     |

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

### Production run

```bash
pnpm build
pnpm start
```

## MCP and widget architecture

1. `app/mcp/route.ts` exports `GET` and `POST` via `createMcpHandler(...)`.
2. The handler registers a resource with MIME type `text/html+skybridge`.
3. The handler registers one or more tools with Zod schemas and widget metadata.
4. Tool execution returns:
   - `content` (conversation-visible text)
   - `structuredContent` (typed payload consumed by widget)
   - `_meta` (OpenAI widget metadata)
5. ChatGPT resolves `openai/outputTemplate` and renders the widget resource.

`widgetMeta()` centralizes required OpenAI metadata so tool declarations remain consistent.

## ChatGPT embedding behavior

- `app/layout.tsx` injects `NextChatSDKBootstrap` in `<head>`.
- The bootstrap:
  - sets a safe `<base href>` for iframe asset resolution
  - patches `history.pushState` and `replaceState` for embedded navigation
  - patches `fetch` to keep requests routed to app origin
- `middleware.ts` applies permissive CORS headers and handles `OPTIONS` preflight requests.

These pieces are required for reliable ChatGPT iframe behavior and MCP communication.

## Using the app in ChatGPT

1. Deploy this app (typically on Vercel).
2. Configure a ChatGPT connector to `https://<your-domain>/mcp`.
3. Invoke a registered tool (for example `show_content`) to render the widget.

When opened outside ChatGPT, `app/page.tsx` intentionally displays a banner when `window.openai` is unavailable.

## Deployment notes

`baseUrl.ts` resolves runtime origin automatically:

- `http://localhost:3000` in local development
- `VERCEL_PROJECT_PRODUCTION_URL` in production
- preview/branch URL on non-production Vercel environments

No custom deployment config is required for standard Vercel usage.

## Adding a new MCP tool

1. Add tool metadata (and optionally update `mcpTools.ts` for UI listing use cases).
2. In `app/mcp/route.ts`, register a resource template with `registerResource`.
3. Register the tool with `registerTool` and a Zod input schema.
4. Return `content`, `structuredContent`, and `_meta` from the tool handler.
5. Add or update the widget UI under `app/` if the new tool needs custom rendering.

## Contributor workflow

1. Create a branch from `main`.
2. Make focused changes with clear commit messages.
3. Run build checks locally:

   ```bash
   pnpm build
   ```

4. Open a pull request and include:
   - what changed
   - how it was validated
   - any behavior differences for ChatGPT embedding

## Troubleshooting

- **Widget renders with missing data**
  - verify tool returns `structuredContent` and expected `_meta`.
- **CORS or preflight failures**
  - confirm `middleware.ts` is active and route is not bypassing middleware.
- **App works locally but not in ChatGPT iframe**
  - verify `NextChatSDKBootstrap` remains included in `app/layout.tsx`.
- **Incorrect app origin in hosted environment**
  - check Vercel environment variables used by `baseUrl.ts`.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
