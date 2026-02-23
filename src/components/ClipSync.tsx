import { useState, useEffect } from 'react';
import {
  Clipboard,
  FileText,
  Bookmark,
  MessageSquare,
  Link2,
  Settings as SettingsIcon,
  Plus,
  Menu,
  X,
  Keyboard
} from 'lucide-react';
import ClipsView from './clips/ClipsView';
import NotesView from './notes/NotesView';
import BookmarksView from './bookmarks/BookmarksView';
import PromptsView from './prompts/PromptsView';
import ResearchLinksView from './research/ResearchLinksView';
import HotkeysView from './hotkeys/HotkeysView';
import SettingsView from './settings/SettingsView';
import AIAssistant from './ai/AIAssistant';
import CustomPageView from './pages/CustomPageView';
import { getCustomPages } from '../lib/clipSync';
import type { CustomPage } from '../types';

type View = 'clips' | 'notes' | 'bookmarks' | 'prompts' | 'research' | 'hotkeys' | 'settings' | string;

export default function ClipSync() {
  const [currentView, setCurrentView] = useState<View>('clips');
  const [showAI, setShowAI] = useState(false);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadCustomPages();
  }, []);

  async function loadCustomPages() {
    try {
      const pages = await getCustomPages();
      setCustomPages(pages);
    } catch (error) {
      console.error('Failed to load custom pages:', error);
    }
  }

  function getIconForView(view: string) {
    switch (view) {
      case 'clips': return <Clipboard size={16} />;
      case 'notes': return <FileText size={16} />;
      case 'bookmarks': return <Bookmark size={16} />;
      case 'prompts': return <MessageSquare size={16} />;
      case 'research': return <Link2 size={16} />;
      case 'hotkeys': return <Keyboard size={16} />;
      case 'settings': return <SettingsIcon size={16} />;
      default: return <FileText size={16} />;
    }
  }

  function renderView() {
    switch (currentView) {
      case 'clips':
        return <ClipsView />;
      case 'notes':
        return <NotesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'prompts':
        return <PromptsView />;
      case 'research':
        return <ResearchLinksView pageId="default-research" />;
      case 'hotkeys':
        return <HotkeysView />;
      case 'settings':
        return <SettingsView onPagesChange={loadCustomPages} />;
      default:
        const customPage = customPages.find(p => p.id === currentView);
        if (customPage) {
          return <CustomPageView page={customPage} />;
        }
        return <ClipsView />;
    }
  }

  const menuItems = [
    { id: 'clips', label: 'Clips', icon: <Clipboard size={16} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={16} /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={16} /> },
    { id: 'prompts', label: 'Prompts', icon: <MessageSquare size={16} /> },
    { id: 'research', label: 'Research Links', icon: <Link2 size={16} /> },
    { id: 'hotkeys', label: 'Hotkeys', icon: <Keyboard size={16} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-base)'
    }}>
      {sidebarOpen && (
        <div style={{
          width: '240px',
          background: 'var(--bg-raised)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div className="brand-tag">
              POF 2828 <span style={{ color: 'var(--text-ghost)' }}>—</span> <span style={{ color: '#444', fontSize: '10px', letterSpacing: '2px' }}>CLIPSYNC</span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: currentView === item.id ? 'var(--bg-selected)' : 'transparent',
                  border: 'none',
                  borderLeft: currentView === item.id ? '3px solid var(--accent-gold)' : '3px solid transparent',
                  color: currentView === item.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                  transition: 'all 0.12s ease'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            {customPages.length > 0 && (
              <div style={{
                margin: '12px 20px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                {customPages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentView(page.id)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'transparent',
                      border: 'none',
                      borderLeft: currentView === page.id ? '3px solid var(--accent-blue)' : '3px solid transparent',
                      color: currentView === page.id ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                      marginLeft: '-3px'
                    }}
                  >
                    {getIconForView(page.icon)}
                    {page.name}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: '60px',
          background: 'var(--bg-raised)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '8px'
              }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}>
              {currentView === 'clips' ? 'Clipboard Manager' :
               currentView === 'notes' ? 'Notes' :
               currentView === 'bookmarks' ? 'Bookmarks' :
               currentView === 'prompts' ? 'Prompt Library' :
               currentView === 'research' ? 'Research Links' :
               currentView === 'settings' ? 'Settings' :
               customPages.find(p => p.id === currentView)?.name || 'ClipSync'}
            </h1>
          </div>

          <button
            onClick={() => setShowAI(!showAI)}
            className="action-button action-button-gold"
          >
            {showAI ? 'HIDE AI' : 'AI ASSISTANT'}
          </button>
        </header>

        <main style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative'
        }}>
          {renderView()}

          {showAI && (
            <AIAssistant onClose={() => setShowAI(false)} />
          )}
        </main>
      </div>
    </div>
  );
}
