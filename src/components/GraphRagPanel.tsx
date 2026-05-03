'use client';

import { useState, useEffect } from 'react';
import { queryGraph } from '@/lib/api';

interface GraphRagPanelProps {
  entities: string;
}

export default function GraphRagPanel({ entities }: GraphRagPanelProps) {
  const [context, setContext] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!entities) return;

    const fetchGraph = async () => {
      setLoading(true);
      setError(false);
      try {
        // Normalize entities for the API (lowercase, no spaces)
        const normalized = entities.split(',').map(e => e.trim().toLowerCase()).join(',');
        const data = await queryGraph(normalized);
        setContext(data.context);
      } catch (err) {
        console.error('Graph RAG error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [entities]);

  if (!entities) return null;

  return (
    <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping absolute opacity-75" />
            <div className="w-3 h-3 bg-indigo-400 rounded-full relative" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Mirofish Graph RAG</h3>
        </div>
        <div className="px-2 py-1 bg-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/30">
          Active Brain
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 opacity-70">Knowledge Nodes</p>
          <div className="flex flex-wrap gap-2">
            {entities.split(',').map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-200">
                <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                {e.trim()}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-transparent to-transparent" />
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 opacity-70">Retrieved Context</p>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/50 min-h-[100px] relative overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-4 gap-3 text-slate-500 text-sm italic">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span>Traversing knowledge graph...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400 text-sm py-2">
                <span className="text-lg">⚠️</span>
                Connection issue. Retrying...
              </div>
            ) : (
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {context || 'No specific knowledge found for these entities.'}
              </div>
            )}
            
            {/* Mirofish-style grid decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
