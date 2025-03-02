import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";

// Use Inter font instead of Geist until you install the package
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoEats - Reduce Food Waste with AI",
  description: "Create delicious recipes with ingredients you already have",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
