import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Download, Upload, Keyboard } from 'lucide-react';
import { getHotkeys, createHotkey, updateHotkey, deleteHotkey } from '../../lib/clipSync';
import type { Hotkey } from '../../types';

export default function HotkeysView() {
  const [hotkeys, setHotkeys] = useState<Hotkey[]>([]);
  const [showNewHotkey, setShowNewHotkey] = useState(false);
  const [recording, setRecording] = useState(false);
  const [newHotkey, setNewHotkey] = useState<Partial<Hotkey>>({
    combo: '',
    action: 'fire_prompt',
    label: ''
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadHotkeys();
  }, []);

  useEffect(() => {
    if (recording) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [recording]);

  async function loadHotkeys() {
    try {
      const data = await getHotkeys();
      setHotkeys(data);
    } catch (error) {
      console.error('Failed to load hotkeys:', error);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!recording) return;

    e.preventDefault();
    e.stopPropagation();

    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (e.metaKey) parts.push('Meta');

    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      parts.push(e.key.toUpperCase());
      const combo = parts.join('+');
      setNewHotkey(prev => ({ ...prev, combo }));
      setRecording(false);
    }
  }

  async function handleCreateHotkey() {
    if (!newHotkey.combo || !newHotkey.label) {
      showToast('Combo and label are required');
      return;
    }

    try {
      await createHotkey(newHotkey as Hotkey);
      setNewHotkey({ combo: '', action: 'fire_prompt', label: '' });
      setShowNewHotkey(false);
      loadHotkeys();
      showToast('Hotkey created');
    } catch (error) {
      console.error('Failed to create hotkey:', error);
      showToast('Failed to create hotkey');
    }
  }

  async function handleDeleteHotkey(id: string) {
    if (!confirm('Delete this hotkey?')) return;

    try {
      await deleteHotkey(id);
      loadHotkeys();
      showToast('Hotkey deleted');
    } catch (error) {
      console.error('Failed to delete hotkey:', error);
    }
  }

  function handleExportJSON() {
    const data = {
      version: 1,
      hotkeys: hotkeys.map(hk => ({
        id: hk.id,
        combo: hk.combo,
        action: hk.action,
        target: hk.target,
        label: hk.label,
        payload: hk.payload
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotkeys.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Hotkeys exported');
  }

  function handleExportAHK() {
    const script = `; ClipSync AutoHotkey Script
; Generated: ${new Date().toISOString()}

; Configuration
HOTKEYS_JSON_PATH := A_ScriptDir . "\\hotkeys.json"
CLIPSYNC_URL := "https://clip.dlowehomelab.com"

; Only run when ClipSync is NOT active
#IfWinNotActive, ClipSync

${hotkeys.map(hk => {
  const ahkCombo = hk.combo
    .replace('Ctrl', '^')
    .replace('Shift', '+')
    .replace('Alt', '!')
    .replace('Meta', '#')
    .replace('+', '');

  if (hk.action === 'copy_prompt' && hk.payload) {
    return `${ahkCombo}::
  Clipboard := "${hk.payload.replace(/"/g, '""')}"
  Return`;
  } else if (hk.action === 'fire_prompt') {
    return `${ahkCombo}::
  Run, ${CLIPSYNC_URL}/?hotkey=${hk.id}
  Return`;
  } else if (hk.action === 'navigate') {
    return `${ahkCombo}::
  Run, ${CLIPSYNC_URL}/${hk.target || ''}
  Return`;
  }
  return '';
}).filter(Boolean).join('\n\n')}

#IfWinNotActive
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clipsync_hotkeys.ahk';
    a.click();
    URL.revokeObjectURL(url);
    showToast('AHK script exported');
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  }

  const actionLabels = {
    fire_prompt: 'Fire Prompt',
    copy_prompt: 'Copy Prompt',
    navigate: 'Navigate',
    toggle_ai: 'Toggle AI',
    quick_clip: 'Quick Clip',
    run_scrape: 'Run Scrape',
    run_research: 'Run Research'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportJSON}
            className="action-button"
          >
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={handleExportAHK}
            className="action-button"
          >
            <Download size={14} /> Export AHK
          </button>
        </div>
        <button
          onClick={() => setShowNewHotkey(true)}
          className="action-button action-button-gold"
        >
          <Plus size={14} /> NEW HOTKEY
        </button>
      </div>

      {showNewHotkey && (
        <div className="card" style={{ marginBottom: '24px' }}>
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
              New Hotkey
            </h3>
            <button
              onClick={() => {
                setShowNewHotkey(false);
                setRecording(false);
              }}
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

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}>
                Keyboard Combo
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newHotkey.combo || ''}
                  readOnly
                  placeholder="Click Record to capture"
                  className="search-input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => setRecording(!recording)}
                  className={recording ? 'action-button action-button-gold' : 'action-button'}
                >
                  <Keyboard size={14} /> {recording ? 'Recording...' : 'Record'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              Label
            </label>
            <input
              type="text"
              placeholder="e.g., Fire PROBE prompt"
              value={newHotkey.label || ''}
              onChange={(e) => setNewHotkey(prev => ({ ...prev, label: e.target.value }))}
              className="search-input"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              Action
            </label>
            <select
              value={newHotkey.action || 'fire_prompt'}
              onChange={(e) => setNewHotkey(prev => ({ ...prev, action: e.target.value as Hotkey['action'] }))}
              className="search-input"
            >
              {Object.entries(actionLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              Target (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., prompt_id, page_name"
              value={newHotkey.target || ''}
              onChange={(e) => setNewHotkey(prev => ({ ...prev, target: e.target.value }))}
              className="search-input"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '6px'
            }}>
              Payload (optional)
            </label>
            <textarea
              placeholder="e.g., prompt text for copy_prompt action"
              value={newHotkey.payload || ''}
              onChange={(e) => setNewHotkey(prev => ({ ...prev, payload: e.target.value }))}
              className="search-input"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowNewHotkey(false);
                setRecording(false);
              }}
              className="action-button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateHotkey}
              className="action-button action-button-gold"
            >
              Create Hotkey
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {hotkeys.map(hotkey => (
          <div key={hotkey.id} className="card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: 'var(--accent-gold-bg)',
                    color: 'var(--accent-gold)',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid var(--accent-gold-border)'
                  }}>
                    {hotkey.combo}
                  </span>
                  <span className="badge">
                    {actionLabels[hotkey.action]}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  marginBottom: '6px',
                  color: 'var(--text-primary)'
                }}>
                  {hotkey.label}
                </h3>
                {hotkey.target && (
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginBottom: '4px'
                  }}>
                    Target: <code style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: 'var(--bg-raised)',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>{hotkey.target}</code>
                  </p>
                )}
                {hotkey.payload && (
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '8px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: 'var(--bg-raised)',
                    padding: '8px',
                    borderRadius: '3px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {hotkey.payload}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDeleteHotkey(hotkey.id)}
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

        {hotkeys.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-dim)'
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              No hotkeys configured
            </p>
            <p style={{ fontSize: '11px', marginTop: '8px' }}>
              Create a hotkey to get started
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
