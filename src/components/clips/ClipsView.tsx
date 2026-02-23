import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Tag as TagIcon, X, Upload } from 'lucide-react';
import { getClips, createClip, deleteClip, getTags, updateItemTags, uploadClipFile, getClipFiles, deleteClipFile } from '../../lib/clipSync';
import type { Clip, Tag } from '../../types';
import TagDialog from '../shared/TagDialog';
import SearchAndFilter from '../shared/SearchAndFilter';
import TagBadge from '../shared/TagBadge';

export default function ClipsView() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNewClip, setShowNewClip] = useState(false);
  const [newClipTitle, setNewClipTitle] = useState('');
  const [newClipContent, setNewClipContent] = useState('');
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [clipToTag, setClipToTag] = useState<Clip | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadClips();
    loadTags();
  }, [search]);

  async function loadClips() {
    try {
      const data = await getClips(search);
      setClips(data);
    } catch (error) {
      console.error('Failed to load clips:', error);
    }
  }

  async function loadTags() {
    try {
      const data = await getTags();
      setAllTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  }

  async function handleCreateClip() {
    if (!newClipContent.trim()) return;

    try {
      await createClip({
        title: newClipTitle || null,
        content: newClipContent,
        source: 'manual'
      });
      setNewClipTitle('');
      setNewClipContent('');
      setShowNewClip(false);
      loadClips();
      showToast('Clip saved');
    } catch (error) {
      console.error('Failed to create clip:', error);
      showToast('Failed to save clip');
    }
  }

  async function handleDeleteClip(id: string) {
    if (!confirm('Delete this clip?')) return;

    try {
      await deleteClip(id);
      loadClips();
      showToast('Clip deleted');
    } catch (error) {
      console.error('Failed to delete clip:', error);
    }
  }

  async function handleCopyToClipboard(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  function handleTagToggle(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }

  function handleClearFilters() {
    setSearch('');
    setSelectedTags([]);
  }

  async function handleSaveTags(clipId: string, tagIds: string[]) {
    try {
      await updateItemTags(clipId, tagIds, 'clip');
      setShowTagDialog(false);
      setClipToTag(null);
      loadClips();
      showToast('Tags updated');
    } catch (error) {
      console.error('Failed to update tags:', error);
      showToast('Failed to update tags');
    }
  }

  const filteredClips = clips.filter(clip => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tagId =>
      clip.tags?.some(tag => tag.id === tagId)
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowNewClip(true)}
          className="action-button action-button-gold"
        >
          <Plus size={14} /> NEW CLIP
        </button>
      </div>

      <SearchAndFilter
        searchValue={search}
        onSearchChange={setSearch}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        availableTags={allTags}
        onClearFilters={handleClearFilters}
        placeholder="Search clips by title or content..."
      />

      {showNewClip && (
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
              New Clip
            </h3>
            <button
              onClick={() => setShowNewClip(false)}
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
            placeholder="Title (optional)"
            value={newClipTitle}
            onChange={(e) => setNewClipTitle(e.target.value)}
            className="search-input"
            style={{ marginBottom: '12px' }}
          />

          <textarea
            placeholder="Content"
            value={newClipContent}
            onChange={(e) => setNewClipContent(e.target.value)}
            className="search-input"
            rows={4}
            style={{ marginBottom: '12px', minHeight: '100px' }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowNewClip(false)}
              className="action-button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateClip}
              className="action-button action-button-gold"
            >
              Save Clip
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredClips.map(clip => (
          <div key={clip.id} className="card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                {clip.title && (
                  <h3 style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    {clip.title}
                  </h3>
                )}
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px'
                }}>
                  {new Date(clip.created_at).toLocaleString()}
                  {' · '}
                  <span className="badge">{clip.source}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setClipToTag(clip)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                  title="Manage tags"
                >
                  <TagIcon size={14} />
                </button>
                <button
                  onClick={() => handleCopyToClipboard(clip.content)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleDeleteClip(clip.id)}
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

            <p style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '8px'
            }}>
              {clip.content}
            </p>

            {clip.tags && clip.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {clip.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredClips.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-dim)'
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No clips found
            </p>
          </div>
        )}
      </div>

      {clipToTag && (
        <TagDialog
          onClose={() => setClipToTag(null)}
          onSave={(tagIds) => handleSaveTags(clipToTag.id, tagIds)}
          initialTags={clipToTag.tags?.map(t => t.id) || []}
        />
      )}

      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  );
}
