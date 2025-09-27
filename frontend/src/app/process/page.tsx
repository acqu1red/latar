"use client"

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProcessPage = () => {
  const t = useTranslations('ProcessPage');

  const steps = [
    {
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      title: t('step4Title'),
      description: t('step4Description'),
    },
  ];

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-lg text-center text-muted-foreground mb-12">{t('subtitle')}</p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={index} className="flex flex-col items-center text-center p-6">
            <CardHeader>
              <div className="text-4xl font-extrabold text-primary mb-4">{index + 1}</div>
              <CardTitle className="text-xl font-semibold mb-2">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {step.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProcessPage;
