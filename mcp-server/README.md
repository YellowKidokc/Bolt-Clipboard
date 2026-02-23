# Prophecy MCP Server

MCP (Model Context Protocol) server for the prophecy monitoring system. This server allows Claude Desktop and command-line MCP clients to interact with your prophecy database.

## Features

The MCP server provides tools to:

- Manage RSS feeds (list, add, update, delete)
- Configure scoring keywords and weights
- Manage prophecies being monitored
- Update priority targets
- View articles and system statistics

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Configuration

### For Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "prophecy": {
      "command": "node",
      "args": ["/absolute/path/to/project/mcp-server/build/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/project` with the actual path to your project directory.

### For MCP CLI

You can also use the MCP Inspector for testing:

```bash
npx @modelcontextprotocol/inspector node /path/to/project/mcp-server/build/index.js
```

## Available Tools

### Feed Management

- **list_feeds**: List all RSS feeds
  - Optional: `active_only` (boolean) - Show only active feeds

- **add_feed**: Add a new RSS feed
  - `name` (required) - Display name
  - `url` (required) - RSS feed URL
  - `category` (optional) - Category

- **update_feed**: Update an existing feed
  - `id` (required) - Feed ID
  - `name`, `url`, `category`, `active` (optional)

- **delete_feed**: Delete a feed
  - `id` (required) - Feed ID

### Scoring Configuration

- **list_scoring_keywords**: List all scoring keywords
  - Optional: `category` - Filter by LOW, MEDIUM, HIGH, CRITICAL

- **add_scoring_keyword**: Add a new keyword
  - `keyword` (required) - The keyword
  - `weight` (required) - Numeric weight/score
  - `category` (required) - LOW, MEDIUM, HIGH, or CRITICAL

- **update_scoring_keyword**: Update a keyword
  - `id` (required) - Keyword ID
  - `keyword`, `weight`, `category` (optional)

- **delete_scoring_keyword**: Delete a keyword
  - `id` (required) - Keyword ID

### Prophecy Management

- **list_prophecies**: List all prophecies
  - Optional: `status` - WATCHING, IMMINENT, FULFILLED
  - Optional: `category` - Filter by category

- **add_prophecy**: Add a new prophecy
  - `title` (required) - Prophecy title
  - `keywords` (required) - Array of keywords
  - `description`, `reference`, `category` (optional)

- **update_prophecy**: Update a prophecy
  - `id` (required) - Prophecy ID
  - `title`, `description`, `reference`, `category`, `status`, `keywords` (optional)

### Priority Targets

- **list_priority_targets**: List all targets
  - Optional: `active_only` (boolean)

- **update_priority_target**: Update a target
  - `id` (required) - Target ID
  - `name`, `title`, `description`, `rank`, `score`, `is_active` (optional)

### Articles & Stats

- **list_articles**: List recent articles
  - Optional: `limit` (default 50)
  - Optional: `min_score` - Minimum score filter
  - Optional: `category` - Score category filter

- **get_system_stats**: Get overall system statistics

## Usage Examples

Once configured in Claude Desktop, you can use natural language to interact with the system:

- "Show me all the RSS feeds"
- "Add a new feed called 'Tech News' with URL https://example.com/feed"
- "List all scoring keywords in the CRITICAL category"
- "Add a new prophecy about 'Temple Reconstruction' with keywords temple, jerusalem, altar"
- "Update the prophecy with ID abc-123 to IMMINENT status"
- "What are the current system statistics?"

## Development

Watch mode for development:

```bash
npm run watch
```

Build:

```bash
npm run build
```

## Requirements

- Node.js 18+
- Access to the Supabase database (credentials in project .env file)
