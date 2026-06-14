import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { cadastrarCliente } from "../lib/api/auth.functions";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  const cadastrar = useServerFn(cadastrarCliente);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCarregando(true);
    setMensagem("");
    setSucesso(false);

    const formulario = event.currentTarget;
    const formData = new FormData(formulario);

    try {
      const resultado = await cadastrar({
        data: {
          nome: String(formData.get("nome") ?? ""),
          email: String(formData.get("email") ?? ""),
          telefone: String(formData.get("telefone") ?? ""),
          senha: String(formData.get("senha") ?? ""),
        },
      });

      setMensagem(resultado.mensagem);
      setSucesso(resultado.sucesso);

      if (resultado.sucesso) {
        formulario.reset();
      }
    } catch (error) {
      console.error(error);
      setMensagem("Não foi possível realizar o cadastro.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Criar conta</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre-se para agendar seus atendimentos.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nome" className="text-sm font-medium">
              Nome
            </label>

            <input
              id="nome"
              name="nome"
              type="text"
              required
              minLength={3}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="telefone" className="text-sm font-medium">
              Telefone
            </label>

            <input
              id="telefone"
              name="telefone"
              type="tel"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>

            <input
              id="senha"
              name="senha"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          {mensagem && (
            <p
              className={
                sucesso
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
          >
            {carregando ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Já possui uma conta?{" "}
          <Link
          to ="/login"
          search = {{ redirect: undefined}}
          className="font-medium underline">
            Entrar na minha conta
          </Link>
        </p>
      </section>
    </main>
  );
}