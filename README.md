# markdown-mcp-resource

MCP server that makes remote markdown files available as MCP resources.

## Overview

This MCP (Model Context Protocol) server enables AI assistants to access and read markdown documentation from remote URLs. It fetches markdown files from a specified base URL and makes them available as resources that can be queried and retrieved by MCP-compatible clients.

## How It Works

The server:

1. Takes a base URL as a command-line argument (e.g., `https://my-documentation.com/mcp/`)
2. Expects an `index.md` file at the base URL containing a list of available markdown files
3. Exposes these files as MCP resources with the URI pattern `markdown://{hostname}/{filename}`
4. Caches fetched content to improve performance
5. Provides both resource listing and direct content retrieval capabilities

## Installation

### Using npx (Recommended)

```bash
npx markdown-mcp-resource@latest https://your-documentation-site.com/path/
```

### Global Installation

```bash
npm install -g markdown-mcp-resource
markdown-mcp-resource https://your-documentation-site.com/path/
```

## Remote Asset Structure

Your documentation site must be structured as follows:

### Required: index.md File

The base URL must contain an `index.md` file that lists all available markdown files, one per line:

```markdown
getting-started
api-reference
tutorials/basic-setup
tutorials/advanced-config
troubleshooting
```

### Markdown Files

Each file listed in `index.md` should be available as `{filename}.md` at the base URL:

```
https://your-site.com/docs/
├── index.md              # Lists all available files
├── getting-started.md    # Individual markdown files
├── api-reference.md
├── tutorials/
│   ├── basic-setup.md
│   └── advanced-config.md
└── troubleshooting.md
```

**Important Notes:**

- File names in `index.md` should NOT include the `.md` extension
- The server automatically appends `.md` when fetching files
- Subdirectories are supported (e.g., `tutorials/basic-setup`)

## MCP Client Configuration

### OpenCode Configuration

Add this to your OpenCode configuration file:

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
        "https://my-documentation.com/mcp/"
      ],
      "enabled": true
    }
  }
}
```

### Claude Desktop Configuration

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "markdown-docs": {
      "command": "npx",
      "args": [
        "-y",
        "markdown-mcp-resource@latest",
        "https://your-documentation-site.com/docs/"
      ]
    }
  }
}
```

### Generic MCP Client

For other MCP clients, use the command:

```bash
npx markdown-mcp-resource@latest https://your-documentation-site.com/docs/
```

## Usage Examples

### 1. Setting Up Documentation

Create an `index.md` file on your web server:

```markdown
introduction
installation
configuration
api/authentication
api/endpoints
examples
troubleshooting
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
Assistant: [Lists all files from index.md]

User: "Show me the installation guide"
Assistant: [Retrieves and displays installation.md content]
```

## Features

- **Resource Discovery**: Automatically lists available documentation from `index.md`
- **Content Caching**: Improves performance by caching fetched markdown files
- **Path Completion**: Supports auto-completion of file paths
- **Error Handling**: Graceful handling of missing files or network issues
- **Subdirectory Support**: Organize documentation in nested folders

## Troubleshooting

### Common Issues

**Error: "Invalid base path"**

- Ensure the base URL starts with `http://` or `https://`
- Example: `https://docs.example.com/` not `docs.example.com`

**No resources found**

- Verify `index.md` exists at the base URL
- Check that `index.md` contains file names (one per line)
- Ensure file names don't include `.md` extension in `index.md`

**Failed to fetch file**

- Verify the markdown files exist at the expected URLs
- Check for CORS issues if accessing from browser environments
- Ensure proper HTTP headers are set on your web server

**Performance Issues**

- Consider enabling HTTP caching headers on your web server
- The MCP server caches content in memory during the session

### Testing Your Setup

1. Verify your `index.md` is accessible:

   ```bash
   curl https://your-site.com/docs/index.md
   ```

2. Test individual markdown files:

   ```bash
   curl https://your-site.com/docs/getting-started.md
   ```

3. Run the MCP server directly:
   ```bash
   npx markdown-mcp-resource@latest https://your-site.com/docs/
   ```

## Development

### Local Development

```bash
git clone https://github.com/pawcoding/markdown-mcp-resource.git
cd markdown-mcp-resource
npm install
npm run build
npm start https://your-test-site.com/docs/
```

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
