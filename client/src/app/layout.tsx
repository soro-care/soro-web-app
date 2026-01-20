import type { Metadata, Viewport } from 'next';
import './globals.css';
import type { JSX, ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'SORO - Mental Health Support Platform',
  description: 'Your trusted companion for mental wellness',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SORO',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ef4444',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}