export type ToolInputField = {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
};

export type ToolCatalogEntry = {
  id: string;
  title: string;
  description: string;
  purpose: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  resourceTitle: string;
  resourceDescription: string;
  widgetDescription: string;
  widgetDomain: string;
  uiPath: string;
  inputFields: ToolInputField[];
};

export const MCP_SERVER_PATH = "/mcp";

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  {
    id: "show_content",
    title: "Show Content",
    description:
      "Fetch and display the homepage content with the name of the user",
    purpose: "Displays the app homepage widget and includes tool call inputs in structured output.",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    resourceTitle: "Show Content",
    resourceDescription: "Displays the homepage content",
    widgetDescription: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
    uiPath: "/",
    inputFields: [
      {
        name: "name",
        type: "string",
        description: "The name of the user to display on the homepage",
        required: true,
      },
    ],
  },
];
