# markdown-mcp-resource

MCP server that makes remote markdown files available as MCP resources.

## Overview

This MCP (Model Context Protocol) server enables AI assistants to access and read markdown documentation from remote URLs. It fetches markdown files listed in a remote JSON index file and makes them available as resources that can be queried and retrieved by MCP-compatible clients.

## How It Works

The server:

1. Takes a base URL to a JSON index file as a command-line argument (e.g., `https://my-documentation.com/mcp/index.json`)
2. Expects the index file to contain a list of available markdown files and their routes
3. Exposes these files as MCP resources with the URI pattern `markdown://{hostname}/{filename}`
4. Caches fetched content in memory to improve performance
5. Provides both resource listing, path completion, and direct content retrieval capabilities

## Remote Asset Structure

Your documentation site must be structured as follows:

### Required: index.json File

**Schema Reference:**
The expected format for `index.json` is formally described in the [schema.json](https://github.com/pawcoding/markdown-mcp-resource/blob/master/schema.json) file in this repository.

The base URL must point to an `index.json` file that lists all available markdown files and their full HTTP(S) routes, for example:

```json
{
  "$schema": "https://raw.githubusercontent.com/pawcoding/markdown-mcp-resource/refs/heads/master/schema.json",
  "title": "My Documentation",
  "description": "Example documentation index",
  "files": [
    {
      "name": "getting-started",
      "route": "https://your-site.com/docs/getting-started.md"
    },
    {
      "name": "api-reference",
      "route": "https://your-site.com/docs/api-reference.md"
    },
    {
      "name": "tutorials/basic-setup",
      "route": "https://your-site.com/docs/tutorials/basic-setup.md"
    },
    {
      "name": "tutorials/advanced-config",
      "route": "https://your-site.com/docs/tutorials/advanced-config.md"
    },
    {
      "name": "troubleshooting",
      "route": "https://your-site.com/docs/troubleshooting.md"
    }
  ]
}
```

### Markdown Files

Each file listed in the index must be available at the full HTTP(S) URL specified in the `route` field:

```
https://your-site.com/docs/
├── index.json            # Lists all available files and their full HTTP(S) routes
├── getting-started.md    # Individual markdown files
├── api-reference.md
├── tutorials/
│   ├── basic-setup.md
│   └── advanced-config.md
└── troubleshooting.md
```

**Important Notes:**

- File names in the `name` field of the index should NOT include the `.md` extension; the `route` field must be a full HTTP(S) URL to the markdown file and include the `.md` extension
- Subdirectories are supported (e.g., `tutorials/basic-setup`)

## MCP Client Configuration

### OpenCode Configuration

Add this to your OpenCode configuration file (replace with the full URL to your index.json):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-documentation": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "markdown-mcp-resource@latest",
        "https://my-documentation.com/mcp/index.json"
      ],
      "enabled": true
    }
  }
}
```

### Claude Desktop Configuration

Add this to your Claude Desktop configuration (replace with the full URL to your index.json):

```json
{
  "mcpServers": {
    "markdown-docs": {
      "command": "npx",
      "args": [
        "-y",
        "markdown-mcp-resource@latest",
        "https://your-documentation-site.com/docs/index.json"
      ]
    }
  }
}
```

### Generic MCP Client

For other MCP clients, use the command (replace with the full URL to your index.json):

```bash
npx markdown-mcp-resource@latest https://your-documentation-site.com/docs/index.json
```

## Usage Examples

### 1. Setting Up Documentation

Create an `index.json` file on your web server:

```json
{
  "$schema": "https://raw.githubusercontent.com/pawcoding/markdown-mcp-resource/refs/heads/master/schema.json",
  "files": [
    {
      "name": "introduction",
      "route": "https://yoursite.com/docs/introduction.md"
    },
    {
      "name": "installation",
      "route": "https://yoursite.com/docs/installation.md"
    },
    {
      "name": "configuration",
      "route": "https://yoursite.com/docs/configuration.md"
    },
    {
      "name": "api/authentication",
      "route": "https://yoursite.com/docs/api/authentication.md"
    },
    {
      "name": "api/endpoints",
      "route": "https://yoursite.com/docs/api/endpoints.md"
    },
    { "name": "examples", "route": "https://yoursite.com/docs/examples.md" },
    {
      "name": "troubleshooting",
      "route": "https://yoursite.com/docs/troubleshooting.md"
    }
  ]
}
```

Ensure corresponding markdown files exist:

- `https://yoursite.com/docs/introduction.md`
- `https://yoursite.com/docs/installation.md`
- `https://yoursite.com/docs/api/authentication.md`
- etc.

### 2. Querying Available Resources

Once configured, your MCP client can:

- List all available markdown resources
- Retrieve specific markdown content
- Search through available documentation files

### 3. Example Interaction

```
User: "What documentation is available?"
Assistant: [Lists all files from index.json]

User: "Show me the installation guide"
Assistant: [Retrieves and displays installation.md content]
```

## Features

- **Resource Discovery**: Automatically lists available documentation from `index.json`
- **Content Caching**: Improves performance by caching fetched markdown files
- **Path Completion**: Supports auto-completion of file paths
- **Error Handling**: Graceful handling of missing files or network issues
- **Subdirectory Support**: Organize documentation in nested folders

## Troubleshooting

### Common Issues

**Error: "Invalid base path"**

- Ensure the base URL starts with `http://` or `https://` and points to your `index.json`
- Example: `https://docs.example.com/index.json` not `docs.example.com`

**No resources found**

- Verify `index.json` exists at the base URL
- Check that `index.json` contains a `files` array with file names and routes
- Ensure file names in the `name` field don't include `.md` extension

**Failed to fetch file**

- Verify the markdown files exist at the expected URLs
- Check for CORS issues if accessing from browser environments
- Ensure proper HTTP headers are set on your web server

**Performance Issues**

- Consider enabling HTTP caching headers on your web server
- The MCP server caches content in memory during the session

### Testing Your Setup

1. Verify your `index.json` is accessible:

   ```bash
   curl https://your-site.com/docs/index.json
   ```

2. Test individual markdown files:

   ```bash
   curl https://your-site.com/docs/getting-started.md
   ```

3. Run the MCP server directly:

   ```bash
   npx markdown-mcp-resource@latest https://your-site.com/docs/index.json
   ```

4. Use the MCP Inspector for interactive testing:

   Visit [https://modelcontextprotocol.io/legacy/tools/inspector](https://modelcontextprotocol.io/legacy/tools/inspector) to test your MCP server interactively in a web interface.

## Development

### Local Development

```bash
git clone https://github.com/pawcoding/markdown-mcp-resource.git
cd markdown-mcp-resource
npm install
npm run build
npm start https://your-test-site.com/docs/
```

Visit [https://modelcontextprotocol.io/legacy/tools/inspector](https://modelcontextprotocol.io/legacy/tools/inspector) to test your MCP server interactively in a web interface.

### Building

```bash
npm run build
```

### Formatting

```bash
npm run format
```

## License

MIT - see [LICENSE](LICENSE) file for details.
