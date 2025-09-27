import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-100 py-12 md:py-16">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <Link href="/" className="text-2xl font-bold text-foreground">
            FlatMap AI
          </Link>
          <p className="mt-4 text-gray-700 max-w-sm">
            ИИ превращает ваш черновой план в чистый 2D-чертёж за минуты. Точные, детализированные архитектурные чертежи с безупречным качеством.
          </p>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">Навигация</h3>
          <ul className="space-y-2">
            <li><Link href="/gallery" className="text-gray-700 hover:text-foreground">Галерея</Link></li>
            <li><Link href="/process" className="text-gray-700 hover:text-foreground">Процесс</Link></li>
            <li><Link href="/pricing" className="text-gray-700 hover:text-foreground">Цены</Link></li>
            <li><Link href="/blog" className="text-gray-700 hover:text-foreground">Блог</Link></li>
            <li><Link href="/about" className="text-gray-700 hover:text-foreground">О сервисе</Link></li>
            <li><Link href="/contact" className="text-gray-700 hover:text-foreground">Контакты</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">Юридическая информация</h3>
          <ul className="space-y-2">
            <li><Link href="/terms" className="text-gray-700 hover:text-foreground">Условия использования</Link></li>
            <li><Link href="/privacy" className="text-gray-700 hover:text-foreground">Политика конфиденциальности</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">Следите за нами</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-700 hover:text-foreground">GitHub</Link></li>
            <li><Link href="#" className="text-gray-700 hover:text-foreground">Twitter</Link></li>
            <li><Link href="#" className="text-gray-700 hover:text-foreground">LinkedIn</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
        <p className="text-sm text-gray-500">&copy; {currentYear} FlatMap AI. Все права защищены.</p>
        {/* <LocaleSwitcher /> */}
        {/* <ThemeToggle /> */}
      </div>
    </footer>
  );
};

export default Footer;
