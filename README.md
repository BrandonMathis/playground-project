# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget UI inside ChatGPT via OpenAI Apps SDK bridge APIs.

## Overview

This repository demonstrates a complete MCP + widget flow:

- MCP endpoint (`app/mcp/route.ts`) serving both `GET` and `POST` at `/mcp`
- Tool definitions centralized in `mcpTools.ts` and registered dynamically
- Widget resources served as `text/html+skybridge`
- Client widget UI (`app/page.tsx`) that consumes tool output via Apps SDK hooks
- Iframe-safe ChatGPT bootstrap in `app/layout.tsx`
- Global CORS middleware required for cross-origin MCP calls

The default tool currently registered is `show_content`.

## Tech stack

- Framework: Next.js App Router + TypeScript (strict mode)
- Runtime/UI: React 19
- MCP: `@modelcontextprotocol/sdk` + `mcp-handler`
- Validation: Zod
- Styling: Tailwind CSS v4
- Package manager: pnpm

## Repository layout

```text
app/
├── mcp/route.ts              # MCP resources + tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary example route
├── page.tsx                  # Main widget UI rendered in ChatGPT
├── layout.tsx                # Root layout + NextChatSDKBootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # Global CORS handling for MCP/browser requests
mcpTools.ts                   # MCP tool definitions used by route registration
```

## How MCP tool registration works

`app/mcp/route.ts` loops through `MCP_TOOLS` from `mcpTools.ts` and, for each tool:

1. Fetches widget HTML from the configured `resourcePath`.
2. Registers a resource with MIME type `text/html+skybridge`.
3. Registers a tool with a generated Zod input schema based on `inputSchemaFields`.
4. Returns tool output with `content`, `structuredContent`, and `_meta`.

The helper `widgetMeta()` keeps OpenAI metadata consistent across tool responses.

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

### Build and run production bundle

```bash
pnpm build
pnpm start
```

## Scripts

- `pnpm dev`: run Next.js with Turbopack
- `pnpm build`: create production build with Turbopack
- `pnpm start`: start production server

## Using the app in ChatGPT

1. Deploy the app (typically on Vercel).
2. Create a connector in ChatGPT that points to `https://<your-domain>/mcp`.
3. Invoke a registered tool (for example, `show_content`) to render the widget.

When running outside ChatGPT, the home page intentionally shows a fallback banner if `window.openai` is not available.

## Deployment notes

- `baseUrl.ts` resolves:
  - `http://localhost:3000` in development
  - Vercel production URL in production
  - Vercel preview/branch URL for non-production deploys
- `middleware.ts` sets permissive CORS headers and handles `OPTIONS` preflight.
- `app/layout.tsx` injects `NextChatSDKBootstrap`, which is required for iframe-safe routing and fetch behavior in ChatGPT.

## Adding a new MCP tool

1. Add a new object to `MCP_TOOLS` in `mcpTools.ts` (`id`, `title`, description metadata, `resourcePath`, and `inputSchemaFields`).
2. Add or update widget UI under `app/` for the new resource path.
3. Ensure the tool input field list in `mcpTools.ts` matches what the UI expects.
4. Start the app and invoke the tool through ChatGPT to confirm output rendering.

No additional route wiring is required when using `MCP_TOOLS`; `app/mcp/route.ts` registers all configured tools automatically.

## Contributor workflow

1. Make changes in a feature branch.
2. Run `pnpm build` before opening a pull request.
3. Open a PR with a summary of user-visible behavior changes.

## Troubleshooting

- Widget does not render in ChatGPT:
  - Verify the connector points to `/mcp`.
  - Check that the tool response includes `openai/outputTemplate` metadata.
- CORS errors:
  - Confirm `middleware.ts` is present and unchanged.
- UI behaves differently in browser vs ChatGPT:
  - The browser path is expected to show fallback behavior when `window.openai` is missing.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
