"use client";

import { MCP_TOOLS } from "@/mcpTools";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
} from "./hooks";

export default function Home() {
  const toolOutput = useWidgetProps<{
    name?: string;
    result?: { structuredContent?: { name?: string } };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const name = toolOutput?.result?.structuredContent?.name || toolOutput?.name;
  const timestamp = new Date().toISOString();

  return (
    <div
      className="font-sans mx-auto max-w-5xl p-6 pb-10 sm:p-10 space-y-6"
      style={{
        maxHeight,
        height: displayMode === "fullscreen" ? maxHeight : undefined,
        overflowY: "auto",
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
      <main className="flex flex-col gap-6">
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

        <section className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">MCP Tool Directory</h1>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            This page summarizes the MCP tools available in this app. The list is
            automatically generated from the shared MCP tool registry used by the server
            route.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-medium">MCP endpoint</p>
            <p className="font-mono text-slate-700 dark:text-slate-300">/mcp</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-medium">Registered tools</p>
            <p className="font-mono text-slate-700 dark:text-slate-300">
              {MCP_TOOLS.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-medium">Display mode</p>
            <p className="font-mono text-slate-700 dark:text-slate-300">
              {displayMode ?? "unknown"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <p className="font-medium">Last render (UTC)</p>
            <p className="font-mono text-slate-700 dark:text-slate-300">{timestamp}</p>
          </div>
        </section>

        {name && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 px-4 py-3 text-sm">
            Name returned from tool call: <span className="font-semibold">{name}</span>
          </p>
        )}

        <section className="space-y-4">
          {MCP_TOOLS.map((tool) => (
            <article
              key={tool.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
            >
              <header>
                <h2 className="text-lg font-semibold">{tool.title}</h2>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {tool.id}
                </p>
              </header>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {tool.description}
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="font-medium">Template URI</dt>
                  <dd className="font-mono text-slate-700 dark:text-slate-300">
                    {tool.templateUri}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Resource path</dt>
                  <dd className="font-mono text-slate-700 dark:text-slate-300">
                    {tool.resourcePath}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Invoking text</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{tool.invoking}</dd>
                </div>
                <div>
                  <dt className="font-medium">Invoked text</dt>
                  <dd className="text-slate-700 dark:text-slate-300">{tool.invoked}</dd>
                </div>
              </dl>
              <div>
                <h3 className="text-sm font-medium mb-2">Input schema</h3>
                <ul className="space-y-1">
                  {tool.inputSchemaFields.map((field) => (
                    <li
                      key={field.name}
                      className="text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono">{field.name}</span> (
                      <span className="font-mono">{field.type}</span>
                      {field.required === false ? ", optional" : ", required"}):{" "}
                      {field.description}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
