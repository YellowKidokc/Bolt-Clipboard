import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { LiveTicker } from './LiveTicker';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Navigation currentView={currentView} onNavigate={onNavigate} />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <LiveTicker />
    </div>
  );
}
