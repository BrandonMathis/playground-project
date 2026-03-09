# GPT Domain App

Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders a widget UI inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## What this project does

- Hosts an MCP endpoint (`app/mcp/route.ts`) with one example tool: `show_content`
- Registers a widget resource (`text/html+skybridge`) used by ChatGPT to render app UI
- Renders a client-side widget (`app/page.tsx`) that reads tool output via Apps SDK hooks
- Includes iframe-safe bootstrap logic in the root layout so navigation and fetch work in ChatGPT
- Adds permissive CORS middleware required for MCP communication from ChatGPT

## Tech stack

- **Framework:** Next.js App Router (TypeScript strict mode)
- **Runtime/UI:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm (lockfile also includes npm compatibility)

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
```

## How MCP wiring works

1. `createMcpHandler` creates `GET` and `POST` handlers for `/mcp`.
2. A resource is registered with MIME type `text/html+skybridge`.
3. A tool is registered with a Zod input schema and OpenAI widget metadata.
4. Tool output returns `content`, `structuredContent`, and `_meta`.
5. ChatGPT resolves `openai/outputTemplate` to render the widget from the resource.

The helper `widgetMeta()` in `app/mcp/route.ts` centralizes the required OpenAI metadata keys so tool/resource behavior stays consistent.

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

## Contributor workflow

Use this flow for day-to-day updates:

1. Create a branch and implement your change.
2. Run a local build to catch type/runtime issues early:
   ```bash
   pnpm build
   ```
3. If your change touches MCP behavior, manually verify:
   - `GET /mcp` responds
   - Tool metadata and resource metadata are still present
   - The widget renders in ChatGPT (or locally with expected fallback banner)
4. Open a PR with:
   - A summary of behavior changes
   - Any new MCP tool IDs and input fields
   - Screenshots or logs when UI behavior changed

## Using the app in ChatGPT

1. Deploy the app (typically on Vercel).
2. In ChatGPT, create a connector and point it to `https://<your-domain>/mcp`.
3. Invoke the registered MCP tool from ChatGPT to render the widget.

When running outside ChatGPT, `app/page.tsx` intentionally shows a banner if `window.openai` is unavailable.

## Deployment notes

- `baseUrl.ts` selects:
  - `http://localhost:3000` in development
  - Vercel production URL in production
  - Vercel preview/branch URL otherwise
- `middleware.ts` injects CORS headers for all routes and handles `OPTIONS` preflight.
- `app/layout.tsx` injects `NextChatSDKBootstrap`, which is required for iframe-safe routing/fetch behavior in ChatGPT.

## Extending with a new MCP tool

1. Add a new widget config in `app/mcp/route.ts`.
2. Register a resource for the widget HTML (`registerResource`).
3. Register a tool with a Zod schema (`registerTool`).
4. Return `content`, `structuredContent`, and `_meta` in the handler.
5. If needed, add/update widget UI under `app/` and reference it from the resource.

For this project specifically, prefer adding tool metadata in `mcpTools.ts` first. The MCP route and homepage both use that shared registry, so new tools show up in runtime registration and in the UI documentation automatically.

## Troubleshooting

### Widget shows fallback banner ("No window.openai property detected")

This is expected outside of a ChatGPT-hosted iframe. It confirms the app is running locally but not inside a ChatGPT session.

### Tool/resource updates are not reflected

- Ensure your change is wired through `MCP_TOOLS` in `mcpTools.ts`.
- Restart `pnpm dev` after changing server route wiring.
- Confirm `templateUri` and `resourcePath` are still valid and reachable.

### MCP endpoint works locally but fails after deploy

- Verify the deployed URL is reachable and includes `/mcp`.
- Confirm Vercel environment variables are present (the app uses built-in Vercel URL vars via `baseUrl.ts`).
- Check that CORS headers are present (middleware applies them globally).

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
