import { useState, useEffect } from 'react';
import { Search, Plus, Copy, Trash2, Edit2, X } from 'lucide-react';
import { getPrompts, createPrompt, deletePrompt } from '../../lib/clipSync';
import type { Prompt } from '../../types';

export default function PromptsView() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState('general');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newPromptShortcut, setNewPromptShortcut] = useState('');
  const [chainedPrompts, setChainedPrompts] = useState<Prompt[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory]);

  async function loadPrompts() {
    try {
      const data = await getPrompts(selectedCategory);
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  }

  async function handleCreatePrompt() {
    if (!newPromptName.trim() || !newPromptContent.trim()) return;

    try {
      await createPrompt({
        name: newPromptName,
        category: newPromptCategory,
        content: newPromptContent,
        shortcut_key: newPromptShortcut || null
      });
      setNewPromptName('');
      setNewPromptCategory('general');
      setNewPromptContent('');
      setNewPromptShortcut('');
      setShowNewPrompt(false);
      loadPrompts();
      showToast('Prompt saved');
    } catch (error) {
      console.error('Failed to create prompt:', error);
    }
  }

  async function handleDeletePrompt(id: string) {
    if (!confirm('Delete this prompt?')) return;

    try {
      await deletePrompt(id);
      loadPrompts();
      showToast('Prompt deleted');
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  }

  function handleCopyPrompt(content: string) {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard');
  }

  function addToChain(prompt: Prompt) {
    setChainedPrompts([...chainedPrompts, prompt]);
    showToast('Added to chain');
  }

  function removeFromChain(index: number) {
    setChainedPrompts(chainedPrompts.filter((_, i) => i !== index));
  }

  function copyChain() {
    const chainText = chainedPrompts.map((p, i) => `${i + 1}. ${p.name}\n${p.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(chainText);
    showToast('Chain copied to clipboard');
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  const categories = ['all', 'general', 'writing', 'code', 'analysis', 'research'];
  const filteredPrompts = search
    ? prompts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
    : prompts;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <div style={{ width: '42%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
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
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '44px' }}
              />
            </div>
            <button
              onClick={() => setShowNewPrompt(true)}
              className="action-button action-button-gold"
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="tab-button"
                style={{
                  borderBottom: selectedCategory === cat ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filteredPrompts.map(prompt => (
            <div key={prompt.id} className="card" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                    {prompt.name}
                  </h3>
                  <span className="badge">{prompt.category}</span>
                  {prompt.shortcut_key && (
                    <span className="badge" style={{ marginLeft: '6px', background: 'var(--accent-gold-bg)', color: 'var(--accent-gold)' }}>
                      {prompt.shortcut_key}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => addToChain(prompt)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px' }}
                    title="Add to chain"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleCopyPrompt(prompt.content)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px' }}
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                {prompt.content.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Prompt Chain Builder
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Click + on prompts to build a chain
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {chainedPrompts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                No prompts in chain
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {chainedPrompts.map((prompt, index) => (
                <div key={index} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {index + 1}
                      </span>
                      <h3 style={{ fontSize: '12px', fontWeight: 700 }}>
                        {prompt.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => removeFromChain(index)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {prompt.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {chainedPrompts.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={copyChain} className="action-button action-button-gold" style={{ flex: 1 }}>
                Copy Entire Chain
              </button>
              <button onClick={() => setChainedPrompts([])} className="action-button">
                Clear Chain
              </button>
            </div>
          </div>
        )}
      </div>

      {showNewPrompt && (
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
          <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              New Prompt
            </h3>
            <input
              type="text"
              placeholder="Prompt name"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            />
            <select
              value={newPromptCategory}
              onChange={(e) => setNewPromptCategory(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            >
              <option value="general">General</option>
              <option value="writing">Writing</option>
              <option value="code">Code</option>
              <option value="analysis">Analysis</option>
              <option value="research">Research</option>
            </select>
            <input
              type="text"
              placeholder="Shortcut key (optional)"
              value={newPromptShortcut}
              onChange={(e) => setNewPromptShortcut(e.target.value)}
              className="search-input"
              style={{ marginBottom: '12px' }}
            />
            <textarea
              placeholder="Prompt content"
              value={newPromptContent}
              onChange={(e) => setNewPromptContent(e.target.value)}
              className="search-input"
              rows={10}
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewPrompt(false)} className="action-button">
                Cancel
              </button>
              <button onClick={handleCreatePrompt} className="action-button action-button-gold">
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
