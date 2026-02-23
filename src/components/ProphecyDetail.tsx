import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ExternalLink, Calendar, Tag } from 'lucide-react';
import { Database } from '../lib/database.types';

type Prophecy = Database['public']['Tables']['prophecies']['Row'];

interface FeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pub_date: string;
  keywords_matched: string[];
  feed_name: string;
}

interface ProphecyDetailProps {
  prophecyId: string;
  onBack: () => void;
}

export function ProphecyDetail({ prophecyId, onBack }: ProphecyDetailProps) {
  const [prophecy, setProphecy] = useState<Prophecy | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProphecyAndFeeds();
  }, [prophecyId]);

  const fetchProphecyAndFeeds = async () => {
    setLoading(true);

    const { data: prophecyData } = await supabase
      .from('prophecies')
      .select('*')
      .eq('id', prophecyId)
      .maybeSingle();

    if (prophecyData) {
      setProphecy(prophecyData);
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: itemsData } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        link,
        description,
        pub_date,
        keywords_matched,
        feed:rss_feeds(name)
      `)
      .gte('pub_date', ninetyDaysAgo.toISOString())
      .order('pub_date', { ascending: false });

    if (itemsData && prophecyData) {
      const filteredItems = itemsData.filter((item: any) =>
        prophecyData.keywords.some((keyword) =>
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      setFeedItems(
        filteredItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          link: item.link,
          description: item.description,
          pub_date: item.pub_date,
          keywords_matched: item.keywords_matched || [],
          feed_name: item.feed?.name || 'Unknown',
        }))
      );
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !prophecy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Triggers</span>
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-2">{prophecy.reference}</div>
            <h1 className="text-3xl font-bold text-white mb-3">{prophecy.title}</h1>
            <p className="text-gray-400 text-lg mb-4">{prophecy.description}</p>
          </div>
          <div className="px-4 py-2 bg-zinc-800 rounded-md border border-yellow-500/30">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="text-sm font-semibold text-yellow-500">{prophecy.status}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {prophecy.keywords.map((keyword) => (
            <span
              key={keyword}
              className="text-xs px-3 py-1.5 bg-zinc-800 text-gray-300 rounded-md border border-zinc-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          RSS Feed Items (Last 90 Days)
        </h2>
        <p className="text-gray-400 text-sm">
          Showing {feedItems.length} article{feedItems.length !== 1 ? 's' : ''} matching this prophecy's keywords
        </p>
      </div>

      <div className="space-y-4">
        {feedItems.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-lg">
            <p className="text-gray-500">No articles found in the last 90 days.</p>
            <p className="text-gray-600 text-sm mt-2">
              Articles matching this prophecy's keywords will appear here.
            </p>
          </div>
        ) : (
          feedItems.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-yellow-500/50 hover:bg-zinc-800 transition-all group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-yellow-500 transition-colors flex-1">
                  {item.title}
                </h3>
                <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors flex-shrink-0" />
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.pub_date)}</span>
                  </div>
                  <div className="text-gray-600">
                    {item.feed_name}
                  </div>
                </div>

                {item.keywords_matched.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">
                      {item.keywords_matched.length} keyword{item.keywords_matched.length !== 1 ? 's' : ''} matched
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
