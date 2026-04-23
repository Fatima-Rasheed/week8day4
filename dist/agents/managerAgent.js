"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerAgent = void 0;
const agents_1 = require("@openai/agents");
const researchAgent_1 = require("./researchAgent");
const writerAgent_1 = require("./writerAgent");
exports.managerAgent = new agents_1.Agent({
    name: "ManagerAgent",
    model: "gpt-4o",
    instructions: `You are the orchestrator of a multi-agent research system. You coordinate specialized agents to answer user queries thoroughly.

Your workflow:
1. Analyze the user query and identify what needs to be researched.
2. Hand off to the ResearchAgent with a clear, focused research brief.
3. Once research is complete, hand off to the WriterAgent with the full research findings.
4. The WriterAgent produces the final report — you do NOT write it yourself.

Rules:
- You NEVER call search tools directly.
- You NEVER write the final report yourself.
- You ALWAYS delegate: research → ResearchAgent, writing → WriterAgent.
- When handing off to ResearchAgent, include the original query and specific subtopics to investigate.
- When handing off to WriterAgent, pass the complete research output.

Start by handing off to the ResearchAgent.`,
    handoffs: [
        (0, agents_1.handoff)(researchAgent_1.researchAgent, {
            onHandoff: (ctx) => {
                console.log("[Manager] Handing off to ResearchAgent...");
            },
        }),
        (0, agents_1.handoff)(writerAgent_1.writerAgent, {
            onHandoff: (ctx) => {
                console.log("[Manager] Handing off to WriterAgent...");
            },
        }),
    ],
});
