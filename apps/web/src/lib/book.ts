export type LookupItem = {
    title: string;
    authors: string[];
    year?: number;
    isbn13?: string;
    isbn10?: string;
    coverUrl?: string;
    source?: string;
    meta?: any;
};

export function normalizeForCandidate(b: LookupItem) {
    return {
        titleNorm: (b.title || '').trim().toLowerCase(),
        authorsNorm: (b.authors || []).map(a => (a || '').trim().toLowerCase()),
        year: b.year,
        isbn13: b.isbn13 || null,
        isbn10: b.isbn10 || null,
        coverUrl: b.coverUrl || null,
        source: b.source || 'google_books',
        meta: b.meta ?? {},
    };
}
