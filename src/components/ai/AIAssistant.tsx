import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'research'>('chat');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  async function handleSendMessage() {
    if (!message.trim()) return;

    setMessages([...messages, { role: 'user', content: message }]);
    setMessage('');

  }

  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      top: '84px',
      bottom: '24px',
      width: '420px',
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('chat')}
            className="tab-button"
            style={{
              borderBottom: activeTab === 'chat' ? '2px solid var(--accent-gold)' : '2px solid transparent'
            }}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className="tab-button"
            style={{
              borderBottom: activeTab === 'research' ? '2px solid var(--accent-blue)' : '2px solid transparent'
            }}
          >
            Research
          </button>
        </div>
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

      {activeTab === 'chat' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <textarea
              placeholder="System prompt (optional)"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="search-input"
              rows={3}
              style={{ fontSize: '11px' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-dim)' }}>
                <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Start a conversation
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      background: msg.role === 'user' ? 'var(--bg-input)' : 'var(--bg-hover)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '12px',
                      lineHeight: 1.6
                    }}
                  >
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: '6px'
                    }}>
                      {msg.role}
                    </div>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                className="search-input"
                rows={2}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSendMessage}
                className="action-button action-button-gold"
                style={{ alignSelf: 'flex-end' }}
              >
                <Send size={14} />
              </button>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>
              Configure your OpenAI API key in Settings to use AI features
            </p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
          <textarea
            placeholder="Research topic..."
            className="search-input"
            rows={4}
            style={{ marginBottom: '12px' }}
          />
          <textarea
            placeholder="Specific URLs (optional)"
            className="search-input"
            rows={3}
            style={{ marginBottom: '12px' }}
          />
          <select className="search-input" style={{ marginBottom: '16px' }}>
            <option value="3">Quick (3 sources)</option>
            <option value="5">Standard (5 sources)</option>
            <option value="10">Deep (10 sources)</option>
          </select>
          <button className="action-button action-button-gold" style={{ width: '100%' }}>
            Start Research
          </button>
          <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '12px', textAlign: 'center' }}>
            AI will search, scrape, and synthesize findings
          </p>
        </div>
      )}
    </div>
  );
}
