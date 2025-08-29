import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Проверяем, что это URL от Google Books
        if (!imageUrl.includes('books.google.com') && !imageUrl.includes('books.googleusercontent.com')) {
            return new NextResponse('Invalid image source', { status: 400 });
        }

        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BookClub/1.0)',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Кешируем на 24 часа
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Proxy image error:', error);
        return new NextResponse('Failed to fetch image', { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
