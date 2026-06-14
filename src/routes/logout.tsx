import { useEffect, useRef, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sair } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  const executarLogout = useServerFn(sair);

  const logoutIniciado = useRef(false);
  const [erro, setErro] = useState("");

  async function encerrarSessao() {
    setErro("");

    try {
      await executarLogout();

      /*
       * Recarregamos completamente a aplicação.
       * Dessa forma, o contexto global será executado novamente
       * e reconhecerá que não existe mais uma sessão.
       */
      window.location.replace("/");
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível encerrar a sessão. Tente novamente.",
      );
    }
  }

  useEffect(() => {
    /*
     * Evita que o logout seja executado duas vezes
     * durante verificações do React em desenvolvimento.
     */
    if (logoutIniciado.current) {
      return;
    }

    logoutIniciado.current = true;

    void encerrarSessao();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-premium">
        {!erro ? (
          <>
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-gold" />

            <h1 className="mt-5 text-xl font-display">
              Encerrando sessão
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Aguarde enquanto desconectamos sua conta com segurança.
            </p>
          </>
        ) : (
          <>
            <LogOut className="mx-auto h-8 w-8 text-destructive" />

            <h1 className="mt-5 text-xl font-display">
              Não foi possível sair
            </h1>

            <p
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {erro}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => {
                  logoutIniciado.current = true;
                  void encerrarSessao();
                }}
              >
                Tentar novamente
              </Button>

              <Button
                asChild
                variant="outline"
              >
                <Link to="/">
                  Voltar para a página inicial
                </Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}