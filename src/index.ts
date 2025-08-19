import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { argv } from "node:process";
import z from "zod";
import packageJson from "../package.json";
import {
  readMarkdownFile,
  readMarkdownFileAsResourceContent
} from "./read-markdown-file";

/**
 * Extract the base path from the command line arguments.
 */
const basePath = argv[2];
if (!basePath?.startsWith("http")) {
  console.error("Invalid base path. Please provide a valid URL.");
  console.error("Usage: npx markdown-mcp-resource <basePath>");
  process.exit(1);
}
const hostname = new URL(basePath).hostname;
console.error(`Starting MCP server for ${hostname}`);

const server = new McpServer({
  name: packageJson.name,
  version: packageJson.version
});

server.registerResource(
  "markdown",
  new ResourceTemplate(`markdown://${hostname}/{file}`, {
    list: async () => {
      const indexFileUrl = new URL("index.md", basePath);
      const indexFileContent = await readMarkdownFile(indexFileUrl);
      if (!indexFileContent) {
        return { resources: [] };
      }

      const resources = indexFileContent
        .split("\n")
        .filter(Boolean)
        .map((line) => ({
          name: line,
          uri: `markdown://${hostname}/${line}`
        }));
      return {
        resources
      };
    },
    complete: {
      file: async (value, _) => {
        const searchTerm = value.trim().toLowerCase();

        const indexFileUrl = new URL("index.md", basePath);
        const indexFileContent = await readMarkdownFile(indexFileUrl);
        if (!indexFileContent) {
          return [];
        }

        const matchingLines = indexFileContent
          .split("\n")
          .filter(Boolean)
          .filter((line) => line.toLowerCase().includes(searchTerm));

        return matchingLines;
      }
    }
  }),
  {
    title: `Markdown files of ${hostname}`,
    description: `Fetches markdown files from ${hostname} and makes them available as resources.`,
    mimeType: "text/markdown"
  },
  async (uri, { file }) => {
    const fileUrl = new URL(`${file}.md`, basePath);
    const content = await readMarkdownFileAsResourceContent(uri, fileUrl);
    return {
      contents: content
    };
  }
);

server.registerTool(
  "get_markdown_content",
  {
    title: `Get markdown content of ${hostname}`,
    description: `Fetches the markdown content from ${hostname} and makes it available via this tool. Use the \`file\` parameter to specify the markdown file to fetch. If not specified, the index file will be fetched. Please use the markdown resources instead if possible.`,
    annotations: {
      readOnlyHint: true
    },
    inputSchema: {
      file: z.optional(
        z
          .string()
          .describe(
            "The markdown file to fetch. If empty, fetches the index file."
          )
      )
    }
  },
  async ({ file }) => {
    const fileUrl = new URL(`${file || "index"}.md`, basePath);
    const content = await readMarkdownFileAsResourceContent(fileUrl, fileUrl);
    if (!content || content.length === 0) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to fetch markdown file: ${fileUrl.href}`
          }
        ]
      };
    }

    return {
      content: content.map((item) => ({
        type: "text",
        text: item.text as string
      }))
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
