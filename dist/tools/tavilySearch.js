"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tavilySearchTool = void 0;
exports.resetSearchCount = resetSearchCount;
const agents_1 = require("@openai/agents");
const zod_1 = require("zod");
// Tracks search count per run to enforce the 3-5 search limit
let searchCount = 0;
const MAX_SEARCHES = 5;
function resetSearchCount() {
    searchCount = 0;
}
exports.tavilySearchTool = (0, agents_1.tool)({
    name: "tavily_search",
    description: "Search the web for factual, up-to-date information on a topic. Returns key findings and source URLs. Use focused queries for best results.",
    parameters: zod_1.z.object({
        query: zod_1.z.string().describe("The search query to look up"),
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
        if (!apiKey)
            throw new Error("TAVILY_API_KEY is not set in environment");
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                search_depth: "advanced",
                max_results: 5,
                include_answer: true,
            }),
        });
        if (!response.ok) {
            throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Extract only what the research agent needs — no raw dump to user
        const findings = [];
        const sources = [];
        if (data.answer) {
            findings.push(data.answer);
        }
        for (const result of data.results ?? []) {
            if (result.content)
                findings.push(result.content);
            if (result.url)
                sources.push(result.url);
        }
        return JSON.stringify({ query, findings, sources });
    },
});
