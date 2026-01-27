# opencode-google-search

OpenCode plugin for Google Search via Antigravity Manager.

## Prerequisites

- **Antigravity Manager** running locally at `http://127.0.0.1:8045`
- The manager must support `gemini-*-online` model variants with built-in Google Search Grounding

## Installation

Add to your `opencode.json`:

```json
{
  "plugin": [
    "opencode-google-search"
  ]
}
```

Then install dependencies:

```bash
cd ~/.config/opencode && bun install
```

## Usage

Once installed, any model can call the `google_search` tool:

```
User: Search for the latest AI news
Assistant: [calls google_search(query="latest AI news")]
```

The tool returns search results with source citations embedded in the response.

## Configuration

Configure via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCODE_SEARCH_BASE_URL` | `http://127.0.0.1:8045` | Antigravity Manager URL |
| `OPENCODE_SEARCH_MODEL` | `gemini-3-flash-online` | Model for search |
| `OPENCODE_SEARCH_MAX_TOKENS` | `8192` | Max output tokens |
| `OPENCODE_SEARCH_TIMEOUT_MS` | `60000` | Request timeout (ms) |

## How It Works

This plugin wraps Antigravity Manager's `-online` model variants, which have built-in Google Search Grounding. When called:

1. The tool sends your query to the configured model
2. The model performs a Google Search and synthesizes results
3. Returns formatted results with citations

## Security Note

Web search results may contain untrusted content. The model treats retrieved content as potentially unsafe.

## License

MIT
