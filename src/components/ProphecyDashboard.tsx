import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProphecyCard } from './ProphecyCard';
import { Database } from '../lib/database.types';

type Prophecy = Database['public']['Tables']['prophecies']['Row'];

interface ProphecyDashboardProps {
  onSelectProphecy: (prophecyId: string) => void;
}

export function ProphecyDashboard({ onSelectProphecy }: ProphecyDashboardProps) {
  const [prophecies, setProphecies] = useState<Prophecy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchProphecies();
  }, []);

  const fetchProphecies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prophecies')
      .select('*')
      .order('order_index', { ascending: true });

    if (data && !error) {
      setProphecies(data);
    }
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Triggers' },
    { id: 'antichrist', label: 'Antichrist' },
    { id: 'israel', label: 'Israel' },
    { id: 'covenant', label: 'Covenants' },
    { id: 'economy', label: 'Economy' },
    { id: 'temple', label: 'Temple' },
    { id: 'church', label: 'Church' },
  ];

  const filteredProphecies =
    filter === 'all'
      ? prophecies
      : prophecies.filter((p) => p.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading prophecies...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Prophecy Triggers</h1>
        <p className="text-gray-400">
          The 12 key Biblical events that Scripture indicates must be in motion. Click any card for detailed intelligence, feed sources, and readiness assessment.
        </p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat.id
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProphecies.map((prophecy) => (
          <ProphecyCard
            key={prophecy.id}
            prophecy={prophecy}
            onClick={() => onSelectProphecy(prophecy.id)}
          />
        ))}
      </div>

      {filteredProphecies.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No prophecies found in this category.
        </div>
      )}
    </div>
  );
}
