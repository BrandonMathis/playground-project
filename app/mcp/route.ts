import { baseURL } from "@/baseUrl";
import { mcpToolCatalog, type McpToolCatalogEntry } from "@/mcpCatalog";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

function widgetMeta(widget: McpToolCatalogEntry) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

function buildInputSchema(tool: McpToolCatalogEntry) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of tool.inputFields) {
    let fieldSchema: z.ZodTypeAny = z.string().describe(field.description);

    if (!(field.required ?? true)) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return shape;
}

const handler = createMcpHandler(async (server) => {
  const htmlByPath = new Map<string, string>();

  for (const tool of mcpToolCatalog) {
    let pageHtml = htmlByPath.get(tool.pagePath);
    if (!pageHtml) {
      pageHtml = await getAppsSdkCompatibleHtml(baseURL, tool.pagePath);
      htmlByPath.set(tool.pagePath, pageHtml);
    }

    server.registerResource(
      `${tool.id}-widget`,
      tool.templateUri,
      {
        title: tool.title,
        description: tool.widgetDescription,
        mimeType: "text/html+skybridge",
        _meta: {
          "openai/widgetDescription": tool.widgetDescription,
          "openai/widgetPrefersBorder": true,
        },
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "text/html+skybridge",
            text: `<html>${pageHtml}</html>`,
            _meta: {
              "openai/widgetDescription": tool.widgetDescription,
              "openai/widgetPrefersBorder": true,
              "openai/widgetDomain": tool.widgetDomain,
            },
          },
        ],
      })
    );

    server.registerTool(
      tool.id,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: buildInputSchema(tool),
        _meta: widgetMeta(tool),
      },
      async (inputArgs) => {
        const firstStringArg = Object.values(inputArgs).find(
          (value): value is string => typeof value === "string" && value.length > 0
        );
        const normalizedArgs = Object.fromEntries(
          Object.entries(inputArgs).filter(([, value]) => value !== undefined)
        );

        return {
          content: [
            {
              type: "text",
              text: firstStringArg ?? tool.title,
            },
          ],
          structuredContent: {
            ...normalizedArgs,
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(tool),
        };
      }
    );
  }
});

export const GET = handler;
export const POST = handler;
