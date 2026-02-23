import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Plus, Trash2 } from 'lucide-react';
import { getSetting, setSetting, getCustomPages, createCustomPage, deleteCustomPage } from '../../lib/clipSync';
import type { CustomPage } from '../../types';

interface SettingsViewProps {
  onPagesChange: () => void;
}

export default function SettingsView({ onPagesChange }: SettingsViewProps) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [mcpToken, setMcpToken] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showMcpToken, setShowMcpToken] = useState(false);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('file');
  const [newPageType, setNewPageType] = useState<'link_collection' | 'text_collection' | 'embed' | 'custom_html'>('link_collection');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadSettings();
    loadCustomPages();
  }, []);

  async function loadSettings() {
    try {
      const apiKey = await getSetting('openai_api_key');
      const token = await getSetting('mcp_token');
      if (apiKey) setOpenaiKey(apiKey);
      if (token) setMcpToken(token);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function loadCustomPages() {
    try {
      const pages = await getCustomPages();
      setCustomPages(pages);
    } catch (error) {
      console.error('Failed to load custom pages:', error);
    }
  }

  async function handleSaveSettings() {
    try {
      if (openaiKey) await setSetting('openai_api_key', openaiKey);
      if (mcpToken) await setSetting('mcp_token', mcpToken);
      showToast('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings');
    }
  }

  async function handleCreatePage() {
    if (!newPageName.trim()) return;

    try {
      await createCustomPage({
        name: newPageName,
        icon: newPageIcon,
        page_type: newPageType,
        config: {},
        sort_order: 0
      });
      setNewPageName('');
      setNewPageIcon('file');
      setNewPageType('link_collection');
      setShowNewPage(false);
      loadCustomPages();
      onPagesChange();
      showToast('Page created');
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  }

  async function handleDeletePage(id: string) {
    if (!confirm('Delete this custom page?')) return;

    try {
      await deleteCustomPage(id);
      loadCustomPages();
      onPagesChange();
      showToast('Page deleted');
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '16px',
          color: 'var(--accent-gold)'
        }}>
          API Configuration
        </h2>

        <div className="card" style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            OpenAI API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showOpenaiKey ? 'text' : 'password'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="search-input"
              style={{ paddingRight: '44px' }}
            />
            <button
              onClick={() => setShowOpenaiKey(!showOpenaiKey)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '4px'
              }}
            >
              {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p style={{
            fontSize: '10px',
            color: 'var(--text-dim)',
            marginTop: '6px'
          }}>
            Required for AI chat and research features
          </p>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            MCP Token
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showMcpToken ? 'text' : 'password'}
              value={mcpToken}
              onChange={(e) => setMcpToken(e.target.value)}
              placeholder="Generate a secure token..."
              className="search-input"
              style={{ paddingRight: '44px' }}
            />
            <button
              onClick={() => setShowMcpToken(!showMcpToken)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '4px'
              }}
            >
              {showMcpToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p style={{
            fontSize: '10px',
            color: 'var(--text-dim)',
            marginTop: '6px'
          }}>
            Used for Model Context Protocol authentication
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="action-button action-button-gold"
        >
          <Save size={14} /> Save Settings
        </button>
      </section>

      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'var(--accent-blue)'
          }}>
            Custom Pages
          </h2>
          <button
            onClick={() => setShowNewPage(true)}
            className="action-button action-button-gold"
          >
            <Plus size={14} /> Add Page
          </button>
        </div>

        {customPages.length === 0 ? (
          <div className="card">
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '24px'
            }}>
              No custom pages yet. Add pages to extend ClipSync functionality.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {customPages.map(page => (
              <div key={page.id} className="card">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                      {page.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="badge">{page.page_type.replace('_', ' ')}</span>
                      <span className="badge">Icon: {page.icon}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showNewPage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              New Custom Page
            </h3>

            <input
              type="text"
              placeholder="Page name"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            />

            <input
              type="text"
              placeholder="Icon name (e.g., file, link, star)"
              value={newPageIcon}
              onChange={(e) => setNewPageIcon(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            />

            <select
              value={newPageType}
              onChange={(e) => setNewPageType(e.target.value as any)}
              className="search-input"
              style={{ marginBottom: '16px' }}
            >
              <option value="link_collection">Link Collection</option>
              <option value="text_collection">Text Collection</option>
              <option value="embed">Embed (iFrame)</option>
              <option value="custom_html">Custom HTML</option>
            </select>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewPage(false)}
                className="action-button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                className="action-button action-button-gold"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
