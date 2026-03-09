import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { TOOL_CATALOG, type ToolCatalogEntry } from "./toolCatalog";

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

const getFieldSchema = (field: ToolCatalogEntry["inputFields"][number]) => {
  let schema;

  switch (field.type) {
    case "number":
      schema = z.number();
      break;
    case "boolean":
      schema = z.boolean();
      break;
    case "string":
    default:
      schema = z.string();
      break;
  }

  const described = schema.describe(field.description);
  return field.required ? described : described.optional();
};

const getInputSchema = (entry: ToolCatalogEntry) =>
  Object.fromEntries(
    entry.inputFields.map((field) => [field.name, getFieldSchema(field)])
  );

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
  for (const entry of TOOL_CATALOG) {
    const html = await getAppsSdkCompatibleHtml(baseURL, entry.uiPath);
    const contentWidget: ContentWidget = {
      id: entry.id,
      title: entry.title,
      templateUri: entry.templateUri,
      invoking: entry.invoking,
      invoked: entry.invoked,
      html,
      description: entry.widgetDescription,
      widgetDomain: entry.widgetDomain,
    };

    server.registerResource(
      `${entry.id}-widget`,
      contentWidget.templateUri,
      {
        title: entry.resourceTitle,
        description: entry.resourceDescription,
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
      })
    );

    server.registerTool(
      contentWidget.id,
      {
        title: contentWidget.title,
        description: entry.description,
        inputSchema: getInputSchema(entry),
        _meta: widgetMeta(contentWidget),
      },
      async (params) => {
        const displayText = Object.keys(params).length
          ? `Received tool input: ${JSON.stringify(params)}`
          : contentWidget.invoked;

        return {
          content: [
            {
              type: "text",
              text: displayText,
            },
          ],
          structuredContent: {
            ...params,
            timestamp: new Date().toISOString(),
            toolId: contentWidget.id,
          },
          _meta: widgetMeta(contentWidget),
        };
      }
    );
  }
});

export const GET = handler;
export const POST = handler;
