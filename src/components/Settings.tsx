import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit, Power } from 'lucide-react';
import { Database } from '../lib/database.types';

type RSSFeed = Database['public']['Tables']['rss_feeds']['Row'];
type PriorityTarget = Database['public']['Tables']['priority_targets']['Row'];

export function Settings() {
  const [activeTab, setActiveTab] = useState<'feeds' | 'targets'>('feeds');
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [targets, setTargets] = useState<PriorityTarget[]>([]);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [showAddTarget, setShowAddTarget] = useState(false);

  const [newFeed, setNewFeed] = useState({ name: '', url: '', category: 'general' });
  const [newTarget, setNewTarget] = useState({
    name: '',
    title: '',
    category: 'general',
    description: '',
    rank: 'MEDIUM',
    score: 5.0,
  });

  useEffect(() => {
    fetchFeeds();
    fetchTargets();
  }, []);

  const fetchFeeds = async () => {
    const { data } = await supabase
      .from('rss_feeds')
      .select('*')
      .order('name', { ascending: true });

    if (data) {
      setFeeds(data);
    }
  };

  const fetchTargets = async () => {
    const { data } = await supabase
      .from('priority_targets')
      .select('*')
      .order('score', { ascending: false });

    if (data) {
      setTargets(data);
    }
  };

  const handleAddFeed = async () => {
    if (!newFeed.name || !newFeed.url) return;

    await supabase.from('rss_feeds').insert([newFeed]);

    setNewFeed({ name: '', url: '', category: 'general' });
    setShowAddFeed(false);
    fetchFeeds();
  };

  const handleAddTarget = async () => {
    if (!newTarget.name || !newTarget.title) return;

    await supabase.from('priority_targets').insert([newTarget]);

    setNewTarget({
      name: '',
      title: '',
      category: 'general',
      description: '',
      rank: 'MEDIUM',
      score: 5.0,
    });
    setShowAddTarget(false);
    fetchTargets();
  };

  const handleDeleteFeed = async (id: string) => {
    await supabase.from('rss_feeds').delete().eq('id', id);
    fetchFeeds();
  };

  const handleToggleFeed = async (id: string, currentStatus: boolean) => {
    await supabase.from('rss_feeds').update({ active: !currentStatus }).eq('id', id);
    fetchFeeds();
  };

  const handleDeleteTarget = async (id: string) => {
    await supabase.from('priority_targets').delete().eq('id', id);
    fetchTargets();
  };

  const handleToggleTarget = async (id: string, currentStatus: boolean) => {
    await supabase.from('priority_targets').update({ is_active: !currentStatus }).eq('id', id);
    fetchTargets();
  };

  const tabs = [
    { id: 'feeds', label: 'Sources & Feeds' },
    { id: 'targets', label: 'Priority Targets' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">System Administration</h1>
        <p className="text-gray-400">Intelligence Control, Source Management & AI Configuration</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'feeds' | 'targets')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'feeds' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Active RSS Feeds</h2>
            <button
              onClick={() => setShowAddFeed(!showAddFeed)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Feed</span>
            </button>
          </div>

          {showAddFeed && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <h3 className="text-white font-semibold mb-4">Add New Feed</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Feed Name"
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
                <input
                  type="text"
                  placeholder="Feed URL"
                  value={newFeed.url}
                  onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
                <select
                  value={newFeed.category}
                  onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="general">General</option>
                  <option value="israel">Israel</option>
                  <option value="feds">Feds</option>
                  <option value="economy">Economy</option>
                  <option value="prophecy">Prophecy</option>
                  <option value="temple">Temple</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddFeed}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md transition-colors"
                >
                  Add Feed
                </button>
                <button
                  onClick={() => setShowAddFeed(false)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {feeds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No feed sources yet. Add one above.
              </div>
            ) : (
              feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleFeed(feed.id, feed.active)}
                        className={`p-1 rounded ${
                          feed.active ? 'text-green-500' : 'text-gray-500'
                        } hover:bg-zinc-700 transition-colors`}
                        title={feed.active ? 'Active' : 'Inactive'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <div>
                        <h3 className="text-white font-semibold">{feed.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-zinc-700 rounded">{feed.category}</span>
                          <span>{feed.url}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFeed(feed.id)}
                    className="p-2 text-red-500 hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'targets' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Priority Targets / People</h2>
            <button
              onClick={() => setShowAddTarget(!showAddTarget)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Person</span>
            </button>
          </div>

          {showAddTarget && (
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <h3 className="text-white font-semibold mb-4">Add New Target</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newTarget.name}
                  onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
                <input
                  type="text"
                  placeholder="Title/Position"
                  value={newTarget.title}
                  onChange={(e) => setNewTarget({ ...newTarget, title: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
                <select
                  value={newTarget.category}
                  onChange={(e) => setNewTarget({ ...newTarget, category: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="general">General</option>
                  <option value="Tech">Tech</option>
                  <option value="Political">Political</option>
                  <option value="Economic">Economic</option>
                  <option value="Ideological">Ideological</option>
                </select>
                <select
                  value={newTarget.rank}
                  onChange={(e) => setNewTarget({ ...newTarget, rank: e.target.value })}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="TOP WATCH">TOP WATCH</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
                <input
                  type="number"
                  placeholder="Score (0-10)"
                  min="0"
                  max="10"
                  step="0.1"
                  value={newTarget.score}
                  onChange={(e) =>
                    setNewTarget({ ...newTarget, score: parseFloat(e.target.value) })
                  }
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <textarea
                placeholder="Description"
                value={newTarget.description}
                onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500 mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTarget}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md transition-colors"
                >
                  Add Target
                </button>
                <button
                  onClick={() => setShowAddTarget(false)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {targets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No priority targets yet. Add one above.
              </div>
            ) : (
              targets.map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTarget(target.id, target.is_active)}
                        className={`p-1 rounded ${
                          target.is_active ? 'text-green-500' : 'text-gray-500'
                        } hover:bg-zinc-700 transition-colors`}
                        title={target.is_active ? 'Active' : 'Inactive'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{target.name}</h3>
                          <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-gray-400">
                            {target.rank}
                          </span>
                          <span className="text-xs text-yellow-500 font-semibold">
                            Score: {target.score.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {target.title} • {target.category}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                          {target.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTarget(target.id)}
                    className="p-2 text-red-500 hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
