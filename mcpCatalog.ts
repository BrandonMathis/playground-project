export type McpToolInputField = {
  name: string;
  type: "string";
  description: string;
  required?: boolean;
};

export type McpToolCatalogEntry = {
  id: string;
  title: string;
  description: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  widgetDescription: string;
  widgetDomain: string;
  pagePath: string;
  inputFields: McpToolInputField[];
};

export const mcpToolCatalog: McpToolCatalogEntry[] = [
  {
    id: "show_content",
    title: "Show Content",
    description:
      "Fetch and display the homepage content with the name of the user",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    widgetDescription: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
    pagePath: "/",
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
