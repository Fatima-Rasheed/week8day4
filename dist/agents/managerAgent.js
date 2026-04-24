"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerAgent = void 0;
const agents_1 = require("@openai/agents");
const zod_1 = require("zod");
const researchAgent_1 = require("./researchAgent");
const writerAgent_1 = require("./writerAgent");
exports.managerAgent = new agents_1.Agent({
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
        (0, agents_1.handoff)(researchAgent_1.researchAgent, {
            inputType: zod_1.z.object({
                message: zod_1.z.string().describe("The research brief to pass to the research agent"),
            }),
            onHandoff: (_ctx, input) => {
                console.log(`[Handoff] Manager → ResearchAgent: ${input?.message}`);
            },
        }),
        (0, agents_1.handoff)(writerAgent_1.writerAgent, {
            inputType: zod_1.z.object({
                message: zod_1.z.string().describe("The complete research findings to pass to the writer agent"),
            }),
            onHandoff: (_ctx, _input) => {
                console.log(`[Handoff] Manager → WriterAgent`);
            },
        }),
    ],
});
