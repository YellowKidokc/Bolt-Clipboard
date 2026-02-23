import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

interface JobsListProps {
  onJobUpdate: () => void;
}

function JobsList({ onJobUpdate }: JobsListProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadJobs() {
    try {
      const data = await api.jobs.list();
      setJobs(data.jobs || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setLoading(false);
    }
  }

  async function handleDelete(jobId: string) {
    if (!confirm('Delete this job and all its artifacts?')) return;

    try {
      await api.jobs.delete(jobId);
      await loadJobs();
      onJobUpdate();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'queued': return '#3b82f6';
      case 'processing':
      case 'transcribing':
      case 'analyzing':
        return '#f59e0b';
      default: return '#6b7280';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      case 'queued': return <Clock size={16} />;
      default: return <Loader size={16} className="animate-spin" />;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        paddingTop: '48px',
        color: '#9ca3af',
        fontFamily: 'monospace',
        fontSize: '11px'
      }}>
        Loading jobs...
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        paddingTop: '48px',
        color: '#9ca3af',
        fontFamily: 'monospace',
        fontSize: '11px'
      }}>
        No jobs yet. Upload some media to get started.
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '24px',
        color: '#ffffff'
      }}>
        All Jobs
      </h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              background: '#1a2332',
              border: '1px solid #2d3748',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ color: getStatusColor(job.status) }}>
                  {getStatusIcon(job.status)}
                </div>

                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff'
                }}>
                  {job.title}
                </h3>

                <span style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  background: '#0a0e1a',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  {job.type}
                </span>

                <span style={{
                  fontSize: '10px',
                  color: getStatusColor(job.status),
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}>
                  {job.status}
                </span>
              </div>

              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                fontFamily: 'monospace'
              }}>
                Created: {formatDate(job.created_at)}
              </div>

              {job.error_message && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#ef4444',
                  fontFamily: 'monospace',
                  background: '#7f1d1d',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  Error: {job.error_message}
                </div>
              )}
            </div>

            <button
              onClick={() => handleDelete(job.id)}
              style={{
                padding: '8px',
                background: 'transparent',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete job"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsList;
