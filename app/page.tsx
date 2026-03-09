"use client";

import { useDisplayMode, useIsChatGptApp, useMaxHeight, useRequestDisplayMode, useWidgetProps } from "./hooks";
import { MCP_SERVER_PATH, TOOL_CATALOG } from "./mcp/toolCatalog";

export default function Home() {
  const toolOutput = useWidgetProps<{
    result?: { structuredContent?: Record<string, unknown> };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const structuredContent = toolOutput?.result?.structuredContent;

  return (
    <div
      className="font-sans min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-6 sm:p-10"
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
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
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
          <h1 className="text-2xl sm:text-3xl font-semibold">MCP Tool Homepage</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This page is auto-generated from the shared MCP tool catalog used by the server.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">MCP route</p>
            <p className="font-mono text-sm mt-1">{MCP_SERVER_PATH}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Registered tools</p>
            <p className="text-lg font-semibold mt-1">{TOOL_CATALOG.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Display mode</p>
            <p className="text-sm mt-1">{displayMode}</p>
          </div>
        </section>

        {structuredContent && (
          <section className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <h2 className="font-semibold text-sm mb-2">Latest tool structured output</h2>
            <pre className="text-xs whitespace-pre-wrap break-all">
              {JSON.stringify(structuredContent, null, 2)}
            </pre>
          </section>
        )}

        <section className="space-y-3">
          {TOOL_CATALOG.map((tool) => (
            <article
              key={tool.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{tool.title}</h2>
                  <p className="font-mono text-xs text-slate-500 mt-1">{tool.id}</p>
                </div>
                <span className="rounded-full px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800">
                  {tool.templateUri}
                </span>
              </div>
              <p className="text-sm mt-3">{tool.purpose}</p>
              <dl className="mt-4 grid gap-2 text-sm">
                <div>
                  <dt className="font-medium">Tool description (for model):</dt>
                  <dd className="text-slate-600 dark:text-slate-300">{tool.description}</dd>
                </div>
                <div>
                  <dt className="font-medium">Resource description:</dt>
                  <dd className="text-slate-600 dark:text-slate-300">{tool.resourceDescription}</dd>
                </div>
                <div>
                  <dt className="font-medium">Invocation text:</dt>
                  <dd className="text-slate-600 dark:text-slate-300">
                    <code>{tool.invoking}</code> {"->"} <code>{tool.invoked}</code>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Widget domain:</dt>
                  <dd className="font-mono text-xs text-slate-600 dark:text-slate-300">{tool.widgetDomain}</dd>
                </div>
                <div>
                  <dt className="font-medium">Input fields:</dt>
                  <dd className="text-slate-600 dark:text-slate-300">
                    {tool.inputFields.length === 0
                      ? "None"
                      : tool.inputFields
                          .map(
                            (field) =>
                              `${field.name}: ${field.type}${field.required ? " (required)" : " (optional)"} - ${field.description}`
                          )
                          .join("; ")}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
