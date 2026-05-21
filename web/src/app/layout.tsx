import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unuko ToolKit — Entorno de Desarrollo y Pruebas eSIM 5G",
  description: "Despliega servidores SM-DP+ (osmo-smdpp) de prueba, aprovisiona perfiles eSIM en cores 5G reales (Open5GS) y simula el hardware eUICC (UERANSIM) en segundos mediante el CLI de unuko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-300">
        {children}
      </body>
    </html>
  );
}
