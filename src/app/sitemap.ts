import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tablexport.com'

const indexedRoutes = [
  {
    path: '',
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/waitlist',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/privacy',
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    path: '/terms',
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    path: '/refund',
    changeFrequency: 'monthly',
    priority: 0.4,
  },
] as const satisfies Array<{
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  priority: number
}>

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return indexedRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
