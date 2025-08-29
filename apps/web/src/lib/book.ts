export type LookupItem = {
    sourceId?: string;
    title: string;
    authors: string[];
    year?: number;
    isbn13?: string;
    isbn10?: string;
    coverUrl?: string;
    source?: string;
    meta?: Record<string, unknown>;
};

export function normalizeForCandidate(b: LookupItem) {
    console.log('[normalizeForCandidate] Input:', b);
    
    // Проверяем что объект не пустой
    if (!b || typeof b !== 'object') {
        throw new Error('Invalid book data provided to normalizeForCandidate');
    }
    
    if (!b.title) {
        throw new Error('Book title is required');
    }
    
    const result = {
        titleNorm: (b.title || '').trim().toLowerCase(),
        authorsNorm: (b.authors || []).map(a => (a || '').trim().toLowerCase()),
        year: b.year || null,
        isbn13: b.isbn13 || null,
        isbn10: b.isbn10 || null,
        coverUrl: b.coverUrl || null,
        source: b.source || 'google_books',
        meta: b.meta ?? {},
    };
    console.log('[normalizeForCandidate] Output:', result);
    return result;
}
