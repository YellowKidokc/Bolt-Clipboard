import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag as TagIcon, X } from 'lucide-react';
import { getNotes, createNote, deleteNote, getTags, updateItemTags } from '../../lib/clipSync';
import type { Note, Tag } from '../../types';
import SearchAndFilter from '../shared/SearchAndFilter';
import TagDialog from '../shared/TagDialog';
import TagBadge from '../shared/TagBadge';

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteToTag, setNoteToTag] = useState<Note | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadNotes();
    loadTags();
  }, [search]);

  async function loadNotes() {
    try {
      const data = await getNotes(search);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
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

  async function handleCreateNote() {
    if (!newNoteContent.trim()) return;

    try {
      await createNote({
        title: newNoteTitle || null,
        content: newNoteContent,
        source: 'manual'
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNewNote(false);
      loadNotes();
      showToast('Note saved');
    } catch (error) {
      console.error('Failed to create note:', error);
      showToast('Failed to save note');
    }
  }

  async function handleDeleteNote(id: string) {
    if (!confirm('Delete this note?')) return;

    try {
      await deleteNote(id);
      loadNotes();
      showToast('Note deleted');
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  async function handleSaveTags(noteId: string, tagIds: string[]) {
    try {
      await updateItemTags(noteId, tagIds, 'note');
      setNoteToTag(null);
      loadNotes();
      showToast('Tags updated');
    } catch (error) {
      console.error('Failed to update tags:', error);
      showToast('Failed to update tags');
    }
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

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  const filteredNotes = notes.filter(note => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tagId =>
      note.tags?.some(tag => tag.id === tagId)
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowNewNote(true)}
          className="action-button action-button-gold"
        >
          <Plus size={14} /> NEW NOTE
        </button>
      </div>

      <SearchAndFilter
        searchValue={search}
        onSearchChange={setSearch}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        availableTags={allTags}
        onClearFilters={handleClearFilters}
        placeholder="Search notes by title or content..."
      />

      {showNewNote && (
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
              New Note
            </h3>
            <button
              onClick={() => setShowNewNote(false)}
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
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="search-input"
            style={{ marginBottom: '12px' }}
          />

          <textarea
            placeholder="Content"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="search-input"
            rows={8}
            style={{ marginBottom: '12px', minHeight: '200px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowNewNote(false)}
              className="action-button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNote}
              className="action-button action-button-gold"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredNotes.map(note => (
          <div key={note.id} className="card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                {note.title && (
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    {note.title}
                  </h3>
                )}
                <p style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px'
                }}>
                  {new Date(note.created_at).toLocaleString()}
                  {' · '}
                  <span className="badge">{note.source}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setNoteToTag(note)}
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
                  onClick={() => handleDeleteNote(note.id)}
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
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {note.content}
            </p>

            {note.tags && note.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                {note.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-dim)'
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No notes found
            </p>
          </div>
        )}
      </div>

      {noteToTag && (
        <TagDialog
          onClose={() => setNoteToTag(null)}
          onSave={(tagIds) => handleSaveTags(noteToTag.id, tagIds)}
          initialTags={noteToTag.tags?.map(t => t.id) || []}
        />
      )}

      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  );
}
