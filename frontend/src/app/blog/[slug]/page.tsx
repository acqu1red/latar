import React from 'react';
import { useTranslations } from 'next-intl';

interface BlogPostPageProps {
  params: { slug: string };
}

const BlogPostPage = ({ params }: BlogPostPageProps) => {
  const t = useTranslations('BlogPostPage');
  const { slug } = params;

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold mb-4">{t('title')} "{slug}"</h1>
      <p className="text-lg text-muted-foreground">{t('description')}</p>
      {/* Здесь будет контент статьи блога, возможно, из MDX */}
      <div className="mt-8 p-6 bg-card rounded-lg shadow-sm">
        <p>{t('placeholderContent')}</p>
      </div>
    </div>
  );
};

export default BlogPostPage;
