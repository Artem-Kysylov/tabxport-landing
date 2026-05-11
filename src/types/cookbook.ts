export interface CookbookFrontmatter {
  title: string;
  description: string;
  category: string;
  date: string;
  keywords: string[];
  readingTime?: string;
  featured?: boolean;
}

export interface CookbookRecipe {
  slug: string;
  frontmatter: CookbookFrontmatter;
  content: string;
}

export interface CookbookTableOfContents {
  id: string;
  title: string;
  level: number;
}