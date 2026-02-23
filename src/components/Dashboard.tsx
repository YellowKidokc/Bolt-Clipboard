import { useState, useEffect } from 'react';
import { Upload, List, Activity } from 'lucide-react';
import { api } from '../lib/api';
import JobsList from './JobsList';
import UploadForm from './UploadForm';

function Dashboard() {
  const [activeView, setActiveView] = useState<'upload' | 'jobs' | 'activity'>('upload');
  const [stats, setStats] = useState({ total: 0, queued: 0, processing: 0, completed: 0, failed: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.jobs.list();
      const jobs = data.jobs || [];

      setStats({
        total: jobs.length,
        queued: jobs.filter((j: any) => j.status === 'queued').length,
        processing: jobs.filter((j: any) => j.status === 'processing' || j.status === 'transcribing' || j.status === 'analyzing').length,
        completed: jobs.filter((j: any) => j.status === 'completed').length,
        failed: jobs.filter((j: any) => j.status === 'failed').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        borderBottom: '1px solid #2d3748',
        background: '#1a2332',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#D4A843',
            letterSpacing: '3px',
            fontWeight: 700,
            fontFamily: 'monospace',
            marginBottom: '4px'
          }}>
            THEOPHYSICS
          </div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            Universal Media Pipeline
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontFamily: 'monospace', fontSize: '11px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#9ca3af' }}>TOTAL</div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '18px' }}>{stats.total}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#9ca3af' }}>QUEUED</div>
            <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '18px' }}>{stats.queued}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#9ca3af' }}>ACTIVE</div>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '18px' }}>{stats.processing}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#9ca3af' }}>DONE</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '18px' }}>{stats.completed}</div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        <nav style={{
          width: '200px',
          borderRight: '1px solid #2d3748',
          background: '#1a2332',
          padding: '16px'
        }}>
          <button
            onClick={() => setActiveView('upload')}
            style={{
              width: '100%',
              padding: '12px',
              background: activeView === 'upload' ? '#D4A843' : 'transparent',
              color: activeView === 'upload' ? '#0a0e1a' : '#9ca3af',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <Upload size={16} />
            Ingest
          </button>

          <button
            onClick={() => setActiveView('jobs')}
            style={{
              width: '100%',
              padding: '12px',
              background: activeView === 'jobs' ? '#D4A843' : 'transparent',
              color: activeView === 'jobs' ? '#0a0e1a' : '#9ca3af',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <List size={16} />
            Jobs
          </button>

          <button
            onClick={() => setActiveView('activity')}
            style={{
              width: '100%',
              padding: '12px',
              background: activeView === 'activity' ? '#D4A843' : 'transparent',
              color: activeView === 'activity' ? '#0a0e1a' : '#9ca3af',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <Activity size={16} />
            Activity
          </button>
        </nav>

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {activeView === 'upload' && <UploadForm onUploadComplete={loadStats} />}
          {activeView === 'jobs' && <JobsList onJobUpdate={loadStats} />}
          {activeView === 'activity' && (
            <div style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#9ca3af',
              textAlign: 'center',
              paddingTop: '48px'
            }}>
              Activity monitoring coming soon...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
