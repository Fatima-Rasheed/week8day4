"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const agents_1 = require("@openai/agents");
const openai_1 = __importDefault(require("openai"));
const tavilySearch_1 = require("./tools/tavilySearch");
const researchAgent_1 = require("./agents/researchAgent");
const writerAgent_1 = require("./agents/writerAgent");
(0, agents_1.setDefaultOpenAIClient)(new openai_1.default({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
}));
(0, agents_1.setTracingDisabled)(true);
const DEFAULT_QUERY = "Compare Stripe vs Razorpay for a SaaS business operating in Pakistan";
async function main() {
    const query = process.argv[2] ?? DEFAULT_QUERY;
    console.log("\n========================================");
    console.log("  Research Assistant — Multi-Agent System");
    console.log("========================================");
    console.log(`\nQuery: ${query}\n`);
    (0, tavilySearch_1.resetSearchCount)();
    try {
        console.log("[Pipeline] Step 1: Running ResearchAgent...");
        const researchResult = await (0, agents_1.run)(researchAgent_1.researchAgent, query, { maxTurns: 10 });
        const researchOutput = researchResult.finalOutput;
        console.log("\n[Pipeline] Step 2: Running WriterAgent...");
        const writerResult = await (0, agents_1.run)(writerAgent_1.writerAgent, `Here are the research findings for the query "${query}":\n\n${researchOutput}\n\nPlease write a complete, well-formatted report based on these findings.`, { maxTurns: 5 });
        console.log("\n========================================");
        console.log("  FINAL REPORT");
        console.log("========================================\n");
        console.log(writerResult.finalOutput);
    }
    catch (err) {
        console.error("Error running research assistant:", err);
        process.exit(1);
    }
}
main();
