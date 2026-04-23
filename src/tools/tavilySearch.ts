import { tool } from "@openai/agents";
import { z } from "zod";

let searchCount = 0;
const MAX_SEARCHES = 3;

export function resetSearchCount() {
  searchCount = 0;
}

export const tavilySearchTool = tool({
  name: "tavily_search",
  description:
    "Search the web for factual, up-to-date information on a topic. Returns key findings and source URLs. Use focused queries for best results.",
  parameters: z.object({
    query: z.string().describe("The search query to look up"),
  }),
  execute: async ({ query }) => {
    if (searchCount >= MAX_SEARCHES) {
      return JSON.stringify({
        error: `Search limit reached (max ${MAX_SEARCHES} searches per run).`,
        findings: [],
        sources: [],
      });
    }

    searchCount++;
    console.log(`[Tavily] Search ${searchCount}/${MAX_SEARCHES}: "${query}"`);

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error("TAVILY_API_KEY is not set in environment");

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      answer?: string;
      results?: Array<{ content?: string; url?: string }>;
    };

    const findings: string[] = [];
    const sources: string[] = [];

    if (data.answer) findings.push(data.answer);

    for (const result of data.results ?? []) {
      if (result.content) findings.push(result.content.slice(0, 400)); // truncate to ~400 chars
      if (result.url) sources.push(result.url);
    }

    return JSON.stringify({ query, findings, sources });
  },
});