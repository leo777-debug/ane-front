'use client';

import { useState, useEffect } from 'react';
import { queryGraph } from '@/lib/api';

interface GraphRagPanelProps {
  entities: string;
}

export default function GraphRagPanel({ entities }: GraphRagPanelProps) {
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entities) return;

    const fetchGraph = async () => {
      setLoading(true);
      try {
        const data = await queryGraph(entities);
        setContext(data.context);
      } catch (err) {
        console.error('Graph RAG error:', err);
        setContext('Error loading graph context.');
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [entities]);

  if (!entities) return null;

  return (
    <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
        <h3 className="text-lg font-semibold text-indigo-100">Graph RAG Brain</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Active Entities</p>
          <div className="flex flex-wrap gap-2">
            {entities.split(',').map((e, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300">
                {e.trim()}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Retrieved Knowledge</p>
          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 min-h-[60px]">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                Querying knowledge graph...
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">
                {context || 'No specific knowledge found for these entities.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
