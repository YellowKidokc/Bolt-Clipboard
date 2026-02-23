import { Activity, Eye, Rss, Shield, MessageSquare, Settings, Info } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'antichrist', icon: Eye, label: 'Antichrist Watch' },
    { id: 'prophecies', icon: Activity, label: 'Prophecy Triggers' },
    { id: 'feeds', icon: Rss, label: 'RSS Feeds' },
    { id: 'feds', icon: Shield, label: 'Fed Truth' },
    { id: 'ai', icon: MessageSquare, label: 'AI Analyst Chat' },
    { id: 'settings', icon: Settings, label: 'Admin & Uploads' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-bold">PROPHECY INTEL</span>
            <span className="text-xs text-gray-500">v2.1 / LIVE</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    currentView === item.id
                      ? 'bg-zinc-800 text-yellow-500'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
