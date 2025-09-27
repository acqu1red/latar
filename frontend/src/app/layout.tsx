import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import Header from "@/components/header"; // Импорт Header
import Footer from "@/components/footer"; // Импорт Footer

const fontSans = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FlatMap AI - Автогенерация 2D-планов квартир из фото/сканов через ИИ",
  description: "ИИ превращает ваш черновой план в чистый 2D-чертёж за минуты. Загрузите фото/скан. Мы перерисуем аккуратный 2D-план: чистый белый фон, толстые внешние и тоньше внутренние стены, корректные двери/окна, понятные подписи площадей.",
};

export default function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode; 
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Header /> {/* Используем Header */}
          {children}
          <Footer /> {/* Используем Footer */}
        </ThemeProvider>
      </body>
    </html>
  );
}
