import { NextResponse } from 'next/server';
import { load } from 'cheerio';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Basic validation
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; KyeBeezyBot/1.0; +http://kyebeezy.com)'
            }
        });

        if (!response.ok) {
            // If fetch fails (e.g. 404), return minimal info
            const domain = new URL(url).hostname;
            return NextResponse.json({
                title: domain,
                description: '',
                image: '',
                domain
            });
        }

        const html = await response.text();
        const $ = load(html);

        const getMetaTag = (name: string) =>
            $(`meta[property="${name}"]`).attr('content') ||
            $(`meta[name="${name}"]`).attr('content') ||
            '';

        const title = getMetaTag('og:title') || $('title').text() || '';
        const description = getMetaTag('og:description') || getMetaTag('description') || '';
        const image = getMetaTag('og:image') || '';
        const siteName = getMetaTag('og:site_name') || '';

        // Fallback domain
        const domain = new URL(url).hostname.replace('www.', '');

        return NextResponse.json({
            title: title || domain,
            description,
            image,
            domain: siteName || domain
        });

    } catch (error) {
        console.error('Preview API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
    }
}
