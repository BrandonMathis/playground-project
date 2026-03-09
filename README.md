# GPT Domain App

ChatGPT App built with Next.js App Router that exposes an MCP server at `/mcp` and renders widget UI inside ChatGPT.

## What this repository contains

- A Next.js 16 app (`app/`) that renders a widget experience.
- An MCP server route (`app/mcp/route.ts`) powered by `mcp-handler` and Zod schemas.
- OpenAI Apps SDK client hooks (`app/hooks/`) used by the widget page.
- Runtime bootstrap logic in `app/layout.tsx` to make iframe rendering and navigation work in ChatGPT.
- Global CORS middleware (`middleware.ts`) so ChatGPT can call the MCP endpoint across origins.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript (strict mode)
- React 19
- Tailwind CSS v4
- `@modelcontextprotocol/sdk`
- `mcp-handler`
- Zod
- pnpm

## Quick start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
pnpm dev     # local development
pnpm build   # production build check
pnpm start   # run built app
```

## MCP endpoint

The MCP server is available at:

```text
http://localhost:3000/mcp
```

In production, use your deployed URL (for example `https://your-app.vercel.app/mcp`).

## Current MCP implementation

`app/mcp/route.ts` registers one widget resource and one tool:

- **Tool ID:** `show_content`
- **Input:** `{ name: string }`
- **Behavior:** returns `content` + `structuredContent` with the provided name and timestamp
- **Template URI:** `ui://widget/content-template.html`

The tool and resource are connected through OpenAI widget metadata:

- `openai/outputTemplate`
- `openai/toolInvocation/invoking`
- `openai/toolInvocation/invoked`
- `openai/resultCanProduceWidget`
- `openai/widgetAccessible`

## Architecture notes

### `app/layout.tsx`

Includes `NextChatSDKBootstrap` in `<head>`, which:

- sets `<base href>` for iframe-safe asset and navigation behavior
- patches `history.pushState` and `history.replaceState`
- intercepts `fetch` for same-origin request rewriting in iframe contexts
- redirects external links via `window.openai.openExternal` when available
- guards against injected `<html>` attributes that can break hydration

### `next.config.ts`

Uses `assetPrefix: baseURL` so `/_next` assets resolve correctly when rendered in ChatGPT iframes.

### `middleware.ts`

Adds permissive CORS headers and handles OPTIONS preflight requests for all paths.

### `baseUrl.ts`

Builds the runtime base URL from Vercel environment variables:

- `VERCEL_PROJECT_PRODUCTION_URL` for production
- `VERCEL_BRANCH_URL` or `VERCEL_URL` for preview/branch deployments
- `http://localhost:3000` in development

## Project structure

```text
app/
  custom-page/page.tsx
  hooks/
    index.ts
    types.ts
    use-call-tool.ts
    use-display-mode.ts
    use-is-chatgpt-app.ts
    use-max-height.ts
    use-open-external.ts
    use-openai-global.ts
    use-request-display-mode.ts
    use-send-message.ts
    use-widget-props.ts
    use-widget-state.ts
  mcp/route.ts
  globals.css
  layout.tsx
  page.tsx
baseUrl.ts
middleware.ts
next.config.ts
```

## Adding a new MCP tool

1. Define a widget config object in `app/mcp/route.ts`.
2. Register a resource (`server.registerResource`) with `text/html+skybridge`.
3. Register a tool (`server.registerTool`) with a Zod input schema.
4. Return `content`, `structuredContent`, and `_meta` from the tool handler.
5. Point `openai/outputTemplate` to the resource template URI.

## Deployment

Deploy to Vercel. No custom deploy config is required for this repository; base URL resolution is handled by `baseUrl.ts`.

After deployment, add the `/mcp` URL as a connector in ChatGPT developer settings.
