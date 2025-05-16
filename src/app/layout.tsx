import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from GeistSans to Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Using Inter font. The CSS variable is kept as '--font-geist-sans'
// to maintain consistency if other CSS relies on this specific variable name.
const interFont = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Added for better font loading behavior
});

export const metadata: Metadata = {
  title: 'Day Weaver',
  description: 'Plan your day with calm and focus.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font's className to the html tag.
    // This class defines the CSS variable (--font-geist-sans) and applies the font.
    <html lang="en" className={interFont.className}>
      <body className="font-sans antialiased"> {/* Tailwind's font-sans. Will use Inter if html styles apply it. */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
