# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders a widget UI inside ChatGPT using the OpenAI Apps SDK bridge APIs.

The project keeps MCP tool definitions in a shared registry (`mcpTools.ts`) so the server route and homepage stay in sync.

## What this project does

- Hosts an MCP endpoint (`app/mcp/route.ts`) with one example tool: `show_content`
- Registers a widget resource (`text/html+skybridge`) used by ChatGPT to render app UI
- Renders a client-side widget (`app/page.tsx`) that reads tool output via Apps SDK hooks
- Includes iframe-safe bootstrap logic in the root layout so navigation and fetch work in ChatGPT
- Adds permissive CORS middleware required for MCP communication from ChatGPT

## Tech stack

- **Framework:** Next.js 16 App Router (TypeScript strict mode)
- **Runtime/UI:** React 19 + React DOM 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Project structure

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
mcpTools.ts                   # Shared MCP tool registry used by route + UI
```

## NPM scripts

| Script       | Description |
| ------------ | ----------- |
| `pnpm dev`   | Start local dev server (`next dev --turbopack`) |
| `pnpm build` | Create production build (`next build --turbopack`) |
| `pnpm start` | Run the production server (`next start`) |

No lint or test scripts are currently configured in this repository.

## How MCP wiring works in this codebase

1. `mcpTools.ts` defines `MCP_TOOLS` (tool id, descriptions, schema fields, template URI, and resource path).
2. `app/mcp/route.ts` loops over that registry and:
   - fetches each tool page HTML from `resourcePath`
   - registers a `text/html+skybridge` resource
   - registers a tool with a Zod schema generated from `inputSchemaFields`
3. Tool handlers return:
   - `content` (plain text summary for chat)
   - `structuredContent` (typed data used by widget UI)
   - `_meta` (OpenAI Apps metadata like `openai/outputTemplate`)
4. `app/page.tsx` renders a generated directory of tools from `MCP_TOOLS` and reads tool-call data with `useWidgetProps()`.
5. `app/layout.tsx` injects `NextChatSDKBootstrap` so iframe history/fetch behavior works correctly in ChatGPT.

## Current MCP tool registry

At the time of writing, there is one tool:

- **`show_content`**
  - Purpose: returns text/structured content and drives the main widget template
  - Input schema: required `name: string`
  - Template URI: `ui://widget/content-template.html`
  - Resource path: `/`

## Local development

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Run dev server

```bash
pnpm dev
```

App URL: `http://localhost:3000`  
MCP URL: `http://localhost:3000/mcp`

### Production build

```bash
pnpm build
pnpm start
```

## Using the app in ChatGPT

1. Deploy the app (typically on Vercel).
2. In ChatGPT, create a connector and point it to `https://<your-domain>/mcp`.
3. Invoke a registered MCP tool to render its widget.

When running outside ChatGPT, `app/page.tsx` intentionally shows a banner if `window.openai` is unavailable.

## Deployment/runtime notes

- `baseUrl.ts` selects:
  - `http://localhost:3000` in development
  - Vercel production URL in production
  - Vercel preview/branch URL otherwise
- `middleware.ts` injects permissive CORS headers for all routes and handles `OPTIONS` preflight.
- `NextChatSDKBootstrap` in `app/layout.tsx` is required for iframe-safe routing/fetch behavior in ChatGPT.

## Adding a new MCP tool

1. Add a new entry to `MCP_TOOLS` in `mcpTools.ts`:
   - unique `id`
   - human-facing `title` and `description`
   - `templateUri`, `resourcePath`, and invocation labels
   - `inputSchemaFields` with type/required metadata
2. Create or update the UI route referenced by `resourcePath` so the MCP route can fetch widget HTML.
3. Confirm the tool appears on the homepage directory (`app/page.tsx`) and is registered by `/mcp`.
4. Validate behavior locally by running `pnpm dev` and invoking the tool from a ChatGPT connector.

## Troubleshooting

- **Widget does not render in ChatGPT**
  - Verify MCP connector points to `/mcp` on the deployed domain.
  - Ensure resource responses use `text/html+skybridge`.
- **Cross-origin errors**
  - Confirm middleware CORS headers are present and preflight `OPTIONS` returns `204`.
- **Wrong base URL in preview**
  - Check Vercel environment variables (`VERCEL_ENV`, `VERCEL_BRANCH_URL`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`).

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
