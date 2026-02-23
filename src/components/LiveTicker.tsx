import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock } from 'lucide-react';

interface TickerItem {
  id: string;
  title: string;
  feed_name: string;
  pub_date: string;
}

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchRecentItems = async () => {
      const { data } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          pub_date,
          feed:rss_feeds(name)
        `)
        .order('pub_date', { ascending: false })
        .limit(20);

      if (data) {
        setItems(
          data.map((item: any) => ({
            id: item.id,
            title: item.title,
            feed_name: item.feed?.name || 'Unknown',
            pub_date: item.pub_date,
          }))
        );
      }
    };

    fetchRecentItems();
    const interval = setInterval(fetchRecentItems, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const tickerContent = items.length > 0
    ? items.map((item) => `${item.feed_name}: ${item.title}`).join(' • ')
    : 'MONITORING LIVE FEEDS...';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-yellow-500/30 z-50">
      <div className="flex items-center h-12 overflow-hidden">
        <div className="flex-shrink-0 bg-yellow-500 text-black px-4 h-full flex items-center gap-2 font-bold text-sm">
          <Clock className="w-4 h-4" />
          <span>LAST UPDATE (UTC)</span>
        </div>
        <div className="flex-shrink-0 bg-zinc-800 text-yellow-500 px-4 h-full flex items-center font-mono text-sm">
          {currentTime.toISOString().slice(0, 19).replace('T', ' ')}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-ticker whitespace-nowrap text-sm text-gray-300">
            <span className="inline-block px-8">{tickerContent}</span>
            <span className="inline-block px-8">{tickerContent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
