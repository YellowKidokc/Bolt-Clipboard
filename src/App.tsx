import { useEffect, useState } from 'react';
import { api, getAuthToken } from './lib/api';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        const data = await api.auth.signup(username, password);
        setUser(data.user);
      } else {
        const data = await api.auth.signin(username, password);
        setUser(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0e1a'
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#6b7280',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Initializing...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0e1a',
        padding: '24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: '#1a2332',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '10px',
              color: '#D4A843',
              letterSpacing: '3px',
              fontWeight: 700,
              marginBottom: '12px',
              fontFamily: 'monospace'
            }}>
              THEOPHYSICS
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Media Pipeline
            </h1>
            <p style={{
              fontSize: '11px',
              color: '#9ca3af',
              fontFamily: 'monospace'
            }}>
              Universal Ingest Engine
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'grid', gap: '16px' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0e1a',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0e1a',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />

            {error && (
              <p style={{
                fontSize: '11px',
                color: '#ef4444',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#D4A843',
                border: 'none',
                borderRadius: '4px',
                color: '#0a0e1a',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontFamily: 'monospace'
              }}
            >
              {isSignUp ? 'Create Account' : 'Access System'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '11px',
                textAlign: 'center',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {isSignUp ? 'Already registered? Sign in' : 'New user? Register'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;
