"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const agents_1 = require("@openai/agents");
const managerAgent_1 = require("./agents/managerAgent");
const tavilySearch_1 = require("./tools/tavilySearch");
const DEFAULT_QUERY = "Compare Stripe vs Razorpay for a SaaS business operating in Pakistan";
async function main() {
    const query = process.argv[2] ?? DEFAULT_QUERY;
    console.log("\n========================================");
    console.log("  Research Assistant — Multi-Agent System");
    console.log("========================================");
    console.log(`\nQuery: ${query}\n`);
    // Reset Tavily search counter for this run
    (0, tavilySearch_1.resetSearchCount)();
    try {
        const result = await (0, agents_1.run)(managerAgent_1.managerAgent, query, {
            maxTurns: 20, // Enough turns for research + writing handoffs
        });
        console.log("\n========================================");
        console.log("  FINAL REPORT");
        console.log("========================================\n");
        console.log(result.finalOutput);
    }
    catch (err) {
        console.error("Error running research assistant:", err);
        process.exit(1);
    }
}
main();
