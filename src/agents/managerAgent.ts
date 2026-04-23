import { Agent, handoff } from "@openai/agents";
import { z } from "zod";
import { researchAgent } from "./researchAgent";
import { writerAgent } from "./writerAgent";

export const managerAgent = new Agent({
  name: "ManagerAgent",
  model: "llama-3.3-70b-versatile",
  instructions: `You are the orchestrator of a multi-agent research system.

Your workflow is STRICTLY two steps — you must complete BOTH:

STEP 1: Hand off to ResearchAgent with the user's query as the message.

STEP 2: After ResearchAgent returns its findings, you MUST immediately hand off to WriterAgent.
- Pass the COMPLETE research findings as the message to WriterAgent.
- Do NOT summarize or modify the findings.
- Do NOT write the report yourself.
- Do NOT respond to the user directly.

You are ONLY allowed to do two things:
1. Call transfer_to_ResearchAgent (first)
2. Call transfer_to_WriterAgent (second, with the full research output)

If you have received research findings and have NOT yet called transfer_to_WriterAgent, you MUST call it now.`,
  handoffs: [
    handoff(researchAgent, {
      inputType: z.object({
        message: z.string().describe("The research brief to pass to the research agent"),
      }),
      onHandoff: (agent, input) => {
        console.log(`[Handoff] Manager → ResearchAgent: ${input?.message}`);
      },
    }),
    handoff(writerAgent, {
      inputType: z.object({
        message: z.string().describe("The complete research findings to pass to the writer agent"),
      }),
      onHandoff: (agent, input) => {
        console.log(`[Handoff] Manager → WriterAgent`);
      },
    }),
  ],
});