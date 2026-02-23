import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Trash2, X } from 'lucide-react';
import { getBookmarks, createBookmark, deleteBookmark } from '../../lib/clipSync';
import type { Bookmark } from '../../types';

export default function BookmarksView() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showNewBookmark, setShowNewBookmark] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    try {
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }

  async function handleCreateBookmark() {
    if (!newUrl.trim()) return;

    try {
      await createBookmark({
        url: newUrl,
        title: newTitle || null,
        description: newDescription || null
      });
      setNewUrl('');
      setNewTitle('');
      setNewDescription('');
      setShowNewBookmark(false);
      loadBookmarks();
      showToast('Bookmark saved');
    } catch (error) {
      console.error('Failed to create bookmark:', error);
      showToast('Failed to save bookmark');
    }
  }

  async function handleDeleteBookmark(id: string) {
    if (!confirm('Delete this bookmark?')) return;

    try {
      await deleteBookmark(id);
      loadBookmarks();
      showToast('Bookmark deleted');
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowNewBookmark(true)}
          className="action-button action-button-gold"
        >
          <Plus size={14} /> NEW BOOKMARK
        </button>
      </div>

      {showNewBookmark && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              New Bookmark
            </h3>
            <button
              onClick={() => setShowNewBookmark(false)}
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
            type="url"
            placeholder="URL (required)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="search-input"
            style={{ marginBottom: '12px' }}
          />

          <input
            type="text"
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="search-input"
            style={{ marginBottom: '12px' }}
          />

          <textarea
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="search-input"
            rows={3}
            style={{ marginBottom: '12px' }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowNewBookmark(false)}
              className="action-button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBookmark}
              className="action-button action-button-gold"
            >
              Save Bookmark
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {bookmarks.map(bookmark => (
          <div key={bookmark.id} className="card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: 'var(--text-primary)'
                }}>
                  {bookmark.title || bookmark.url}
                </h3>

                {bookmark.description && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    lineHeight: 1.5
                  }}>
                    {bookmark.description}
                  </p>
                )}

                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent-gold)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {bookmark.url}
                  <ExternalLink size={12} />
                </a>

                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  marginTop: '8px'
                }}>
                  {new Date(bookmark.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {bookmarks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-dim)'
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No bookmarks found
            </p>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  );
}
