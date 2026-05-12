import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CookbookFrontmatter, CookbookRecipe, CookbookTableOfContents } from '@/types/cookbook';

const cookbookDirectory = path.join(process.cwd(), 'src/content/cookbook');

export function getAllCookbookRecipes(): CookbookRecipe[] {
  if (!fs.existsSync(cookbookDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(cookbookDirectory);
  const recipes = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(cookbookDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        frontmatter: {
          ...data,
          date: data.date || new Date().toISOString().split('T')[0],
          keywords: Array.isArray(data.keywords) ? data.keywords : [],
          readingTime: calculateReadingTime(content),
        } as CookbookFrontmatter,
        content,
      };
    });

  // Sort by date (newest first)
  return recipes.sort((a, b) => 
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export function getCookbookRecipeBySlug(slug: string): CookbookRecipe | null {
  try {
    const fullPath = path.join(cookbookDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      frontmatter: {
        ...data,
        date: data.date || new Date().toISOString().split('T')[0],
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        readingTime: calculateReadingTime(content),
      } as CookbookFrontmatter,
      content,
    };
  } catch (error) {
    console.error('Error reading cookbook recipe:', error);
    return null;
  }
}

export function getFeaturedRecipes(limit: number = 3): CookbookRecipe[] {
  const allRecipes = getAllCookbookRecipes();
  
  // First try to get featured recipes
  const featured = allRecipes.filter(recipe => recipe.frontmatter.featured);
  
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }
  
  // If not enough featured, fill with latest recipes
  const remaining = limit - featured.length;
  const latest = allRecipes.filter(recipe => !recipe.frontmatter.featured).slice(0, remaining);
  
  return [...featured, ...latest];
}

export function getRecipesByCategory(category: string): CookbookRecipe[] {
  const allRecipes = getAllCookbookRecipes();
  return allRecipes.filter(recipe => 
    recipe.frontmatter.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const allRecipes = getAllCookbookRecipes();
  const categories = [...new Set(allRecipes.map(recipe => recipe.frontmatter.category))];
  return categories.sort();
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function generateTableOfContents(content: string): CookbookTableOfContents[] {
  const headings: CookbookTableOfContents[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Standard markdown heading: ## Title
    const mdMatch = line.match(/^(#{2,6})\s+(.+)$/);
    if (mdMatch) {
      const level = mdMatch[1].length;
      const title = mdMatch[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ id, title, level });
      continue;
    }

    // JSX <Step step="N" title="..." /> (quoted step — reliable in MDXRemote)
    const stepMatch = line.match(/<Step\s+step="(\d+)"\s+title="([^"]+)"/);
    if (stepMatch) {
      const stepNum = parseInt(stepMatch[1], 10);
      const title = stepMatch[2];
      headings.push({ id: `step-${stepNum}`, title, level: 2 });
    }
  }

  return headings;
}