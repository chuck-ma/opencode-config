import { tool } from "@opencode-ai/plugin";
import type { PluginInput } from "@opencode-ai/plugin";

const DEFAULT_BASE_URL = "http://127.0.0.1:8045";
const DEFAULT_MODEL = "gemini-3-flash-online";
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TIMEOUT_MS = 60000;

interface SearchResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
}

function parseIntEnv(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function buildUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, "");
  return `${trimmedBase}${path}`;
}

/**
 * GoogleSearchPlugin - OpenCode plugin for Google Search via Antigravity Manager
 *
 * Configuration via environment variables:
 * - OPENCODE_SEARCH_BASE_URL: Antigravity Manager base URL (default: http://127.0.0.1:8045)
 * - OPENCODE_SEARCH_MODEL: Model to use for search (default: gemini-3-flash-online)
 * - OPENCODE_SEARCH_MAX_TOKENS: Maximum output tokens (default: 8192)
 * - OPENCODE_SEARCH_TIMEOUT_MS: Request timeout in milliseconds (default: 60000)
 */
export const GoogleSearchPlugin = async (_input: PluginInput) => {
  const baseUrl = process.env.OPENCODE_SEARCH_BASE_URL ?? DEFAULT_BASE_URL;
  const model = process.env.OPENCODE_SEARCH_MODEL ?? DEFAULT_MODEL;
  const maxTokens = parseIntEnv(process.env.OPENCODE_SEARCH_MAX_TOKENS, DEFAULT_MAX_TOKENS);
  const timeoutMs = parseIntEnv(process.env.OPENCODE_SEARCH_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  return {
    tool: {
      google_search: tool({
        description: `Search the web using Google Search. Returns real-time information from the internet with source citations.

Use this tool when you need:
- Up-to-date information about current events
- Recent developments or news
- Any topic that may have changed since your training data
- Verification of facts with sources

The search results will include source citations for reference.`,
        args: {
          query: tool.schema
            .string()
            .describe("The search query or question to answer using web search"),
        },
        async execute(args, ctx) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);

          if (ctx.abort) {
            ctx.abort.addEventListener("abort", () => controller.abort());
          }

          try {
            const requestBody = {
              model,
              max_tokens: maxTokens,
              messages: [{ role: "user", content: args.query }],
            };

            const response = await fetch(buildUrl(baseUrl, "/v1/messages"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            });

            if (!response.ok) {
              const errorText = await response.text().catch(() => "Unknown error");
              return `## Search Error\n\nFailed to execute search: ${response.status} ${response.statusText}\n\n${errorText}\n\nPlease try again with a different query.`;
            }

            const data = (await response.json()) as SearchResponse;

            if (data.error?.message) {
              return `## Search Error\n\n${data.error.message}`;
            }

            const textContent = data.content
              ?.filter((c) => c.type === "text" && c.text)
              .map((c) => c.text)
              .join("\n");

            if (!textContent) {
              return "## Search Results\n\nNo results found for your query. Please try a different search.";
            }

            return textContent;
          } catch (error) {
            if (error instanceof Error) {
              if (error.name === "AbortError") {
                return `## Search Error\n\nRequest timed out after ${timeoutMs / 1000} seconds. Please try a simpler query.`;
              }
              return `## Search Error\n\n${error.message}`;
            }
            return `## Search Error\n\nAn unexpected error occurred: ${String(error)}`;
          } finally {
            clearTimeout(timeout);
          }
        },
      }),
    },
  };
};
