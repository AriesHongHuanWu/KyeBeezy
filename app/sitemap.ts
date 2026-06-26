import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE = 'https://kyebeezy.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
        { path: '/', priority: 1, changeFrequency: 'weekly' },
        { path: '/submit', priority: 0.9, changeFrequency: 'daily' },
        { path: '/join', priority: 0.9, changeFrequency: 'weekly' },
        { path: '/collab', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/events', priority: 0.7, changeFrequency: 'weekly' },
        { path: '/university', priority: 0.6, changeFrequency: 'weekly' },
    ]
    return routes.map((r) => ({
        url: `${BASE}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }))
}
