# GPT Domain App

A Next.js 16 ChatGPT App that exposes an MCP server at `/mcp` and renders an interactive widget inside ChatGPT via the OpenAI Apps SDK bridge APIs.

## Overview

This repository demonstrates an end-to-end MCP app setup:

- MCP route registration (resources + tools) in `app/mcp/route.ts`
- A shared tool registry in `mcpTools.ts` used by both server and UI
- A widget page (`app/page.tsx`) that auto-lists available MCP tools
- ChatGPT iframe compatibility bootstrap logic in `app/layout.tsx`
- Global CORS middleware required for ChatGPT <-> MCP communication

## Current MCP tools

The app currently ships with one example tool:

| Tool ID | Title | Purpose | Resource Path |
| --- | --- | --- | --- |
| `show_content` | Show Content | Displays homepage content using the provided user name | `/` |

Tool definitions are maintained in `mcpTools.ts` and loaded dynamically by the MCP route handler.

## Tech stack

- **Framework:** Next.js App Router
- **Language:** TypeScript (strict mode)
- **UI:** React 19
- **MCP:** `@modelcontextprotocol/sdk` + `mcp-handler`
- **Validation:** Zod
- **Styling:** Tailwind CSS v4
- **Package manager:** pnpm

## Architecture

### MCP server (`app/mcp/route.ts`)

For each entry in `MCP_TOOLS`, the handler:

1. Fetches widget HTML from the configured `resourcePath`
2. Registers a `text/html+skybridge` resource
3. Registers a tool with a Zod input schema generated from registry fields
4. Returns `content`, `structuredContent`, and `_meta` (including widget metadata)

The `widgetMeta()` helper centralizes OpenAI metadata keys like:

- `openai/outputTemplate`
- `openai/toolInvocation/invoking`
- `openai/toolInvocation/invoked`
- `openai/resultCanProduceWidget`

### Widget UI (`app/page.tsx`)

The main page:

- Reads tool output through `useWidgetProps()`
- Displays ChatGPT display mode information
- Renders a live directory of MCP tools from `MCP_TOOLS`
- Shows an informational banner when `window.openai` is unavailable (non-ChatGPT runtime)

### ChatGPT bootstrap (`app/layout.tsx`)

`NextChatSDKBootstrap` injects scripts that help the app run correctly inside ChatGPT iframes:

- Sets `<base href>` to the resolved app URL
- Patches `history.pushState` / `replaceState`
- Rewrites same-origin iframe `fetch` calls to the app origin as needed
- Opens external links via `window.openai.openExternal` when possible
- Removes unexpected `<html>` attributes inserted by host environments

### CORS (`middleware.ts`)

All routes receive permissive CORS headers and `OPTIONS` preflight handling so ChatGPT can call MCP endpoints without cross-origin failures.

## Project structure

```text
app/
├── mcp/route.ts              # MCP resource + tool registration
├── hooks/                    # OpenAI Apps SDK helper hooks
├── custom-page/page.tsx      # Secondary route example
├── page.tsx                  # Main widget and MCP tool directory
├── layout.tsx                # Root layout + ChatGPT bootstrap
└── globals.css               # Global styles
baseUrl.ts                    # Runtime base URL resolution (local + Vercel)
middleware.ts                 # Global CORS handling
mcpTools.ts                   # Shared MCP tool registry and typing
```

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Run locally

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

## Available scripts

| Script | Command | Description |
| --- | --- | --- |
| Development | `pnpm dev` | Start Next.js with Turbopack |
| Build | `pnpm build` | Create production build |
| Start | `pnpm start` | Run production server |

## Using this app in ChatGPT

1. Deploy the project (typically on Vercel).
2. Configure a ChatGPT connector using `https://<your-domain>/mcp`.
3. Invoke a registered MCP tool (for example, `show_content`).
4. ChatGPT will resolve the widget template and render the UI response.

## Adding a new MCP tool

1. Add a new entry to `MCP_TOOLS` in `mcpTools.ts`:
   - tool `id`, `title`, `description`
   - template URI and invocation text
   - widget metadata and `resourcePath`
   - input schema fields
2. Ensure the UI page referenced by `resourcePath` exists under `app/`.
3. The MCP route will auto-register both the resource and tool from the new definition.
4. (Optional) Update `app/page.tsx` if you want extra custom rendering beyond the auto-generated tool directory.

## Deployment notes

`baseUrl.ts` resolves the app URL automatically:

- `http://localhost:3000` in development
- `VERCEL_PROJECT_PRODUCTION_URL` in production
- `VERCEL_BRANCH_URL` (or `VERCEL_URL`) for previews

No custom environment variables are required for standard Vercel deployments.

## References

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- Model Context Protocol: https://modelcontextprotocol.io
- Next.js docs: https://nextjs.org/docs
