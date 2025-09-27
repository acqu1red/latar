"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { BeforeAfterSlider } from '@/components/before-after-slider';
import { motion } from 'framer-motion';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center overflow-hidden">
      <section className="relative z-10 w-full overflow-hidden bg-background py-20 md:py-32 lg:py-48">
        <div className="container flex flex-col items-center gap-12 text-center lg:flex-row lg:text-left">
          <div className="flex flex-col items-center gap-6 lg:items-start lg:w-1/2">
            <h1 className="text-display-3xl font-extrabold tracking-tight text-foreground sm:text-display-4xl lg:text-display-5xl">
              {t('heroTitle').split(' ').map((word, index) => (
                word === 'чистый' ? (
                  <span key={index} className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"> {word}</span>
                ) : (
                  <span key={index}> {word}</span>
                )
              ))}
            </h1>
            <p className="text-lead text-muted-foreground max-w-2xl">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-lg px-8 py-3 rounded-xl bg-primary hover:opacity-90 transition-opacity">
                <Link href="/upload">{t('ctaButton1')}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-3 rounded-xl ring-1 ring-border hover:bg-muted transition-colors">
                <Link href="/gallery">{t('ctaButton2')}</Link>
              </Button>
            </div>
          </div>

          {/* 3D-модель (сложная анимация) */}
          <div className="relative hidden h-[400px] w-full lg:flex lg:w-1/2 items-center justify-center [perspective:1000px]">
            <motion.div
              className="room-builder-3d relative w-full h-full flex items-center justify-center"
              initial={{ rotateY: 20, rotateX: 10, scale: 0.8, opacity: 0 }}
              animate={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {/* Пол */}
              <motion.div
                className="room-floor absolute bg-gray-300 transform -rotate-x-90 origin-top opacity-0"
                initial={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                style={{ width: '500px', height: '500px', transformOrigin: 'center center', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Сетка на полу */}
              <motion.div
                className="room-grid absolute w-[500px] h-[500px] transform -rotate-x-90 origin-top border border-gray-400 opacity-0"
                initial={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                style={{ backgroundSize: '50px 50px', backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Задняя стена */}
              <motion.div
                className="room-wall-back absolute w-[500px] h-[300px] bg-gray-200 transform translate-z-[-250px] opacity-0"
                initial={{ opacity: 0, translateY: 150, rotateX: -90 }}
                animate={{ opacity: 1, translateY: 0, rotateX: 0 }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                style={{ transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Левая стена */}
              <motion.div
                className="room-wall-left absolute w-[300px] h-[500px] bg-gray-100 transform rotate-y-90 translate-x-[-250px] opacity-0"
                initial={{ opacity: 0, translateX: -150, rotateY: 90 }}
                animate={{ opacity: 1, translateX: 0, rotateY: 0 }}
                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Правая стена */}
              <motion.div
                className="room-wall-right absolute w-[300px] h-[500px] bg-gray-100 transform -rotate-y-90 translate-x-[250px] opacity-0"
                initial={{ opacity: 0, translateX: 150, rotateY: -90 }}
                animate={{ opacity: 1, translateX: 0, rotateY: 0 }}
                transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
                style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Детальные линии (пример) */}
              <motion.div
                className="room-detail-line absolute bg-blue-500 h-1 w-20 opacity-0"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 2, duration: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: 'left', left: '30%', top: '40%', transform: 'translateZ(100px)', transformStyle: 'preserve-3d' }}
              ></motion.div>
              <motion.div
                className="room-detail-line absolute bg-blue-500 h-1 w-20 opacity-0"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 2.2, duration: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: 'left', left: '35%', top: '50%', transform: 'translateZ(100px) rotateY(90deg)', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Заглушки мебели */}
              <motion.div
                className="room-furniture-placeholder absolute w-24 h-24 bg-gray-500 opacity-0 rounded-md"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.6, ease: "easeOut" }}
                style={{ left: '20%', bottom: '20%', transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}
              ></motion.div>
              <motion.div
                className="room-furniture-placeholder absolute w-32 h-16 bg-gray-600 opacity-0 rounded-md"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.7, duration: 0.6, ease: "easeOut" }}
                style={{ right: '20%', bottom: '25%', transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}
              ></motion.div>

              {/* Эффект свечения */}
              <motion.div
                className="room-glow-effect absolute w-full h-full bg-blue-400 opacity-0 blur-xl rounded-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.4, scale: 1.2 }}
                transition={{ delay: 3, duration: 1.5, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
                style={{ transformStyle: 'preserve-3d' }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Секция Before/After Slider */}
      <section className="container py-20">
        <h2 className="text-4xl font-bold text-center mb-12">{t('beforeAfterSectionTitle')}</h2>
        <div className="flex justify-center">
          <BeforeAfterSlider
            beforeImg="/uploads/temp_plan_before.png" // Замените на реальные пути
            afterImg="/uploads/temp_plan_after.png"  // Замените на реальные пути
            width={800}
            height={500}
          />
        </div>
      </section>

      {/* Здесь будут другие секции */}
    </main>
  );
}
