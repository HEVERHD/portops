import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortOps — Gestión Portuaria",
  description: "Sistema digital de gestión de operaciones portuarias",
  icons: {
    icon: "/logoPORTOPS.png",
    apple: "/logoPORTOPS.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
