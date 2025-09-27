import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle'; // Импортируем ThemeToggle
// import { LocaleSwitcher } from './locale-switcher'; // Импортируем LocaleSwitcher

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            FlatMap AI
          </Link>
          {/* Навигационные ссылки будут здесь */}
        </div>
        <nav className="flex items-center space-x-4">
          {/* <LocaleSwitcher /> Добавляем LocaleSwitcher сюда */}
          <ThemeToggle /> {/* Добавляем ThemeToggle сюда */}
          {/* CTA кнопки будут здесь */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
