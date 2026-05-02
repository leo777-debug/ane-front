import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANE.ai — Audience Network Emulator',
  description: 'Simulate how real audiences react to your content using AI agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-50 min-h-screen flex flex-col">
        {/* WIP Banner */}
        <div className="bg-indigo-600 text-white text-center py-2 text-sm font-medium">
          🚧 Work in Progress: Many features pending. Your feedback matters! 
          Contact: <a href="mailto:clutchup.ai@gmail.com" className="underline font-bold ml-1">clutchup.ai@gmail.com</a>
        </div>
        
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
          <p>© 2026 ANE.ai — Built for testing and evolution.</p>
        </footer>
      </body>
    </html>
  );
}
