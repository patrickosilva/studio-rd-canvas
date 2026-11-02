import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalDocumentPage({
  titulo,
  versao,
  children,
}: {
  titulo: string;
  versao: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-10">
        <div className="border-b border-border pb-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao Studio RD
          </Link>

          <h1 className="mt-5 text-3xl font-display">{titulo}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Versão {versao}
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_h3]:font-medium [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
          <Link to="/termos" className="hover:text-gold">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-gold">
            Privacidade
          </Link>
          <Link to="/cookies" className="hover:text-gold">
            Cookies
          </Link>
        </div>
      </article>
    </main>
  );
}
