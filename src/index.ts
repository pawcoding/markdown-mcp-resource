import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { argv } from "node:process";
import z from "zod";
import packageJson from "../package.json";
import { readIndexFile } from "./read-index.file";
import { readMarkdownFileAsResourceContent } from "./read-markdown-file";

/**
 * Extract the base path from the command line arguments.
 */
const basePath = argv[2];
if (!basePath?.startsWith("http") || !basePath?.endsWith(".json")) {
  console.error(
    "Invalid index path. Please provide a valid URL to your json index file."
  );
  console.error("Usage: npx markdown-mcp-resource <basePath>");
  process.exit(1);
}
const hostname = new URL(basePath).hostname;
console.error(`Starting MCP server for ${hostname}`);

const index = await readIndexFile(new URL(basePath));

const server = new McpServer({
  name: packageJson.name,
  version: packageJson.version
});

server.registerResource(
  "markdown",
  new ResourceTemplate(`markdown://${hostname}/{file}`, {
    list: async () => ({
      resources: index.files.map((file) => ({
        name: file.name,
        uri: `markdown://${hostname}/${file.name}`
      }))
    }),
    complete: {
      file: async (value, _) => {
        const searchTerm = value.trim().toLowerCase();
        return index.files
          .map((file) => file.name)
          .filter((line) => line.toLowerCase().includes(searchTerm));
      }
    }
  }),
  {
    title: index.title ?? `Get markdown content of ${hostname}`,
    description:
      index.description ??
      `Fetches markdown files from ${hostname} and makes them available as resources.`,
    mimeType: "text/markdown"
  },
  async (uri, { file }) => {
    const fileEntry = index.files.find((f) => f.name === file);
    if (!fileEntry) {
      console.error(`File not found: ${file}`);
      return {
        contents: [
          {
            uri: uri.href,
            text: `File ${file} not found`
          }
        ]
      };
    }

    const fileUrl = new URL(fileEntry.route, basePath);
    const content = await readMarkdownFileAsResourceContent(uri, fileUrl);
    return {
      contents: content
    };
  }
);

server.registerTool(
  "get_markdown_content",
  {
    title: index.title ?? `Get markdown content of ${hostname}`,
    description:
      (index.description ??
        `Fetches the markdown content from ${hostname} and makes it available via this tool.`) +
      " Use the `file` parameter to specify the markdown file to fetch. If not specified, the index file will be fetched. Please use the markdown resources instead if possible.",
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
    if (!file) {
      return {
        content: [
          {
            type: "text",
            text:
              index.files.map((file) => file.name).join("\n") ??
              "No files found"
          }
        ]
      };
    }

    const fileEntry = index.files.find((f) => f.name === file);
    if (!fileEntry) {
      console.error(`File not found: ${file}`);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `File ${file} not found`
          }
        ]
      };
    }

    const fileUrl = new URL(fileEntry.route, basePath);
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
