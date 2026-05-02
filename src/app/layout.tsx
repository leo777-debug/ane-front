import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANE.ai — Audience Network Emulator',
  description: 'Simulate how real audiences react to your content using AI agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
