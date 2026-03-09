"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
} from "./hooks";

type JsonRpcSuccess<T> = {
  jsonrpc: "2.0";
  id: string | number;
  result: T;
};

type JsonRpcFailure = {
  jsonrpc: "2.0";
  id: string | number | null;
  error: { code: number; message: string };
};

type McpTool = {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, { type?: string; description?: string }>;
    required?: string[];
  };
};

type McpResource = {
  uri: string;
  name?: string;
  title?: string;
  description?: string;
  mimeType?: string;
};

type McpToolsListResult = { tools?: McpTool[] };
type McpResourcesListResult = { resources?: McpResource[] };

async function mcpCall<T>(method: string): Promise<T> {
  const response = await fetch("/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: method,
      method,
      params: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP request failed with HTTP ${response.status}`);
  }

  const data = (await response.json()) as JsonRpcSuccess<T> | JsonRpcFailure;
  if ("error" in data) {
    throw new Error(data.error.message);
  }

  return data.result;
}

function renderFieldType(value?: string) {
  return value ?? "unknown";
}

export default function Home() {
  const toolOutput = useWidgetProps<{
    name?: string;
    result?: { structuredContent?: { name?: string; timestamp?: string } };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const [tools, setTools] = useState<McpTool[]>([]);
  const [resources, setResources] = useState<McpResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const name = toolOutput?.result?.structuredContent?.name || toolOutput?.name;
  const timestamp = toolOutput?.result?.structuredContent?.timestamp;
  const mcpEndpoint = useMemo(() => "/mcp", []);

  const loadMcpSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [toolsResult, resourcesResult] = await Promise.all([
        mcpCall<McpToolsListResult>("tools/list"),
        mcpCall<McpResourcesListResult>("resources/list").catch(() => ({
          resources: [],
        })),
      ]);

      setTools(toolsResult.tools ?? []);
      setResources(resourcesResult.resources ?? []);
      setLastRefreshedAt(new Date().toISOString());
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to fetch MCP summary";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMcpSummary();
  }, [loadMcpSummary]);

  return (
    <div
      className="font-sans p-6 sm:p-10"
      style={{
        maxHeight,
        minHeight: displayMode === "fullscreen" ? maxHeight : undefined,
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
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/70 dark:bg-slate-900/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                MCP Homepage
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Live summary of registered MCP tools, LLM-facing descriptions,
                and top-level endpoint details.
              </p>
            </div>
            <button
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => void loadMcpSummary()}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                MCP endpoint
              </p>
              <p className="mt-1 font-mono text-sm">{mcpEndpoint}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Registered tools
              </p>
              <p className="mt-1 text-xl font-semibold">{tools.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Registered resources
              </p>
              <p className="mt-1 text-xl font-semibold">{resources.length}</p>
            </div>
          </div>

          {lastRefreshedAt && (
            <p className="mt-3 text-xs text-slate-500">
              Last refreshed: {new Date(lastRefreshedAt).toLocaleString()}
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              Could not load MCP definitions: {error}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/70 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold">MCP Tools</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            This list is fetched from the MCP server using{" "}
            <span className="font-mono">tools/list</span>, so new tools appear
            here automatically.
          </p>

          {isLoading ? (
            <p className="mt-4 text-sm text-slate-500">Loading tools...</p>
          ) : tools.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No tools discovered from the MCP server.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {tools.map((tool) => {
                const properties = tool.inputSchema?.properties ?? {};
                const requiredFields = new Set(tool.inputSchema?.required ?? []);
                const fieldEntries = Object.entries(properties);

                return (
                  <article
                    key={tool.name}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{tool.title ?? tool.name}</h3>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono">
                        {tool.name}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      {tool.description ?? "No description provided to the LLM."}
                    </p>

                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Input schema
                      </p>
                      {fieldEntries.length === 0 ? (
                        <p className="mt-1 text-sm text-slate-500">
                          No input fields.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {fieldEntries.map(([fieldName, field]) => (
                            <li key={fieldName} className="text-sm">
                              <span className="font-mono">{fieldName}</span>
                              <span className="ml-2 text-slate-500">
                                ({renderFieldType(field.type)})
                                {requiredFields.has(fieldName) ? " required" : ""}
                              </span>
                              <p className="text-slate-600 dark:text-slate-300">
                                {field.description ??
                                  "No field description provided to the LLM."}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/70 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold">MCP Resources</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Resources returned by <span className="font-mono">resources/list</span>.
          </p>

          {isLoading ? (
            <p className="mt-4 text-sm text-slate-500">Loading resources...</p>
          ) : resources.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No resources discovered from the MCP server.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {resources.map((resource) => (
                <li
                  key={resource.uri}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 text-sm"
                >
                  <p className="font-semibold">
                    {resource.title ?? resource.name ?? resource.uri}
                  </p>
                  <p className="mt-1 font-mono text-xs break-all text-slate-500">
                    {resource.uri}
                  </p>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">
                    {resource.description ??
                      "No resource description provided to the LLM."}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    MIME type: {resource.mimeType ?? "unknown"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/70 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold">Latest tool payload</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Values currently available in widget props from the most recent tool
            invocation.
          </p>
          <ul className="mt-3 text-sm space-y-1">
            <li>
              Name:{" "}
              <span className="font-mono">{name ?? "Not provided yet"}</span>
            </li>
            <li>
              Timestamp:{" "}
              <span className="font-mono">{timestamp ?? "Not provided yet"}</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
