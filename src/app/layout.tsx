import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ingecol — Gestión Portuaria",
  description: "Sistema digital de gestión de operaciones portuarias — Ingecol S.A.S.",
  icons: {
    icon: "/ingecol.png",
    apple: "/ingecol.png",
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
