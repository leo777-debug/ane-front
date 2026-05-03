const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const res = await fetch(`${API_URL}/api/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to create simulation: ${res.statusText}`);
  return res.json();
}

export function streamSimulation(
  simId: string,
  onEvent: (event: ReactionEvent) => void,
  onError: (err: Error) => void
): () => void {
  const es = new EventSource(`${API_URL}/api/simulations/${simId}/stream`);
  es.onmessage = (e) => {
    try {
      const event: ReactionEvent = JSON.parse(e.data);
      onEvent(event);
      if (event.type === 'complete' || event.type === 'error') {
        es.close();
      }
    } catch {
      // ignore parse errors
    }
  };
  es.onerror = () => {
    onError(new Error('Stream connection error'));
    es.close();
  };
  return () => es.close();
}

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}

export async function queryGraph(entities: string): Promise<{ context: string }> {
  const res = await fetch(`${API_URL}/graph/query?entities=${encodeURIComponent(entities)}`);
  if (!res.ok) throw new Error('Failed to query graph');
  return res.json();
}
