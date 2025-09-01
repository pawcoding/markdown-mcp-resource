import { z } from "zod/v4";

export const indexSchema = z.object({
  title: z.optional(z.string()).meta({
    title: "Title of the mcp resource template",
    description: "Used to identify the mcp resource template"
  }),
  description: z.optional(z.string()).meta({
    title: "Description of the mcp resource template",
    description:
      "Used to describe the mcp resource template. Should include a description for when the agent should use this resource."
  }),
  files: z
    .array(
      z.object({
        name: z.string().meta({
          title: "Name of the markdown file",
          description:
            "Name of the markdown file used to access the resource. Will be used to request the resource by name."
        }),
        route: z.url().meta({
          title: "Route to access the markdown file",
          description:
            "Full URL to access the markdown file. This should be a publicly accessible URL."
        })
      })
    )
    .meta({
      title: "Files to be accessed",
      description: "List of files to be made accessible by the mcp server."
    })
});

export type Index = z.infer<typeof indexSchema>;

/**
 * Fetches and validates the index JSON file describing available markdown files.
 * Exits the process if the file cannot be fetched or parsed.
 */
export async function readIndexFile(url: URL): Promise<Index> {
  const file = await fetch(url);
  if (!file.ok) {
    console.error(
      `Failed to fetch index file from ${url.toString()}: HTTP ${file.status} ${file.statusText}`
    );
    process.exit(1);
  }

  let body;
  try {
    body = await file.json();
  } catch (error) {
    console.error("Failed to parse index file:", error);
    process.exit(1);
  }

  return indexSchema.parse(body);
}
