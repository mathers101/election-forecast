import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Election Forecast",
    template: "Election Forecast - %s",
  },
  description: "Explore presidential and Senate election forecasts.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen w-full flex-col items-start justify-start gap-5 bg-white py-2 max-sm:gap-4 max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </body>
    </html>
  );
}
