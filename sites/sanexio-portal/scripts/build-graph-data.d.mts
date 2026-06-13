export const VAULT: string;

export type GraphPayload = {
  generated_at: string;
  stats: {
    nodes: number;
    edges: number;
    files_scanned: number;
  };
  clusters: { id: string; color: string }[];
  nodes: { id: string; label: string; cluster: string; degree: number }[];
  edges: { source: string; target: string }[];
};

export function buildGraph(options?: { quiet?: boolean }): Promise<GraphPayload>;
