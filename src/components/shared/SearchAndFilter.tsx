import { Search, Tag as TagIcon, X } from 'lucide-react';
import type { Tag } from '../../types';

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  availableTags: Tag[];
  onClearFilters: () => void;
  placeholder?: string;
}

export default function SearchAndFilter({
  searchValue,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  onClearFilters,
  placeholder = 'Search...'
}: SearchAndFilterProps) {
  const hasFilters = searchValue.length > 0 || selectedTags.length > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: searchValue ? 'var(--accent-gold)' : 'var(--text-muted)',
              transition: 'color 0.15s ease'
            }}
          />
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px'
            }}
          />
        </div>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="action-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {availableTags.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <TagIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)'
            }}>
              Filter by Tags
            </span>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {availableTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.id)}
                className="badge"
                style={{
                  cursor: 'pointer',
                  background: selectedTags.includes(tag.id) ? 'var(--accent-gold-bg)' : 'var(--bg-raised)',
                  color: selectedTags.includes(tag.id) ? 'var(--accent-gold)' : 'var(--text-muted)',
                  border: `1px solid ${selectedTags.includes(tag.id) ? 'var(--accent-gold-border)' : 'var(--border)'}`,
                  padding: '6px 12px',
                  transition: 'all 0.15s ease'
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
