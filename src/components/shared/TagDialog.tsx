import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { getTags, createTag } from '../../lib/clipSync';
import type { Tag } from '../../types';

interface TagDialogProps {
  onClose: () => void;
  onSave: (tagIds: string[]) => void;
  initialTags?: string[];
}

export default function TagDialog({ onClose, onSave, initialTags = [] }: TagDialogProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      const data = await getTags();
      setAllTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;

    try {
      const tag = await createTag(newTagName.trim());
      setAllTags([...allTags, tag]);
      setSelectedTags([...selectedTags, tag.id]);
      setNewTagName('');
      setShowNewTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  }

  function toggleTag(tagId: string) {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  }

  return (
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
      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Add Tags
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="badge"
                style={{
                  cursor: 'pointer',
                  background: selectedTags.includes(tag.id) ? 'var(--accent-gold-bg)' : 'var(--bg-raised)',
                  color: selectedTags.includes(tag.id) ? 'var(--accent-gold)' : 'var(--text-muted)',
                  border: `1px solid ${selectedTags.includes(tag.id) ? 'var(--accent-gold-border)' : 'var(--border)'}`,
                  padding: '6px 12px'
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>

          {showNewTag ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="New tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                className="search-input"
                autoFocus
                style={{ flex: 1 }}
              />
              <button
                onClick={handleCreateTag}
                className="action-button action-button-gold"
              >
                Add
              </button>
              <button
                onClick={() => setShowNewTag(false)}
                className="action-button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewTag(true)}
              className="action-button"
              style={{ width: '100%' }}
            >
              <Plus size={14} /> Create New Tag
            </button>
          )}
        </div>

        <div style={{
          padding: '20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="action-button"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedTags)}
            className="action-button action-button-gold"
          >
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
}
