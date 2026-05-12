import "dotenv/config";
import * as readline from "readline";
import OpenAI from "openai";
import { run, setDefaultOpenAIClient, setTracingDisabled } from "@openai/agents";
import { resetSearchCount } from "./tools/tavilySearch";
import { managerAgent } from "./agents/managerAgent";

// "as any" bypasses the type mismatch between openai v5 instances.
// Both packages use openai v5 — this works fine at runtime.
setDefaultOpenAIClient(
  new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  }) as any
);

setTracingDisabled(true);

function askQuestion(promptText: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  return new Promise((resolve) => {
    process.stdout.write(promptText);
    rl.question("", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   Research Assistant  (Multi-Agent)    ║");
  console.log("╚════════════════════════════════════════╝\n");

  let query = process.argv[2];
  if (!query) {
    query = await askQuestion("🔎 Enter your research question: ");
  }
  if (!query) {
    console.error("\n❌  No query provided. Exiting.\n");
    process.exit(1);
  }

  console.log(`\n📋 Query: "${query}"`);
  console.log("\n─────────────────────────────────────────");
  console.log("Pipeline: Manager → Research → Writer");
  console.log("─────────────────────────────────────────\n");

  resetSearchCount();

  try {
    // Single entry point — ManagerAgent orchestrates everything via handoffs
    // Flow: ManagerAgent → handoff → ResearchAgent → handoff → WriterAgent
    console.log("🤖 [Manager] Starting orchestration...\n");

    const result = await run(managerAgent, query, {
      maxTurns: 20,
      stream: false,
    });

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║              FINAL REPORT              ║");
    console.log("╚════════════════════════════════════════╝\n");
    console.log(result.finalOutput ?? "⚠️  No output was produced.");

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("\n❌ Error:", err.message);
    } else {
      console.error("\n❌ Unknown error:", err);
    }
    process.exit(1);
  }
}

main();