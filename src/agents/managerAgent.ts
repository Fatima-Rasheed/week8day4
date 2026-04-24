import { Agent, handoff } from "@openai/agents";
import { z } from "zod";
import { researchAgent } from "./researchAgent";
import { writerAgent } from "./writerAgent";

export const managerAgent = new Agent({
  name: "ManagerAgent",
  model: "llama-3.3-70b-versatile",
  instructions: `You are an orchestrator. You MUST always perform exactly two handoffs in order.

HANDOFF 1: Call transfer_to_ResearchAgent with the user query.

HANDOFF 2: After you receive research findings back, you MUST call transfer_to_WriterAgent immediately.
- Pass the ENTIRE research findings JSON as the message — do not modify it.
- Do NOT print or return the research findings yourself.
- Do NOT stop after the first handoff.
- Do NOT respond to the user at any point.

You are NOT allowed to output text to the user. Your only job is two handoffs.
If you have research findings in hand and have not yet called transfer_to_WriterAgent — CALL IT NOW.`,

  handoffs: [
    handoff(researchAgent, {
      inputType: z.object({
        message: z.string().describe("The user research query"),
      }),
      onHandoff: (_ctx, input) => {
        console.log(`\n[Manager → ResearchAgent] Query: "${input?.message}"`);
      },
    }),
    handoff(writerAgent, {
      inputType: z.object({
        message: z.string().describe("The complete research findings JSON"),
      }),
      onHandoff: (_ctx, input) => {
        console.log(`\n[Manager → WriterAgent] Passing ${input?.message?.length ?? 0} chars`);
      },
    }),
  ],
});