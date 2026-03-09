"use client";

import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
} from "./hooks";
import { getToolSummaries, mcpServerOverview } from "./mcp/catalog";

type ToolSummary = {
  id: string;
  title: string;
  description: string;
  widgetDescription: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  inputDescription: string;
  pagePath: string;
};

export default function Home() {
  const toolOutput = useWidgetProps<{
    name?: string;
    result?: {
      structuredContent?: {
        name?: string;
        timestamp?: string;
        server?: {
          endpoint: string;
          transport: string;
          autoUpdateSource: string;
        };
        tools?: ToolSummary[];
      };
    };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const name = toolOutput?.result?.structuredContent?.name || toolOutput?.name;
  const timestamp = toolOutput?.result?.structuredContent?.timestamp;
  const server = toolOutput?.result?.structuredContent?.server ?? mcpServerOverview;
  const tools = toolOutput?.result?.structuredContent?.tools ?? getToolSummaries();

  return (
    <div
      className="font-sans p-6 sm:p-10"
      style={{
        maxHeight,
        height: displayMode === "fullscreen" ? maxHeight : undefined,
      }}
    >
      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          onClick={() => requestDisplayMode("fullscreen")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      )}

      <main className="mx-auto w-full max-w-5xl space-y-6">
        {!isChatGptApp && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 w-full">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                  This app relies on data from a ChatGPT session.
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                  No{" "}
                  <a
                    href="https://developers.openai.com/apps-sdk/reference"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline font-mono bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded"
                  >
                    window.openai
                  </a>{" "}
                  property detected
                </p>
              </div>
            </div>
          </div>
        )}

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">MCP Homepage</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Summary of registered MCP tools and key server details.
          </p>
          <p className="text-sm">
            Name returned from tool call:{" "}
            <span className="font-mono">{name ?? "not provided yet"}</span>
          </p>
          {timestamp && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last tool invocation timestamp: {timestamp}
            </p>
          )}
        </header>

        <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="text-lg font-medium mb-3">Top-level information</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-semibold">MCP endpoint:</span>{" "}
              <span className="font-mono">{server.endpoint}</span>
            </li>
            <li>
              <span className="font-semibold">Transport:</span> {server.transport}
            </li>
            <li>
              <span className="font-semibold">Auto-update source:</span>{" "}
              <span className="font-mono">{server.autoUpdateSource}</span>
            </li>
            <li>
              <span className="font-semibold">Registered tools:</span> {tools.length}
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Registered MCP tools</h2>
          <div className="grid gap-3">
            {tools.map((tool) => (
              <article
                key={tool.id}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">
                      {tool.title}{" "}
                      <span className="text-xs font-mono text-slate-500">({tool.id})</span>
                    </h3>
                    <p className="text-sm mt-1">{tool.description}</p>
                  </div>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium">Widget description (LLM-facing)</dt>
                    <dd>{tool.widgetDescription}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Template URI</dt>
                    <dd className="font-mono break-all">{tool.templateUri}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Invoking / Invoked text</dt>
                    <dd>
                      {tool.invoking} / {tool.invoked}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Input field description</dt>
                    <dd>{tool.inputDescription}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Backed by page path</dt>
                    <dd className="font-mono">{tool.pagePath}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add or modify tools in <code>app/mcp/catalog.ts</code> to update this
          homepage and MCP registration together.
        </p>
      </main>
    </div>
  );
}
