'use client';

import { ReactionEvent } from '@/lib/api';

interface Props {
  reactions: ReactionEvent[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'text-green-400 bg-green-900/30 border-green-700',
  negative: 'text-red-400 bg-red-900/30 border-red-700',
  neutral: 'text-gray-400 bg-gray-800/30 border-gray-600',
  mixed: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
};

const REACTION_ICONS: Record<string, string> = {
  like: '👍',
  share: '🔁',
  comment: '💬',
  skip: '⏭️',
  save: '🔖',
  report: '🚩',
};

export default function ReactionFeed({ reactions }: Props) {
  const displayed = [...reactions].reverse().slice(0, 50);

  return (
    <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-5">
      <h2 className="text-white font-semibold text-lg mb-4">Live Reactions ({reactions.length})</h2>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {displayed.map((r, i) => {
          const colorClass = SENTIMENT_COLORS[r.sentiment || 'neutral'] || SENTIMENT_COLORS.neutral;
          return (
            <div key={i} className={`border rounded-lg p-3 text-sm ${colorClass}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white">
                  {REACTION_ICONS[r.reaction_type || 'skip']} {r.agent_id}
                </span>
                <div className="flex gap-2 text-xs opacity-75">
                  <span>{r.age_group?.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>{r.platform}</span>
                  <span>·</span>
                  <span>⚡ {r.engagement_score}/10</span>
                </div>
              </div>
              <p className="text-gray-300">{r.comment}</p>
              {r.would_share && (
                <span className="inline-block mt-1 text-xs bg-blue-900/50 text-blue-300 border border-blue-700 rounded px-2 py-0.5">
                  Would share
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
