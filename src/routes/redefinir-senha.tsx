import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  FormEvent,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  redefinirSenha,
} from "@/lib/api/password-reset.functions";

export const Route = createFileRoute(
  "/redefinir-senha",
)({
  validateSearch: (
    search: Record<string, unknown>,
  ) => ({
    token:
      typeof search.token === "string"
        ? search.token
        : "",
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const { token } = Route.useSearch();
  const redefinir = useServerFn(
    redefinirSenha,
  );

  const [processando, setProcessando] =
    useState(false);
  const [mensagem, setMensagem] =
    useState("");
  const [erro, setErro] =
    useState("");
  const [concluido, setConcluido] =
    useState(false);

  async function enviar(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setProcessando(true);
    setMensagem("");
    setErro("");

    const formData =
      new FormData(event.currentTarget);

    try {
      const resultado = await redefinir({
        data: {
          token,
          senha: String(
            formData.get("senha") ?? "",
          ),
          confirmarSenha: String(
            formData.get("confirmarSenha") ?? "",
          ),
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      setConcluido(true);
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível redefinir a senha. Confira os dados e tente novamente.",
      );
    } finally {
      setProcessando(false);
    }
  }

  const tokenAusente = !token;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          Redefinir senha
        </h1>

        {tokenAusente ? (
          <>
            <p
              className="mt-4 text-sm text-red-500"
              role="alert"
            >
              O link de redefinição está incompleto
              ou inválido.
            </p>

            <Button
              asChild
              className="mt-6 w-full"
            >
              <Link to="/esqueci-senha">
                Solicitar novo link
              </Link>
            </Button>
          </>
        ) : concluido ? (
          <>
            <p
              className="mt-4 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground"
              role="status"
            >
              {mensagem}
            </p>

            <Button
              asChild
              className="mt-6 w-full"
            >
              <Link to="/login"
            search={{}}>
                Ir para o login
              </Link>
            </Button>
          </>
        ) : (
          <form
            onSubmit={enviar}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-medium"
              >
                Nova senha
              </label>

              <Input
                id="senha"
                name="senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="mb-2 block text-sm font-medium"
              >
                Confirmar nova senha
              </label>

              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </div>

            {erro && (
              <p
                className="text-sm text-red-500"
                role="alert"
              >
                {erro}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={processando}
            >
              {processando
                ? "Redefinindo..."
                : "Redefinir senha"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            search={{}}
            className="text-muted-foreground hover:text-foreground"
          >
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
