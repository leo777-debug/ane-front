const API_URL = 'https://ane-ai.onrender.com';

export interface ContentInput {
  title: string;
  text: string;
  type: string;
  target_platform: string;
}
export interface DemographicsInput {
  age_groups: string[];
  genders: string[];
  region: string;
  mena_focus: boolean;
  platforms: string[];
}
export interface SimulationRequest {
  content: ContentInput;
  demographics: DemographicsInput;
  agent_count: number;
}
export interface ReactionEvent {
  type: 'reaction' | 'complete' | 'error';
  timestamp: string;
  agent_id?: string;
  age_group?: string;
  gender?: string;
  platform?: string;
  region?: string;
  sentiment?: string;
  reaction_type?: string;
  comment?: string;
  engagement_score?: number;
  would_share?: boolean;
  analytics?: Analytics;
  total_agents?: number;
  message?: string;
}
export interface Analytics {
  total_reactions: number;
  avg_engagement_score: number;
  share_rate_percent: number;
  viral_score: number;
  sentiment_breakdown: Record<string, number>;
  reaction_type_breakdown: Record<string, number>;
  platform_breakdown: Record<string, number>;
  age_group_breakdown: Record<string, number>;
  top_comments: string[];
}

export async function createSimulation(req: SimulationRequest): Promise<{ simulation_id: string; agent_count: number }> {
  const res = await fetch(`${API_URL}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to create simulation: ${res.statusText}`);
  const data = await res.json();
  // backend returns { id, status }
  return { simulation_id: data.id, agent_count: req.agent_count };
}

export function streamSimulation(
  simId: string,
  onEvent: (event: ReactionEvent) => void,
  onError: (err: Error) => void
): () => void {
  let isClosed = false;
  let sentCount = 0;

  const poll = async () => {
    if (isClosed) return;
    try {
      const res = await fetch(`${API_URL}/api/simulate/${simId}`);
      if (!res.ok) throw new Error('Failed to fetch simulation status');
      const data = await res.json();

      // Stream new results one by one
      if (data.results && data.results.length > sentCount) {
        const newResults = data.results.slice(sentCount);
        newResults.forEach((result: any) => {
          onEvent({
            type: 'reaction',
            timestamp: new Date().toISOString(),
            ...result,
          });
        });
        sentCount = data.results.length;
      }

      if (data.status === 'completed') {
        onEvent({
          type: 'complete',
          timestamp: new Date().toISOString(),
          analytics: data.analytics || {},
        });
        isClosed = true;
      } else if (data.status === 'failed') {
        onEvent({
          type: 'error',
          timestamp: new Date().toISOString(),
          message: data.error || 'Simulation failed',
        });
        isClosed = true;
      } else {
        // Still running — poll again in 2s
        setTimeout(poll, 2000);
      }
    } catch (err: any) {
      onError(new Error(err.message || 'Polling failed'));
      isClosed = true;
    }
  };

  poll();
  return () => { isClosed = true; };
}

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

export async function queryGraph(entities: string): Promise<{ context: string }> {
  const res = await fetch(`${API_URL}/api/graph/query?entities=${encodeURIComponent(entities)}`);
  if (!res.ok) throw new Error('Failed to query graph');
  return res.json();
}
