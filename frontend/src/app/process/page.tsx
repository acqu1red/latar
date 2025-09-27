"use client"

import React from 'react';

export const dynamic = 'force-dynamic';
// import { useTranslations } from 'next-intl';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProcessPage = () => {
  // const t = useTranslations('ProcessPage');

  const steps = [
    {
      title: 'Загрузка файла',
      description: 'Загрузите фото или скан вашего плана в формате JPG, PNG или PDF',
    },
    {
      title: 'Анализ ИИ',
      description: 'Наш ИИ анализирует изображение и распознает стены, двери, окна и мебель',
    },
    {
      title: 'Обработка',
      description: 'Создается чистый 2D-чертеж с правильными размерами и подписями',
    },
    {
      title: 'Готовый результат',
      description: 'Получите аккуратный план в высоком качестве для дальнейшего использования',
    },
  ];

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">Как это работает</h1>
      <p className="text-lg text-center text-gray-600 mb-12">Простой процесс создания 2D-планов из ваших фотографий</p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm">
            <div className="mb-4">
              <div className="text-4xl font-extrabold text-primary mb-4">{index + 1}</div>
              <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
            </div>
            <div className="text-gray-600">
              {step.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessPage;
