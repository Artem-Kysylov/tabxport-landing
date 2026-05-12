'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CookbookRecipe } from '@/types/cookbook';

interface CookbookPreviewProps {
  recipes: CookbookRecipe[];
}

export default function CookbookPreview({ recipes }: CookbookPreviewProps) {
  return (
    <section className="py-16 sm:py-24" id="cookbook">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
            Data Workflow Recipes
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            Step-by-step recipes to solve common data problems and streamline your workflow
          </p>
        </motion.div>

        {/* Recipe Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {recipes.map((recipe, index) => (
            <RecipeCard key={recipe.slug} recipe={recipe} index={index} />
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/cookbook"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-white/60 border border-primary-light/50 text-secondary font-semibold transition-all duration-200 hover:bg-white hover:border-primary-light hover:shadow-md backdrop-blur-sm"
          >
            View All Recipes
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function RecipeCard({ recipe, index }: { recipe: CookbookRecipe; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link
        href={`/cookbook/${recipe.slug}`}
        className="block group h-full"
      >
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
            <div className="flex items-center gap-1 text-xs text-secondary/60">
              <Clock size={12} />
              <span>{recipe.frontmatter.readingTime}</span>
            </div>
            <ArrowRight 
              size={14} 
              className="text-secondary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" 
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}