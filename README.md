# GPT Domain App

Production-ready Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget inside ChatGPT using the OpenAI Apps SDK bridge APIs.

## What this project does

- Hosts an MCP endpoint (`app/mcp/route.ts`) with dynamically registered tools from `mcpTools.ts` (currently `show_content`)
- Registers a widget resource (`text/html+skybridge`) used by ChatGPT to render app UI
- Renders a client-side widget (`app/page.tsx`) that reads tool output via Apps SDK hooks
- Includes iframe-safe bootstrap logic in the root layout so navigation and fetch work in ChatGPT
- Adds permissive CORS middleware required for MCP communication from ChatGPT
- Builds a homepage (`/`) that documents MCP tools and their input schema details

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
mcpTools.ts                  # Shared MCP tool definitions used by route + UI
```

## How MCP wiring works

1. `createMcpHandler` creates `GET` and `POST` handlers for `/mcp`.
2. A resource is registered with MIME type `text/html+skybridge`.
3. A tool is registered with a Zod input schema and OpenAI widget metadata.
4. Tool output returns `content`, `structuredContent`, and `_meta`.
5. ChatGPT resolves `openai/outputTemplate` to render the widget from the resource.
6. The widget reads the tool's `structuredContent` via `useWidgetProps()`.

The helper `widgetMeta()` in `app/mcp/route.ts` centralizes the required OpenAI metadata keys so tool/resource behavior stays consistent.

## Request flow at a glance

```text
ChatGPT -> POST /mcp (tool call)
       -> app/mcp/route.ts tool handler
       -> content + structuredContent + _meta returned
       -> ChatGPT resolves openai/outputTemplate resource
       -> app/page.tsx widget reads props from Apps SDK hooks
       -> widget renders tool output
```

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

1. Create or pick a Linear issue.
2. Implement changes in a dedicated branch.
3. Run `pnpm build` to validate TypeScript and Next.js compilation.
4. Open a pull request with a concise summary and testing notes.
5. After merge, verify the deployed MCP endpoint still serves `/mcp` and widget resources.

## Troubleshooting

### Widget shows "no window.openai detected"

Expected when loading the page directly in a browser. The widget bridge only exists when the app is rendered inside ChatGPT.

### MCP resource fails to render in ChatGPT

Check:

- `/mcp` is reachable from the deployed URL.
- `middleware.ts` is still applying CORS headers.
- `openai/outputTemplate` matches the registered resource URI.
- Resource content is returned with `mimeType: "text/html+skybridge"`.

### Local HTML fetch in MCP route fails

The MCP route fetches widget HTML from `baseURL + resourcePath`. Confirm:

- the dev server is running (`pnpm dev`)
- `baseUrl.ts` resolves to `http://localhost:3000` in development
- the referenced `resourcePath` exists under `app/`

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
5. Add/update the corresponding tool definition in `mcpTools.ts` so the homepage and MCP route stay in sync.
6. If needed, add/update widget UI under `app/` and reference it from the resource.

## Useful links

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- MCP spec: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
