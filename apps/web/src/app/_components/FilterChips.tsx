'use client';

import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (selectedIds: string[]) => void;
  className?: string;
}

export function FilterChips({ filters, selectedFilters, onFilterChange, className = '' }: FilterChipsProps) {
  const [isScrollable, setIsScrollable] = useState(false);

  const handleFilterToggle = (filterId: string) => {
    const newSelection = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId];
    
    onFilterChange(newSelection);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className={className}>
      {/* Clear all button - показываем только если есть активные фильтры */}
      {selectedFilters.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-xs)',
        }}>
          <span style={{
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-muted)',
          }}>
            Активных фильтров: {selectedFilters.length}
          </span>
          <button
            onClick={clearAllFilters}
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-accent-warm)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-xs)',
              borderRadius: 'var(--radius-chip)',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(240,179,90,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            Очистить всё
          </button>
        </div>
      )}

      {/* Chips container */}
      <div 
        style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-xs)',
          scrollBehavior: 'smooth',
          // Стилизация скроллбара
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-border-subtle) transparent',
        }}
        onScroll={(e) => {
          const target = e.currentTarget;
          setIsScrollable(target.scrollWidth > target.clientWidth);
        }}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
              className={`chip ${isSelected ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs) var(--space-s)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-medium)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: isSelected 
                  ? 'var(--color-accent-warm)'
                  : 'var(--color-bg-glass)',
                color: isSelected 
                  ? 'var(--color-text-on-accent)'
                  : 'var(--color-text-secondary)',
                border: `1px solid ${isSelected 
                  ? 'var(--color-accent-warm)' 
                  : 'var(--color-border-subtle)'}`,
                borderRadius: 'var(--radius-chip)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-out)',
                backdropFilter: 'blur(12px)',
                boxShadow: isSelected 
                  ? 'var(--shadow-warm)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-accent-warm)';
                  e.currentTarget.style.background = 'var(--color-bg-layer)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                  e.currentTarget.style.background = 'var(--color-bg-glass)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-pressed={isSelected}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span style={{
                  fontSize: 'var(--font-size-caption)',
                  opacity: 0.8,
                  marginLeft: '2px',
                }}>
                  {filter.count}
                </span>
              )}
              
              {/* Selection indicator */}
              {isSelected && (
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ marginLeft: '2px' }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll hint */}
      {isScrollable && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 'var(--space-xs)',
        }}>
          <div style={{
            width: '32px',
            height: '4px',
            background: 'var(--color-border-subtle)',
            borderRadius: '2px',
            opacity: 0.5,
          }} />
        </div>
      )}
    </div>
  );
}
