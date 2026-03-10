import { baseURL } from "@/baseUrl";
import {
  MCP_TOOLS,
  type McpToolDefinition,
  type ToolInputField,
} from "@/mcpTools";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

const zodTypeByInputType: Record<ToolInputField["type"], () => z.ZodTypeAny> = {
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
};

const createInputSchema = (tool: McpToolDefinition) =>
  Object.fromEntries(
    tool.inputSchemaFields.map((field) => {
      const baseSchemaFactory = zodTypeByInputType[field.type];
      const describedField = baseSchemaFactory().describe(field.description);
      return [
        field.name,
        field.required === false ? describedField.optional() : describedField,
      ];
    }),
  );

const createContentWidget = (
  tool: McpToolDefinition,
  html: string,
): ContentWidget => ({
  id: tool.id,
  title: tool.title,
  templateUri: tool.templateUri,
  invoking: tool.invoking,
  invoked: tool.invoked,
  html,
  description: tool.widgetDescription,
  widgetDomain: tool.widgetDomain,
});

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  for (const tool of MCP_TOOLS) {
    const html = await getAppsSdkCompatibleHtml(baseURL, tool.resourcePath);
    const contentWidget = createContentWidget(tool, html);

    server.registerResource(
      `${tool.id}-widget`,
      contentWidget.templateUri,
      {
        title: contentWidget.title,
        description: contentWidget.description,
        mimeType: "text/html+skybridge",
        _meta: {
          "openai/widgetDescription": contentWidget.description,
          "openai/widgetPrefersBorder": true,
        },
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "text/html+skybridge",
            text: `<html>${contentWidget.html}</html>`,
            _meta: {
              "openai/widgetDescription": contentWidget.description,
              "openai/widgetPrefersBorder": true,
              "openai/widgetDomain": contentWidget.widgetDomain,
            },
          },
        ],
      }),
    );

    server.registerTool(
      contentWidget.id,
      {
        title: contentWidget.title,
        description: tool.description,
        inputSchema: createInputSchema(tool),
        _meta: widgetMeta(contentWidget),
      },
      async (input) => {
        const stringInput = Object.values(input).find(
          (value): value is string => typeof value === "string",
        );

        return {
          content: [
            {
              type: "text",
              text: stringInput ?? `${contentWidget.title} executed`,
            },
          ],
          structuredContent: {
            ...input,
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(contentWidget),
        };
      },
    );
  }
});

export const GET = handler;
export const POST = handler;
