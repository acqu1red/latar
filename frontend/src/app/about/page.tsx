"use client"

import React from 'react';

export const dynamic = 'force-dynamic';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const AboutPage = () => {
  const t = useTranslations('AboutPage');

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-lg text-center text-muted-foreground mb-12">{t('subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-foreground">{t('section1Title')}</h2>
          <p className="text-muted-foreground">{t('section1Paragraph1')}</p>
          <p className="text-muted-foreground">{t('section1Paragraph2')}</p>
        </div>
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
          <Image src="/uploads/about_image_1.png" alt="About us 1" layout="fill" objectFit="cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-20">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg order-2 md:order-1">
          <Image src="/uploads/about_image_2.png" alt="About us 2" layout="fill" objectFit="cover" />
        </div>
        <div className="space-y-6 order-1 md:order-2">
          <h2 className="text-3xl font-semibold text-foreground">{t('section2Title')}</h2>
          <p className="text-muted-foreground">{t('section2Paragraph1')}</p>
          <p className="text-muted-foreground">{t('section2Paragraph2')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
