import "dotenv/config";
import { run, setDefaultOpenAIClient, setTracingDisabled } from "@openai/agents";
import OpenAI from "openai";
import { resetSearchCount } from "./tools/tavilySearch";
import { researchAgent } from "./agents/researchAgent";
import { writerAgent } from "./agents/writerAgent";

setDefaultOpenAIClient(
  new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  })
);

setTracingDisabled(true);

const DEFAULT_QUERY =
  "Compare Stripe vs Razorpay for a SaaS business operating in Pakistan";

async function main() {
  const query = process.argv[2] ?? DEFAULT_QUERY;

  console.log("\n========================================");
  console.log("  Research Assistant — Multi-Agent System");
  console.log("========================================");
  console.log(`\nQuery: ${query}\n`);

  resetSearchCount();

  try {
    console.log("[Pipeline] Step 1: Running ResearchAgent...");
    const researchResult = await run(researchAgent, query, { maxTurns: 10 });
    const researchOutput = researchResult.finalOutput as string;

    console.log("\n[Pipeline] Step 2: Running WriterAgent...");

    const writerResult = await run(
      writerAgent,
      `Here are the research findings for the query "${query}":\n\n${researchOutput}\n\nPlease write a complete, well-formatted report based on these findings.`,
      { maxTurns: 5 }
    );

    console.log("\n========================================");
    console.log("  FINAL REPORT");
    console.log("========================================\n");
    console.log(writerResult.finalOutput);
  } catch (err) {
    console.error("Error running research assistant:", err);
    process.exit(1);
  }
}

main();