'use client';

import { useState } from 'react';
import { SimulationRequest } from '@/lib/api';

interface Props {
  onSubmit: (req: SimulationRequest) => void;
  running: boolean;
}

const AGE_GROUPS = ['gen_z', 'millennial', 'gen_x', 'boomer'];
const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'Twitter/X'];
const REGIONS = ['global', 'mena', 'asia', 'latam', 'us', 'europe'];
const CONTENT_TYPES = ['general', 'video', 'article', 'thumbnail', 'song', 'podcast'];

export default function SimulationForm({ onSubmit, running }: Props) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [contentType, setContentType] = useState('general');
  const [agentCount, setAgentCount] = useState(20);
  const [region, setRegion] = useState('global');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(['gen_z', 'millennial']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['YouTube', 'TikTok']);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({
      content: { title: title || 'Untitled', text, type: contentType, target_platform: selectedPlatforms[0] || 'general' },
      demographics: {
        age_groups: selectedAgeGroups.length ? selectedAgeGroups : AGE_GROUPS,
        genders: ['male', 'female', 'non-binary'],
        region,
        mena_focus: region === 'mena',
        platforms: selectedPlatforms.length ? selectedPlatforms : PLATFORMS,
      },
      agent_count: agentCount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 space-y-5">
      <h2 className="text-white font-semibold text-lg">Content</h2>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Title</label>
        <input
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          placeholder="My viral video idea..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Content / Script <span className="text-red-400">*</span></label>
        <textarea
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 h-32 resize-none"
          placeholder="Paste your content, script, or idea here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Content Type</label>
        <select
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        >
          {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      <hr className="border-gray-700" />
      <h2 className="text-white font-semibold text-lg">Audience</h2>

      <div>
        <label className="block text-gray-400 text-sm mb-2">Age Groups</label>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggle(selectedAgeGroups, setSelectedAgeGroups, g)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedAgeGroups.includes(g)
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-purple-500'
              }`}
            >
              {g.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-2">Platforms</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(selectedPlatforms, setSelectedPlatforms, p)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedPlatforms.includes(p)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-blue-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Region</label>
        <select
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {REGIONS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Agent Count: <span className="text-purple-400">{agentCount}</span></label>
        <input
          type="range"
          min={5}
          max={100}
          step={5}
          value={agentCount}
          onChange={(e) => setAgentCount(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5</span><span>100</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={running || !text.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {running ? 'Simulating...' : 'Run Simulation'}
      </button>
    </form>
  );
}
