import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PISAC - Centro de Comando de Resiliência Municipal",
  description:
    "Plataforma Integrada de Situação e Análise de Crises para gestão de resiliência urbana no Distrito Federal. Desenvolvido na Universidade de Brasília (UnB).",
  keywords: ["resiliência urbana", "gestão de crises", "GovTech", "Brasília", "Distrito Federal"],
  authors: [{ name: "UnB - Universidade de Brasília" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#f97316" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="antialiased">
        {/* Skip to main content - e-MAG accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Ir para conteúdo principal
        </a>
        {children}
      </body>
    </html>
  );
}
