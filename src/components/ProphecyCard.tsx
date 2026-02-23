import { Eye, Clock } from 'lucide-react';
import { Database } from '../lib/database.types';

type Prophecy = Database['public']['Tables']['prophecies']['Row'];

interface ProphecyCardProps {
  prophecy: Prophecy;
  onClick: () => void;
}

export function ProphecyCard({ prophecy, onClick }: ProphecyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WATCHING':
        return 'text-gray-400 border-gray-700';
      case 'PARTIAL FULFILLMENT':
        return 'text-yellow-500 border-yellow-500';
      case 'ACTIVE':
        return 'text-yellow-500 border-yellow-500';
      case 'DOMINANT':
        return 'text-orange-500 border-orange-500';
      case 'DORMANT':
        return 'text-gray-600 border-gray-600';
      case 'FULFILLED':
        return 'text-green-500 border-green-500';
      default:
        return 'text-gray-400 border-gray-700';
    }
  };

  const getLastHitText = (lastHit: string | null) => {
    if (!lastHit) return 'No recent activity';

    const date = new Date(lastHit);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const statusColor = getStatusColor(prophecy.status);

  return (
    <button
      onClick={onClick}
      className={`w-full bg-zinc-900 border ${statusColor} rounded-lg p-6 hover:bg-zinc-800 transition-all text-left group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">{prophecy.reference}</div>
          <h3 className="text-lg font-bold text-white group-hover:text-yellow-500 transition-colors">
            {prophecy.title}
          </h3>
        </div>
        <Eye className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {prophecy.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {prophecy.keywords.slice(0, 4).map((keyword) => (
          <span
            key={keyword}
            className="text-xs px-2 py-1 bg-zinc-800 text-gray-400 rounded border border-zinc-700"
          >
            {keyword}
          </span>
        ))}
        {prophecy.keywords.length > 4 && (
          <span className="text-xs px-2 py-1 text-gray-500">
            +{prophecy.keywords.length - 4} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <span className={`text-xs font-semibold ${statusColor}`}>
            {prophecy.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Last hit: {getLastHitText(prophecy.last_hit)}</span>
        </div>
      </div>
    </button>
  );
}
