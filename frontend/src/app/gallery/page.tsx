"use client"

import React from 'react';

export const dynamic = 'force-dynamic';
// import { useTranslations } from 'next-intl';
import { BeforeAfterSlider } from '@/components/before-after-slider';

const GalleryPage = () => {
  // const t = useTranslations('GalleryPage');

  const galleryItems = [
    {
      before: "/uploads/gallery_before_1.png",
      after: "/uploads/gallery_after_1.png",
      alt: "Before and after 1"
    },
    {
      before: "/uploads/gallery_before_2.png",
      after: "/uploads/gallery_after_2.png",
      alt: "Before and after 2"
    },
    {
      before: "/uploads/gallery_before_3.png",
      after: "/uploads/gallery_after_3.png",
      alt: "Before and after 3"
    }
  ];

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">Галерея</h1>
      <p className="text-lg text-center text-gray-600 mb-12">Примеры работ: до и после обработки</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleryItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-4">{item.alt}</h3>
            <BeforeAfterSlider beforeImg={item.before} afterImg={item.after} width={400} height={300} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
