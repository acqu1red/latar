import React from 'react';
// import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PricingPage = () => {
  // const t = useTranslations('PricingPage');

  return (
    <div className="container py-20 text-center">
      <h1 className="text-5xl font-extrabold text-foreground mb-4">Тарифы</h1>
      <p className="text-xl text-gray-600 mb-8">
        Сервис бесплатен для авторизованных пользователей
      </p>
      <Button asChild size="lg" className="text-lg px-8 py-3 rounded-xl bg-primary hover:opacity-90 transition-opacity">
        <Link href="/register">Зарегистрироваться</Link>
      </Button>
    </div>
  );
};

export default PricingPage;
