import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2D → 3D Converter | AI-Powered 3D Asset Generator",
  description:
    "Transform 2D images into game-ready 3D assets in seconds. Powered by Hunyuan3D AI — upload an image, generate a 3D model, and download as GLB.",
  keywords: ["3D converter", "2D to 3D", "AI 3D generation", "game assets", "GLB", "Hunyuan3D"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
