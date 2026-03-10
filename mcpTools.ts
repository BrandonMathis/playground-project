export type ToolInputFieldType = 'string' | 'number' | 'boolean';

export type ToolInputField = {
  name: string;
  type: ToolInputFieldType;
  description: string;
  required?: boolean;
};

export type McpToolDefinition = {
  id: string;
  title: string;
  description: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  widgetDescription: string;
  widgetDomain: string;
  resourcePath: string;
  inputSchemaFields: ToolInputField[];
};

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    id: 'show_content',
    title: 'Show Content',
    description:
      'Fetch and display the homepage content with the name of the user.',
    templateUri: 'ui://widget/content-template.html',
    invoking: 'Loading content...',
    invoked: 'Content loaded',
    widgetDescription: 'Displays the homepage content.',
    widgetDomain: 'https://nextjs.org/docs',
    resourcePath: '/',
    inputSchemaFields: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the user to display on the homepage.',
        required: true,
      },
    ],
  },
];
