import React from 'react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: 'example-post-1' },
    { slug: 'example-post-2' },
    { slug: 'example-post-3' },
  ];
}

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { slug } = await params;

  return (
    <div className="container py-20">
        <h1 className="text-4xl font-bold mb-4">Статья блога &quot;{slug}&quot;</h1>
      <p className="text-lg text-gray-600">Здесь будет контент статьи блога</p>
      {/* Здесь будет контент статьи блога, возможно, из MDX */}
      <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-sm">
        <p>Контент статьи будет здесь...</p>
      </div>
    </div>
  );
};

export default BlogPostPage;
