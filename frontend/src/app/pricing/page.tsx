import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PricingPage = () => {
  const t = useTranslations('PricingPage');

  return (
    <div className="container py-20 text-center">
      <h1 className="text-5xl font-extrabold text-foreground mb-4">{t('title')}</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {t('subtitle')}
      </p>
      <Button asChild size="lg" className="text-lg px-8 py-3 rounded-xl bg-primary hover:opacity-90 transition-opacity">
        <Link href="/register">{t('ctaButton')}</Link>
      </Button>
    </div>
  );
};

export default PricingPage;
