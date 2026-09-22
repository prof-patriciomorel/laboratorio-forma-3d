import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morfo Lab",
  description: "Laboratorio espacial de composición morfológica",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
