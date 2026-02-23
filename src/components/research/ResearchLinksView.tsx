import { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Trash2, X } from 'lucide-react';
import { getLinks, createLink, deleteLink } from '../../lib/clipSync';
import type { Link } from '../../types';

interface ResearchLinksViewProps {
  pageId: string;
}

export default function ResearchLinksView({ pageId }: ResearchLinksViewProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewLink, setShowNewLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState('general');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadLinks();
  }, [pageId]);

  async function loadLinks() {
    try {
      const data = await getLinks(pageId);
      setLinks(data);
    } catch (error) {
      console.error('Failed to load links:', error);
    }
  }

  async function handleCreateLink() {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    try {
      await createLink({
        page_id: pageId,
        title: newLinkTitle,
        url: newLinkUrl,
        category: newLinkCategory
      });
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkCategory('general');
      setShowNewLink(false);
      loadLinks();
      showToast('Link saved');
    } catch (error) {
      console.error('Failed to create link:', error);
    }
  }

  async function handleDeleteLink(id: string) {
    if (!confirm('Delete this link?')) return;

    try {
      await deleteLink(id);
      loadLinks();
      showToast('Link deleted');
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  const categories = ['all', ...Array.from(new Set(links.map(l => l.category)))];
  const filteredLinks = links.filter(link => {
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    const matchesSearch = !search ||
      link.title.toLowerCase().includes(search.toLowerCase()) ||
      link.url.toLowerCase().includes(search.toLowerCase()) ||
      (link.domain && link.domain.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoryColors: Record<string, string> = {
    ai: 'var(--accent-gold)',
    tools: 'var(--accent-blue)',
    research: 'var(--accent-purple)',
    docs: 'var(--accent-green)',
    general: 'var(--text-muted)'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }}
          />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '44px' }}
          />
        </div>

        <button
          onClick={() => setShowNewLink(true)}
          className="action-button action-button-gold"
        >
          <Plus size={14} /> NEW LINK
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="tab-button"
            style={{
              borderBottom: selectedCategory === cat ? `2px solid ${categoryColors[cat] || 'var(--accent-gold)'}` : '2px solid transparent',
              color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            {cat.toUpperCase()}
            <span style={{
              marginLeft: '6px',
              fontSize: '9px',
              color: 'var(--text-dim)'
            }}>
              ({cat === 'all' ? links.length : links.filter(l => l.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {filteredLinks.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              borderLeft: `3px solid ${categoryColors[link.category] || 'var(--text-muted)'}`,
              display: 'block',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                flex: 1
              }}>
                {link.title}
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteLink(link.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  opacity: 0,
                  transition: 'opacity 0.12s ease'
                }}
                className="delete-button"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {link.domain && (
                <span className="badge" style={{ fontSize: '9px' }}>
                  {link.domain}
                </span>
              )}
              <span
                className="badge"
                style={{
                  background: `${categoryColors[link.category] || 'var(--text-muted)'}20`,
                  color: categoryColors[link.category] || 'var(--text-muted)',
                  border: `1px solid ${categoryColors[link.category] || 'var(--text-muted)'}40`
                }}
              >
                {link.category}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--accent-gold)',
              fontSize: '10px'
            }}>
              <ExternalLink size={10} />
              <span style={{ opacity: 0.7 }}>Open Link</span>
            </div>
          </a>
        ))}

        {filteredLinks.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-dim)'
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No links found
            </p>
          </div>
        )}
      </div>

      {showNewLink && (
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                New Link
              </h3>
              <button
                onClick={() => setShowNewLink(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Link title"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            />

            <input
              type="url"
              placeholder="URL"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            />

            <select
              value={newLinkCategory}
              onChange={(e) => setNewLinkCategory(e.target.value)}
              className="search-input"
              style={{ marginBottom: '16px' }}
            >
              <option value="general">General</option>
              <option value="ai">AI</option>
              <option value="tools">Tools</option>
              <option value="research">Research</option>
              <option value="docs">Documentation</option>
            </select>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewLink(false)}
                className="action-button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                className="action-button action-button-gold"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

      <style>{`
        .card:hover .delete-button {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
