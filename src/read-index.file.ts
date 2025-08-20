import z from "zod";

const indexSchema = z.object({
  title: z.optional(z.string()).describe("Title of the mcp resource template"),
  description: z
    .optional(z.string())
    .describe("Description of the mcp resource template"),
  files: z.array(
    z.object({
      name: z
        .string()
        .describe("Name of the markdown file used to access the resource"),
      route: z.string().describe("Route to access the markdown file")
    })
  )
});

export type Index = z.infer<typeof indexSchema>;

/**
 * Fetches and validates the index JSON file describing available markdown files.
 * Exits the process if the file cannot be fetched or parsed.
 */
export async function readIndexFile(url: URL): Promise<Index> {
  const file = await fetch(url);
  if (!file.ok) {
    console.error("Failed to fetch index file");
    process.exit(1);
  }

  let body;
  try {
    body = await file.json();
  } catch (error) {
    console.error("Failed to parse index file");
    process.exit(1);
  }

  return indexSchema.parse(body);
}
