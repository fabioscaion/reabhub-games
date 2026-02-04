import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    console.log('Proxying audio from URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from source: ${response.statusText}`);
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set('Content-Type', blob.type || 'audio/mpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json({ error: 'Failed to proxy audio' }, { status: 500 });
  }
}
