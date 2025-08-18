import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Cache for markdown file contents
 */
const cache = new Map<string, string>();

/**
 * Fetches the contents of a markdown file.
 */
export async function readMarkdownFile(url: URL): Promise<string | undefined> {
  // Check if the file is cached
  if (cache.has(url.href)) {
    return cache.get(url.href);
  }

  // Fetch the file contents
  const file = await fetch(url);
  if (!file.ok) {
    cache.set(url.href, "");
    console.error(
      `Failed to fetch file from ${url}: ${file.status} ${file.statusText}`
    );
    return undefined;
  }

  // Read the file contents as text and cache it
  const text = await file.text();
  cache.set(url.href, text);
  return text;
}

/**
 * Fetches a markdown file as resource content.
 */
export async function readMarkdownFileAsResourceContent(
  resourceUri: URL,
  markdownUrl: URL
): Promise<ReadResourceResult["contents"]> {
  const content = await readMarkdownFile(markdownUrl);
  if (!content) {
    return [];
  }

  return [
    {
      uri: resourceUri.href,
      text: content
    }
  ];
}
