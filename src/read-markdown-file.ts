import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * In-memory cache for markdown file contents, keyed by file URL.
 */
const cache = new Map<string, string>();

/**
 * Fetches the contents of a remote markdown file by URL, with caching to avoid redundant network requests.
 * Returns the file content as a string, or undefined if the fetch fails.
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
 * Fetches a markdown file and returns it in MCP resource content format.
 * Returns an array with the file's URI and text, or an empty array if not found.
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
