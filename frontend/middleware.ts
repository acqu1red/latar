import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported in this application
  locales: ['en', 'ru'],

  // Used when no locale matches
  defaultLocale: 'ru',
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(ru|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
