import type { Metadata } from 'next';

interface SeoProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export function constructMetadata({
  title = "FlatMap AI - AI-powered 2D apartment plans from photos/scans",
  description = "ИИ превращает ваш черновой план в чистый 2D-чертёж за минуты. Загрузите фото/скан. Мы перерисуем аккуратный 2D-план: чистый белый фон, толстые внешние и тоньше внутренние стены, корректные двери/окна, понятные подписи площадей.",
  url = "https://localhost:3000",
  image = "/og-image.png", // Замените на реальное изображение OpenGraph
}: SeoProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "FlatMap AI",
      images: [{
        url: image,
        alt: title,
      }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@FlatMapAI", // Замените на ваш Twitter Handle
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
      languages: {
        'en': '/en',
        'ru': '/ru',
        'x-default': '/en',
      },
    },
  };
}

// Пример использования: (может быть в layout.tsx или page.tsx)
/*
export const metadata: Metadata = constructMetadata({
  title: "Custom Title",
  description: "Custom Description",
});
*/
