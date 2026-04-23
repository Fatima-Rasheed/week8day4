export interface ResearchFinding {
  topic: string;
  findings: string[];
  sources: string[];
}

export interface ResearchResult {
  query: string;
  findings: ResearchFinding[];
  rawSummary: string;
}
