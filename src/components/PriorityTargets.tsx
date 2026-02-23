import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, ChevronDown } from 'lucide-react';
import { Database } from '../lib/database.types';

type PriorityTarget = Database['public']['Tables']['priority_targets']['Row'];

export function PriorityTargets() {
  const [targets, setTargets] = useState<PriorityTarget[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    const { data } = await supabase
      .from('priority_targets')
      .select('*')
      .eq('is_active', true)
      .order('score', { ascending: false });

    if (data) {
      setTargets(data);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'TOP WATCH':
        return 'bg-red-900/50 text-red-500 border-red-500';
      case 'HIGH':
        return 'bg-orange-900/50 text-orange-500 border-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-900/50 text-yellow-500 border-yellow-500';
      default:
        return 'bg-gray-900/50 text-gray-500 border-gray-500';
    }
  };

  const displayedTargets = showAll ? targets : targets.slice(0, 5);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Priority Targets</h2>
        <button className="text-xs text-gray-500 hover:text-yellow-500 transition-colors">
          FULL LIST →
        </button>
      </div>

      <div className="space-y-4">
        {displayedTargets.map((target) => (
          <div
            key={target.id}
            className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded border ${getRankColor(
                      target.rank
                    )} inline-block mb-1`}
                  >
                    {target.rank}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">RANK #{target.score.toFixed(1)}</div>
                <div className="text-2xl font-bold text-yellow-500">{target.score.toFixed(1)}</div>
              </div>
            </div>

            <h3 className="text-white font-bold mb-1">{target.name}</h3>
            <div className="text-xs text-gray-400 mb-2">
              {target.title} • {target.category}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{target.description}</p>
          </div>
        ))}
      </div>

      {targets.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-yellow-500 transition-colors flex items-center justify-center gap-2"
        >
          <span>{showAll ? 'Show Less' : `Show ${targets.length - 5} More`}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
