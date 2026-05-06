'use client';

import { useState, useCallback } from 'react';
import SimulationForm from '@/components/SimulationForm';
import ReactionFeed from '@/components/ReactionFeed';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import GraphRagPanel from '@/components/GraphRagPanel';
import { createSimulation, streamSimulation, ReactionEvent, Analytics, SimulationRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SimulatePage() {
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalAgents, setTotalAgents] = useState(0);
  const [activeEntities, setActiveEntities] = useState<string>('');
  const router = useRouter();

  const runSimulation = useCallback(async (req: SimulationRequest) => {
    setReactions([]);
    setAnalytics(null);
    setError(null);
    setRunning(true);
    setProgress(0);
    setTotalAgents(req.agent_count);

    const entities = [
      ...req.demographics.age_groups,
      ...req.demographics.platforms,
      req.demographics.region
    ].filter(Boolean).join(', ');
    setActiveEntities(entities);

    try {
      const { simulation_id } = await createSimulation(req);

      streamSimulation(
        simulation_id,
        (event) => {
          if (event.type === 'reaction') {
            setReactions((prev) => [...prev, event]);
            setProgress((prev) => prev + 1);
          } else if (event.type === 'complete') {
            if (event.analytics) setAnalytics(event.analytics);
            setRunning(false);
          } else if (event.type === 'error') {
            setError(event.message || 'Simulation error');
            setRunning(false);
          }
        },
        (err) => {
          setError(err.message);
          setRunning(false);
        }
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start simulation');
      setRunning(false);
    }
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              ANE<span className="text-purple-400">.ai</span>
            </h1>
            <p className="text-gray-400">Audience Network Emulator — see how the world reacts to your content</p>
          </div>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#5a6080', fontFamily: 'inherit', fontSize: 12, padding: '8px 16px', cursor: 'pointer' }}
          >
            ← BACK
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <SimulationForm onSubmit={runSimulation} running={running} />
          {activeEntities && <GraphRagPanel entities={activeEntities} />}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 text-red-300">
              <strong>Error:</strong> {error}
            </div>
          )}

          {(running || reactions.length > 0) && (
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">
                  {running ? 'Simulating...' : 'Complete'}
                </span>
                <span className="text-purple-400 text-sm">{progress} / {totalAgents} agents</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: totalAgents > 0 ? `${(progress / totalAgents) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}

          {analytics && <AnalyticsPanel analytics={analytics} />}
          {reactions.length > 0 && <ReactionFeed reactions={reactions} />}
        </div>
      </div>
    </main>
  );
}
