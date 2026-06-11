import type { MetadataRoute } from 'next'
import { getAllCookbookRecipes } from '@/lib/cookbook'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tablexport.com'

type SitemapRoute = {
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  priority: number
}

const staticRoutes = [
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
    path: '/cookbook',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/features',
    changeFrequency: 'weekly',
    priority: 0.7,
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
] as const satisfies SitemapRoute[]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const cookbookEntries: MetadataRoute.Sitemap = getAllCookbookRecipes().map((recipe) => ({
    url: `${siteUrl}/cookbook/${recipe.slug}`,
    lastModified: new Date(recipe.frontmatter.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...cookbookEntries]
}
