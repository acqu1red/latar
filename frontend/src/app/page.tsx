import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center">
      <section className="relative z-10 w-full overflow-hidden bg-background py-20 md:py-32 lg:py-48">
        <div className="container flex flex-col items-center gap-12 text-center lg:flex-row lg:text-left">
          <div className="flex flex-col items-center gap-6 lg:items-start lg:w-1/2">
            <h1 className="text-display-3xl font-extrabold tracking-tight text-foreground sm:text-display-4xl lg:text-display-5xl">
              ИИ превращает ваш черновой план в <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">чистый 2D-чертёж</span> за минуты
            </h1>
            <p className="text-lead text-gray-700 max-w-2xl">
              Загрузите фото/скан. Мы перерисуем аккуратный 2D-план: чистый белый фон, толстые внешние и тоньше внутренние стены, корректные двери/окна, понятные подписи площадей
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-lg px-8 py-3 rounded-xl bg-action hover:opacity-90 transition-opacity">
                <Link href="/upload">Загрузить план</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-3 rounded-xl ring-1 ring-gray-300 hover:bg-gray-100 transition-colors">
                <Link href="/gallery">Посмотреть примеры</Link>
              </Button>
            </div>
          </div>

          {/* 3D-модель (заглушка) */}
          <div className="relative hidden h-[400px] w-full lg:flex lg:w-1/2 items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 animate-spin rounded-full border-4 border-gray-200 border-t-gray-500"></div>
            </div>
            <span className="relative z-10 text-xl font-medium text-gray-700">3D-модель здесь</span>
          </div>
        </div>
      </section>
      {/* Здесь будут другие секции */}
    </main>
  );
}
