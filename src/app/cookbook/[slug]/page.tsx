import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock, Calendar, Tag } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TableOfContents } from '@/components/cookbook/TableOfContents';
import MDXComponents from '@/components/cookbook/MDXComponents';
import { getCookbookRecipeBySlug, getAllCookbookRecipes, generateTableOfContents } from '@/lib/cookbook';

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const recipes = getAllCookbookRecipes();
  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const recipe = getCookbookRecipeBySlug(resolvedParams.slug);

  if (!recipe) {
    return {
      title: 'Recipe Not Found | TableXport Cookbook',
    };
  }

  const { title, description, keywords, category } = recipe.frontmatter;

  return {
    title: `${title} | TableXport Cookbook`,
    description,
    keywords: [...keywords, category, 'TableXport', 'data workflow', 'tutorial'],
    openGraph: {
      title: `${title} | TableXport Cookbook`,
      description,
      type: 'article',
      publishedTime: recipe.frontmatter.date,
      tags: [...keywords, category],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | TableXport Cookbook`,
      description,
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const resolvedParams = await params;
  const recipe = getCookbookRecipeBySlug(resolvedParams.slug);

  if (!recipe) {
    notFound();
  }

  const { frontmatter, content } = recipe;
  const tableOfContents = generateTableOfContents(content);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cookbook', href: '/cookbook' },
    { label: frontmatter.category, href: `/cookbook?category=${encodeURIComponent(frontmatter.category.toLowerCase())}` },
    { label: frontmatter.title },
  ];

  // Generate structured data for the article
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    author: {
      '@type': 'Organization',
      name: 'TableXport',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TableXport',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tablexport.com'}/logo-dark.svg`,
      },
    },
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    keywords: frontmatter.keywords.join(', '),
    articleSection: frontmatter.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
        <div className="container-custom py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="max-w-none">
                {/* Header */}
                <header className="mb-8 pb-8 border-b border-primary-light/30">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-primary-light/30 text-primary border border-primary-light/40">
                      {frontmatter.category}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-4 leading-tight">
                    {frontmatter.title}
                  </h1>
                  
                  <p className="text-xl text-secondary/70 leading-relaxed mb-6">
                    {frontmatter.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary/60">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <time dateTime={frontmatter.date}>
                        {new Date(frontmatter.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{frontmatter.readingTime}</span>
                    </div>
                    {frontmatter.keywords.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag size={16} />
                        <span>{frontmatter.keywords.slice(0, 3).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </header>

                {/* Content — typography via MDXComponents + .cookbook-mdx */}
                <div className="cookbook-mdx max-w-[56rem]">
                  <MDXRemote
                    source={content}
                    components={MDXComponents}
                    options={{
                      mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        rehypePlugins: [
                          [
                            rehypePrettyCode,
                            {
                              theme: 'github-dark',
                              keepBackground: false,
                              defaultLang: 'text',
                            } satisfies PrettyCodeOptions,
                          ],
                        ],
                        format: 'mdx',
                      },
                    }}
                  />
                </div>
              </article>
            </div>

            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <TableOfContents headings={tableOfContents} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}