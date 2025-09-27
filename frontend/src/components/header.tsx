import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            FlatMap AI
          </Link>
          {/* Навигационные ссылки будут здесь */}
        </div>
        <nav className="flex items-center space-x-4">
          {/* CTA кнопки и переключатель темы будут здесь */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
