'use client';

import { Analytics } from '@/lib/api';

interface Props {
  analytics: Analytics;
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-300 w-6 text-right">{value}</span>
    </div>
  );
}

export default function AnalyticsPanel({ analytics }: Props) {
  const maxSentiment = Math.max(...Object.values(analytics.sentiment_breakdown), 1);
  const maxReaction = Math.max(...Object.values(analytics.reaction_type_breakdown), 1);

  const viralColor =
    analytics.viral_score >= 70 ? 'text-green-400' :
    analytics.viral_score >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-5 space-y-5">
      <h2 className="text-white font-semibold text-lg">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Viral Score" value={`${analytics.viral_score}`} unit="/100" color={viralColor} />
        <Stat label="Avg Engagement" value={analytics.avg_engagement_score.toFixed(1)} unit="/10" color="text-blue-400" />
        <Stat label="Share Rate" value={`${analytics.share_rate_percent}`} unit="%" color="text-purple-400" />
        <Stat label="Total Agents" value={`${analytics.total_reactions}`} unit="" color="text-gray-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-3">Sentiment</h3>
          <div className="space-y-2">
            {Object.entries(analytics.sentiment_breakdown).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxSentiment}
                color={k === 'positive' ? 'bg-green-500' : k === 'negative' ? 'bg-red-500' : k === 'mixed' ? 'bg-yellow-500' : 'bg-gray-500'} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-3">Reactions</h3>
          <div className="space-y-2">
            {Object.entries(analytics.reaction_type_breakdown).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxReaction} color="bg-purple-500" />
            ))}
          </div>
        </div>
      </div>

      {analytics.top_comments.length > 0 && (
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-3">Top Comments</h3>
          <ul className="space-y-2">
            {analytics.top_comments.map((c, i) => (
              <li key={i} className="text-gray-300 text-sm bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
                "{c}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-4 text-center border border-gray-700">
      <div className={`text-2xl font-bold ${color}`}>{value}<span className="text-sm font-normal text-gray-500">{unit}</span></div>
      <div className="text-gray-400 text-xs mt-1">{label}</div>
    </div>
  );
}
