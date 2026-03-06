import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PISAC - Centro de Comando de Resiliência Municipal",
  description:
    "Plataforma Integrada de Situação e Análise de Crises para gestão de resiliência urbana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
