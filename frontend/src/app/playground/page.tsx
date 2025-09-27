"use client"

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { UploadDropzone } from '@/components/upload-dropzone';
import { SpecLegend } from '@/components/spec-legend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const PlaygroundPage = () => {
  const t = useTranslations('PlaygroundPage');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null); // Заглушка для результата ИИ

  const handleFilesAccepted = useCallback((files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      // Здесь будет логика для отправки файла на сервер и получения результата ИИ
      // Для демонстрации, просто покажем заглушку обработанного изображения
      setProcessedImage("/uploads/processed_plan_placeholder.png"); // Замените на реальный путь
    }
  }, []);

  const legendItems = [
    { label: t('legendWallOuter'), color: '#111214', type: 'line' },
    { label: t('legendWallInner'), color: '#2E3137', type: 'line' },
    { label: t('legendDoor'), color: '#C9CED6', type: 'box' },
    { label: t('legendWindow'), color: '#F5F5F5', type: 'box' },
    { label: t('legendFurniture'), color: '#888888', type: 'box' },
  ];

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-lg text-center text-muted-foreground mb-12">{t('subtitle')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Секция загрузки */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold mb-4">{t('uploadSectionTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadDropzone onFilesAccepted={handleFilesAccepted} className="mb-6" />
            {uploadedFile && (
              <p className="text-muted-foreground">{t('uploadedFile')}: {uploadedFile.name}</p>
            )}
          </CardContent>
        </Card>

        {/* Секция результатов ИИ */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold mb-4">{t('resultsSectionTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {processedImage ? (
              <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src={processedImage} alt="Processed Plan" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <p>{t('noResultsMessage')}</p>
              </div>
            )}
            <div className="mt-8">
              <SpecLegend items={legendItems} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaygroundPage;
