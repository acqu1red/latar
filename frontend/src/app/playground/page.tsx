"use client"

import React, { useState, useCallback } from 'react';

export const dynamic = 'force-dynamic';
// import { useTranslations } from 'next-intl';
import { UploadDropzone } from '@/components/upload-dropzone';
import { SpecLegend } from '@/components/spec-legend';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { generatePlanFromImage } from '@/lib/ai'; // Импортируем реальную функцию API

const PlaygroundPage = () => {
  // const t = useTranslations('PlaygroundPage');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAccepted = useCallback((files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setProcessedImageUrl(null);
      setPlanDetails(null);
      setError(null);
    }
  }, []);

  const handleGeneratePlan = useCallback(async () => {
    if (!uploadedFile) {
      setError('Файл не выбран');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImageUrl(null);
    setPlanDetails(null);

    const result = await generatePlanFromImage(uploadedFile);

    if (result.data) {
      setProcessedImageUrl(result.data.imageUrl);
      setPlanDetails(result.data.details);
    } else if (result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }, [uploadedFile]);

  const legendItems = [
    { label: 'Внешние стены', color: '#111214', type: 'line' as const },
    { label: 'Внутренние стены', color: '#2E3137', type: 'line' as const },
    { label: 'Двери', color: '#C9CED6', type: 'box' as const },
    { label: 'Окна', color: '#F5F5F5', type: 'box' as const },
    { label: 'Мебель', color: '#888888', type: 'box' as const },
  ];

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">Песочница</h1>
      <p className="text-lg text-center text-gray-600 mb-12">Попробуйте загрузить свой план и посмотрите, как работает ИИ</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Секция загрузки */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">Загрузка файла</h2>
          </div>
          <div>
            <UploadDropzone onFilesAccepted={handleFilesAccepted} className="mb-6" disabled={isLoading} />
            {uploadedFile && (
              <p className="text-gray-600 mb-4">Загруженный файл: {uploadedFile.name}</p>
            )}
            <Button onClick={handleGeneratePlan} disabled={!uploadedFile || isLoading} className="w-full">
              {isLoading ? 'Генерация...' : 'Сгенерировать план'}
            </Button>
            {error && (
              <p className="text-red-500 text-sm mt-4">{error}</p>
            )}
          </div>
        </div>

        {/* Секция результатов ИИ */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">Результаты ИИ</h2>
          </div>
          <div>
            {isLoading ? (
              <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-primary-foreground animate-pulse">
                <p>Обработка...</p>
              </div>
            ) : processedImageUrl ? (
              <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src={processedImageUrl} alt="Processed Plan" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <p>Нет результатов</p>
              </div>
            )}
            {planDetails && (
              <div className="mt-8 space-y-2 text-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground mb-2">Детали плана</h3>
                <p>Внешние стены: {planDetails.wallOuter}</p>
                <p>Внутренние стены: {planDetails.wallInner}</p>
                <p>Двери: {planDetails.doors}</p>
                <p>Окна: {planDetails.windows}</p>
                <p>Мебель: {planDetails.furnitureItems}</p>
              </div>
            )}
            <div className="mt-8">
              <SpecLegend items={legendItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;
