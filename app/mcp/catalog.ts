export type McpToolCatalogItem = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  pagePath: string;
  toolDescription: string;
  widgetDescription: string;
  widgetDomain: string;
  inputDescription: string;
};

export const mcpServerOverview = {
  endpoint: "/mcp",
  transport: "HTTP (GET and POST)",
  autoUpdateSource: "app/mcp/catalog.ts",
} as const;

export const mcpToolCatalog: McpToolCatalogItem[] = [
  {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    pagePath: "/",
    toolDescription:
      "Fetch and display the homepage content with the name of the user",
    widgetDescription: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
    inputDescription: "The name of the user to display on the homepage",
  },
];

export function getToolSummaries() {
  return mcpToolCatalog.map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.toolDescription,
    widgetDescription: tool.widgetDescription,
    templateUri: tool.templateUri,
    invoking: tool.invoking,
    invoked: tool.invoked,
    inputDescription: tool.inputDescription,
    pagePath: tool.pagePath,
  }));
}
