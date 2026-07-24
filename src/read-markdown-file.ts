/**
 * In-memory cache for markdown file contents, keyed by file URL.
 */
const cache = new Map<string, { content: string; expiresAt: number }>();

/**
 * Fetches the contents of a remote markdown file by URL, with caching to avoid redundant network requests.
 * Returns the file content as a string, or undefined if the fetch fails.
 */
export async function readMarkdownFile(url: URL): Promise<string | undefined> {
  const cacheKey = url.href;

  // Check if the file is cached
  const cacheEntry = cache.get(cacheKey);
  if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
    return cacheEntry.content;
  }

  // Fetch the file contents
  const file = await fetch(url, {
    signal: AbortSignal.timeout(10_000) // 10 seconds timeout
  });
  if (!file.ok) {
    cache.set(cacheKey, {
      content: "",
      expiresAt: Date.now() + 5 * 60 * 1000 // Cache the failure for 5 minutes
    });
    console.error(
      `Failed to fetch file from ${url}: ${file.status} ${file.statusText}`
    );
    return undefined;
  }

  // Read the file contents as text and cache it
  const text = await file.text();
  cache.set(cacheKey, {
    content: text,
    expiresAt: Date.now() + 60 * 60 * 1000 // Cache for 1 hour
  });
  return text;
}

/**
 * Fetches a markdown file and returns it in MCP resource content format.
 * Returns an array with the file's URI and text, or an empty array if not found.
 */
export async function readMarkdownFileAsResourceContent(
  resourceUri: URL,
  markdownUrl: URL
): Promise<Array<{ uri: string; text: string }>> {
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
