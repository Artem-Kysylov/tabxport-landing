import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature Requests | TableXport',
  description:
    'Vote on upcoming TableXport features and share ideas to shape the roadmap for AI table export and data workflow tools.',
  openGraph: {
    title: 'Feature Requests | TableXport',
    description:
      'Vote on upcoming TableXport features and share ideas to shape the roadmap for AI table export and data workflow tools.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tablexport.com/features',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
