import type { Tag } from '../../types';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export default function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span
      className="badge"
      style={{
        background: 'var(--accent-gold-bg)',
        color: 'var(--accent-gold)',
        border: '1px solid var(--accent-gold-border)',
        padding: '4px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-gold)',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
