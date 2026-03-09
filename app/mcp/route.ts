import { baseURL } from "@/baseUrl";
import { getToolSummaries, mcpServerOverview, mcpToolCatalog } from "@/app/mcp/catalog";
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
  widgetDescription: string;
  toolDescription: string;
  inputDescription: string;
  widgetDomain: string;
};

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
  const widgets: ContentWidget[] = await Promise.all(
    mcpToolCatalog.map(async (tool) => ({
      id: tool.id,
      title: tool.title,
      templateUri: tool.templateUri,
      invoking: tool.invoking,
      invoked: tool.invoked,
      html: await getAppsSdkCompatibleHtml(baseURL, tool.pagePath),
      widgetDescription: tool.widgetDescription,
      toolDescription: tool.toolDescription,
      inputDescription: tool.inputDescription,
      widgetDomain: tool.widgetDomain,
    }))
  );

  widgets.forEach((contentWidget) => {
    server.registerResource(
      `${contentWidget.id}-widget`,
      contentWidget.templateUri,
      {
        title: contentWidget.title,
        description: contentWidget.widgetDescription,
        mimeType: "text/html+skybridge",
        _meta: {
          "openai/widgetDescription": contentWidget.widgetDescription,
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
              "openai/widgetDescription": contentWidget.widgetDescription,
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
        description: contentWidget.toolDescription,
        inputSchema: {
          name: z.string().describe(contentWidget.inputDescription),
        },
        _meta: widgetMeta(contentWidget),
      },
      async ({ name }) => {
        return {
          content: [
            {
              type: "text",
              text: name,
            },
          ],
          structuredContent: {
            name,
            timestamp: new Date().toISOString(),
            server: mcpServerOverview,
            tools: getToolSummaries(),
          },
          _meta: widgetMeta(contentWidget),
        };
      }
    );
  });
});

export const GET = handler;
export const POST = handler;
