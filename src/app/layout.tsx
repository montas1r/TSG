
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { ErrorBoundary } from "@/components/error-boundary";

if (process.env.NODE_ENV === 'development') {
  const renderCounts = new Map<string, number>();
  let resetInterval: NodeJS.Timeout | null = null;

  const startRenderTracking = () => {
    if (resetInterval) clearInterval(resetInterval);
    resetInterval = setInterval(() => renderCounts.clear(), 1000);

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      try {
        const stack = new Error().stack;
        if (stack) {
          const componentNameMatch = stack.match(/at\s+([A-Z][a-zA-Z]+)\s+\(/);
          const componentName = componentNameMatch ? componentNameMatch[1] : 'Unknown';
          
          if (componentName !== 'Unknown' && componentName !== 'ErrorBoundary') {
            const count = (renderCounts.get(componentName) || 0) + 1;
            renderCounts.set(componentName, count);

            if (count > 50) {
              console.warn(`🔴 INFINITE LOOP WARNING: ${componentName} rendered ${count} times in 1 second`);
              // debugger; // Uncomment to automatically pause execution in dev tools
            }
          }
        }
      } catch (e) {
        // Silently fail if stack parsing fails
      }
      originalConsoleError.apply(console, args);
    };
  };

  startRenderTracking();
}


const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['700', '800'],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Skill Garden - Grow Your Skills",
  description: "Nurture your skills and watch them grow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <body className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable} font-body antialiased overflow-hidden`}>
        <ErrorBoundary>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
