"use client"

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { UploadDropzone } from '@/components/upload-dropzone';
import { SpecLegend } from '@/components/spec-legend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { generatePlanFromImage } from '@/lib/ai'; // Импортируем реальную функцию API

const PlaygroundPage = () => {
  const t = useTranslations('PlaygroundPage');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<any | null>(null);
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
      setError(t('noFileSelectedError'));
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
  }, [uploadedFile, t]);

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
            <UploadDropzone onFilesAccepted={handleFilesAccepted} className="mb-6" disabled={isLoading} />
            {uploadedFile && (
              <p className="text-muted-foreground mb-4">{t('uploadedFile')}: {uploadedFile.name}</p>
            )}
            <Button onClick={handleGeneratePlan} disabled={!uploadedFile || isLoading} className="w-full">
              {isLoading ? t('generating') : t('generatePlanButton')}
            </Button>
            {error && (
              <p className="text-destructive text-sm mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Секция результатов ИИ */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold mb-4">{t('resultsSectionTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-primary-foreground animate-pulse">
                <p>{t('processing')}</p>
              </div>
            ) : processedImageUrl ? (
              <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src={processedImageUrl} alt="Processed Plan" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <p>{t('noResultsMessage')}</p>
              </div>
            )}
            {planDetails && (
              <div className="mt-8 space-y-2 text-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('planDetailsTitle')}</h3>
                <p>{t('planDetailsOuterWalls')}: {planDetails.wallOuter}</p>
                <p>{t('planDetailsInnerWalls')}: {planDetails.wallInner}</p>
                <p>{t('planDetailsDoors')}: {planDetails.doors}</p>
                <p>{t('planDetailsWindows')}: {planDetails.windows}</p>
                <p>{t('planDetailsFurniture')}: {planDetails.furnitureItems}</p>
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
