import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getAllCookbookRecipes, getAllCategories } from '@/lib/cookbook';

export const metadata: Metadata = {
  title: 'Data Workflow Cookbook | TableXport',
  description: 'Step-by-step guides and recipes to solve common data problems and streamline your workflow with TableXport.',
  keywords: ['data workflow', 'table processing', 'excel', 'csv', 'data cleaning', 'tutorials', 'guides'],
  openGraph: {
    title: 'Data Workflow Cookbook | TableXport',
    description: 'Step-by-step guides and recipes to solve common data problems and streamline your workflow with TableXport.',
    type: 'website',
  },
};

export default function CookbookPage() {
  const recipes = getAllCookbookRecipes();
  const categories = getAllCategories();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cookbook' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-6">
            Data Workflow Cookbook
          </h1>
          <p className="text-xl text-secondary/70 max-w-3xl mx-auto leading-relaxed">
            Master your data workflows with our comprehensive collection of step-by-step guides, 
            tutorials, and best practices for table processing and data transformation.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-secondary mb-4">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/cookbook?category=${encodeURIComponent(category.toLowerCase())}`}
                  className="px-4 py-2 rounded-full bg-white/60 border border-primary-light/50 text-sm font-medium text-secondary hover:bg-white hover:border-primary-light transition-all duration-200 backdrop-blur-sm"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <article key={recipe.slug} className="group">
                <Link href={`/cookbook/${recipe.slug}`} className="block h-full">
                  <div className="h-full p-6 rounded-xl bg-white/60 border border-primary-light/50 transition-all duration-300 hover:bg-white hover:border-primary-light hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm">
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-light/30 text-primary border border-primary-light/40">
                        {recipe.frontmatter.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-secondary mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {recipe.frontmatter.title}
                      </h3>
                      <p className="text-secondary/70 text-sm leading-relaxed mb-4 line-clamp-3">
                        {recipe.frontmatter.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-primary-light/30">
                      <div className="flex items-center gap-4 text-xs text-secondary/60">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{recipe.frontmatter.readingTime}</span>
                        </div>
                        <time dateTime={recipe.frontmatter.date}>
                          {new Date(recipe.frontmatter.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      <ArrowRight 
                        size={14} 
                        className="text-secondary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" 
                      />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary/60 text-lg">
              No recipes available yet. Check back soon for helpful guides and tutorials!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}