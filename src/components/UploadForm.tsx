import { useState } from 'react';
import { Upload, Link as LinkIcon, ListPlus } from 'lucide-react';
import { api } from '../lib/api';

interface UploadFormProps {
  onUploadComplete: () => void;
}

function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [mode, setMode] = useState<'file' | 'url' | 'bulk'>('file');
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'audio' | 'document'>('video');
  const [url, setUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [message, setMessage] = useState('');

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const fileInput = formElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file || !title) {
      setMessage('Please provide all required fields');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);

      await api.jobs.upload(formData);
      setMessage('File uploaded successfully. Processing queued.');
      setTitle('');
      fileInput.value = '';
      onUploadComplete();
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!url || !title) {
      setMessage('Please provide all required fields');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await api.jobs.createFromUrl({ url, title, type });
      setMessage('URL submitted successfully. Processing queued.');
      setTitle('');
      setUrl('');
      onUploadComplete();
    } catch (error: any) {
      setMessage(`Submit failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();

    const urls = bulkUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) {
      setMessage('Please provide at least one URL');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      await api.jobs.bulkCreate({ urls, type });
      setMessage(`${urls.length} URLs submitted successfully. Processing queued.`);
      setBulkUrls('');
      onUploadComplete();
    } catch (error: any) {
      setMessage(`Submit failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '8px',
        color: '#ffffff'
      }}>
        Media Ingest
      </h2>
      <p style={{
        fontSize: '13px',
        color: '#9ca3af',
        marginBottom: '24px',
        fontFamily: 'monospace'
      }}>
        Upload media files, submit URLs, or batch-process TikTok links
      </p>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #2d3748',
        paddingBottom: '16px'
      }}>
        <button
          onClick={() => setMode('file')}
          style={{
            padding: '8px 16px',
            background: mode === 'file' ? '#D4A843' : '#1a2332',
            color: mode === 'file' ? '#0a0e1a' : '#9ca3af',
            border: '1px solid #2d3748',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Upload size={14} />
          File Upload
        </button>

        <button
          onClick={() => setMode('url')}
          style={{
            padding: '8px 16px',
            background: mode === 'url' ? '#D4A843' : '#1a2332',
            color: mode === 'url' ? '#0a0e1a' : '#9ca3af',
            border: '1px solid #2d3748',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LinkIcon size={14} />
          URL
        </button>

        <button
          onClick={() => setMode('bulk')}
          style={{
            padding: '8px 16px',
            background: mode === 'bulk' ? '#D4A843' : '#1a2332',
            color: mode === 'bulk' ? '#0a0e1a' : '#9ca3af',
            border: '1px solid #2d3748',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ListPlus size={14} />
          Bulk URLs
        </button>
      </div>

      {mode === 'file' && (
        <form onSubmit={handleFileUpload} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px'
              }}
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              File
            </label>
            <input
              type="file"
              required
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#9ca3af',
                fontSize: '13px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              padding: '12px',
              background: uploading ? '#4b5563' : '#D4A843',
              color: uploading ? '#9ca3af' : '#0a0e1a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              fontFamily: 'monospace'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </form>
      )}

      {mode === 'url' && (
        <form onSubmit={handleUrlSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px'
              }}
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              padding: '12px',
              background: uploading ? '#4b5563' : '#D4A843',
              color: uploading ? '#9ca3af' : '#0a0e1a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              fontFamily: 'monospace'
            }}
          >
            {uploading ? 'Submitting...' : 'Submit & Process'}
          </button>
        </form>
      )}

      {mode === 'bulk' && (
        <form onSubmit={handleBulkSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px'
              }}
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontFamily: 'monospace' }}>
              URLs (one per line)
            </label>
            <textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              required
              rows={10}
              placeholder="https://example.com/video1&#10;https://example.com/video2&#10;https://example.com/video3"
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a2332',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              padding: '12px',
              background: uploading ? '#4b5563' : '#D4A843',
              color: uploading ? '#9ca3af' : '#0a0e1a',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              fontFamily: 'monospace'
            }}
          >
            {uploading ? 'Submitting...' : 'Process All URLs'}
          </button>
        </form>
      )}

      {message && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: message.includes('failed') ? '#7f1d1d' : '#065f46',
          border: `1px solid ${message.includes('failed') ? '#ef4444' : '#10b981'}`,
          borderRadius: '4px',
          color: '#ffffff',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default UploadForm;
