# Research Assistant — Multi-Agent AI System

A multi-agent research assistant built with the [OpenAI Agents SDK](https://github.com/openai/openai-agents-js). It accepts a user query, delegates subtasks to specialized agents, performs real-time web research via Tavily, and produces a structured final report.

---

## Architecture

```
User Query
    ↓
Manager Agent (Orchestrator)
    ↓
Research Agent ──→ Tavily Search (web)
    ↓
Writer Agent
    ↓
Final Structured Report
```

### Agents

| Agent | Role | Tools |
|---|---|---|
| Manager Agent | Orchestrates the flow, delegates tasks, never calls tools directly | Handoffs only |
| Research Agent | Performs factual web research, returns structured findings + sources | Tavily Search |
| Writer Agent | Normalizes research data, reasons over it, writes the final report | None |

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd research-assistant
npm install
```

### 2. Configure API keys

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

- Get your OpenAI key at: https://platform.openai.com/api-keys
- Get your Tavily key at: https://app.tavily.com

### 3. Run

```bash
# Using ts-node (development)
npm run dev

# Or with a custom query
npx ts-node src/index.ts "Compare AWS vs GCP for a startup in Southeast Asia"
```

```bash
# Build and run compiled JS
npm run build
npm start
```

---

## Example Queries

```bash
npx ts-node src/index.ts "Compare Stripe vs Razorpay for a SaaS in Pakistan"
npx ts-node src/index.ts "What are the best vector databases for production RAG systems in 2024?"
npx ts-node src/index.ts "Compare Vercel vs Cloudflare Pages for deploying Next.js apps"
npx ts-node src/index.ts "Analyze the pros and cons of React vs Vue for enterprise applications"
```

---

## Example Output

```markdown
## Overview
Stripe and Razorpay are both leading payment gateways, but they serve different markets...

## Key Differences
| Feature | Stripe | Razorpay |
|---|---|---|
| Pakistan Support | ❌ Not available | ✅ Available |
| Pricing | 2.9% + $0.30 | 2% per transaction |
...

## Pros & Cons
**Stripe**
- ✅ Global reach, excellent developer experience
- ❌ Not available for Pakistani businesses

**Razorpay**
- ✅ Strong South Asia support
- ❌ Limited global payout options
...

## Recommendation
For a SaaS operating in Pakistan, Razorpay is the practical choice...

## Sources
- https://stripe.com/global
- https://razorpay.com/pricing/
...
```

---

## Tavily Search Limits

The Research Agent is capped at **5 searches per run** to control API costs. This is enforced in `src/tools/tavilySearch.ts`.

---

## Project Structure

```
src/
├── agents/
│   ├── managerAgent.ts   # Orchestrator — delegates via handoffs
│   ├── researchAgent.ts  # Factual research using Tavily
│   └── writerAgent.ts    # Report generation (no tools)
├── tools/
│   └── tavilySearch.ts   # Tavily API integration with search limit
├── types.ts              # Shared TypeScript types
└── index.ts              # Entry point
```
