import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  solicitarRedefinicaoSenha,
} from "@/lib/api/password-reset.functions";

export const Route = createFileRoute("/esqueci-senha")({
  component: EsqueciSenhaPage,
});

function EsqueciSenhaPage() {
  const solicitar = useServerFn(
    solicitarRedefinicaoSenha,
  );

  const [processando, setProcessando] =
    useState(false);
  const [mensagem, setMensagem] =
    useState("");
  const [erro, setErro] =
    useState("");

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
      const resultado = await solicitar({
        data: {
          email: String(
            formData.get("email") ?? "",
          ),
        },
      });

      setMensagem(resultado.mensagem);
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível processar a solicitação agora. Tente novamente.",
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">
          Esqueci minha senha
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Informe o e-mail da sua conta. Se ele
          estiver cadastrado, enviaremos um link
          seguro para redefinir sua senha.
        </p>

        <form
          onSubmit={enviar}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              E-mail
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seuemail@exemplo.com"
            />
          </div>

          {mensagem && (
            <p
              className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground"
              role="status"
            >
              {mensagem}
            </p>
          )}

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
              ? "Enviando..."
              : "Enviar link de redefinição"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className="text-muted-foreground hover:text-foreground"
          >
            Voltar para o login
          </Link>
        </div>

        <div className="mt-5 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/termos">
            Termos
          </Link>
          <Link to="/privacidade">
            Privacidade
          </Link>
          <Link to="/cookies">
            Cookies
          </Link>
        </div>
      </section>
    </main>
  );
}
