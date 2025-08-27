"use client";

export default function BookCard({
  title,
  authors,
  year,
  isbn,
  coverUrl,
  footer,
}: {
  title: string;
  authors: string[];
  year?: number;
  isbn?: string | null;
  coverUrl?: string | null;
  footer?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, background: 'var(--tg-theme-secondary-bg-color, #f1f1f1)' }}>
      <div style={{ width: 56, height: 84, borderRadius: 6, background: '#ddd', overflow: 'hidden', flex: '0 0 auto' }}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e6e6e6' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800 }}>
          {title} {year ? <span style={{ opacity: 0.7 }}>({year})</span> : null}
        </div>
        <div style={{ opacity: 0.8, marginTop: 2 }}>{(authors || []).join(', ')}</div>
        {isbn && <div style={{ fontSize: 12, color: 'var(--tg-theme-hint-color, #999)', marginTop: 4 }}>{isbn}</div>}
        {footer && <div style={{ marginTop: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}


