import type { Config } from "tailwindcss"

const config = {
  darkMode: "class", // Light по умолчанию
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "2rem",
        xl: "3rem", // Соответствует px-12 (3rem * 2 = 6rem, 1280 - 6rem)
      },
      screens: {
        "2xl": "1280px", // Максимальная ширина контейнера
      },
    },
    extend: {
      colors: {
        // Shadcn/ui цвета (используем HSL-переменные)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Кастомные цвета для дизайн-системы (будут использоваться напрямую)
        'custom-background': "#FFFFFF",
        'custom-foreground': "#111214",
        'custom-gray-100': "#F5F5F5",
        'custom-gray-200': "#EDEFF2",
        'custom-gray-300': "#D9D9D9",
        'custom-gray-500': "#C9CED6",
        'custom-gray-700': "#2E3137",
        'custom-gray-800': "#222429",
        'custom-gray-900': "#111214",
        'custom-action': "#111214",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem", // Для карточек
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scroll-reveal": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Добавляем keyframes для Framer Motion, если потребуется
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scroll-reveal": "scroll-reveal 0.6s ease-out forwards", // Пример использования
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"], // Основной шрифт
        display: ["Roboto", "sans-serif"], // Для крупных заголовков, если потребуется другой
      },
      fontSize: {
        // Scale: 80/90/112%
        "display-3xl": ["4.5rem", { lineHeight: "1.0" }], // Пример
        "display-xl": ["3rem", { lineHeight: "1.1" }], // Пример
        "h1": ["2.5rem", { lineHeight: "1.2" }],
        "h2": ["2rem", { lineHeight: "1.3" }],
        "h3": ["1.75rem", { lineHeight: "1.4" }],
        "h4": ["1.5rem", { lineHeight: "1.5" }],
        "lead": ["1.25rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.7" }],
        "small": ["0.875rem", { lineHeight: "1.8" }],
      },
      lineHeight: {
        "tight": "1.2",
        "normal": "1.5",
        "relaxed": "1.7",
        "loose": "2",
      },
      spacing: {
        "16": "4rem",
        "24": "6rem",
        "28": "7rem",
        "40": "10rem",
        "56": "14rem",
      }, // Для секций py-16 md:py-24 xl:py-28
    },
  },
  plugins: [require("tailwindcss-animate")], // Возвращаем require
} satisfies Config

export default config
