import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  cadastrarFuncionarioPorConvite,
  obterConviteFuncionario,
} from "@/lib/api/convite-funcionario.functions";

export const Route = createFileRoute("/cadastro-funcionario/$token")({
  component: CadastroFuncionarioPage,
});

type ModoConvite = "NOVA_CONTA" | "CONTA_EXISTENTE";

function CadastroFuncionarioPage() {
  const { token } = Route.useParams();

  const consultar = useServerFn(obterConviteFuncionario);
  const cadastrar = useServerFn(cadastrarFuncionarioPorConvite);

  const [modo, setModo] = useState<ModoConvite>("NOVA_CONTA");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState("");

  const [valido, setValido] = useState<boolean | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const resposta = await consultar({
          data: { token },
        });

        setValido(resposta.valido);
        setMensagem(resposta.valido ? "" : resposta.mensagem);

        if (resposta.valido) {
          setModo(resposta.modo);
          setEmail(resposta.email);
          setNome(resposta.nome);
          setTelefone(resposta.telefone);
          setDescricao(resposta.descricao);
        }
      } catch (error) {
        console.error(error);
        setValido(false);
        setMensagem("Não foi possível validar o convite.");
      }
    })();
  }, [token]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");

    const formData = new FormData(event.currentTarget);

    try {
      const resposta = await cadastrar({
        data: {
          token,
          nome:
            modo === "CONTA_EXISTENTE"
              ? nome
              : String(formData.get("nome") ?? ""),
          telefone,
          descricao,
          senha:
            modo === "NOVA_CONTA"
              ? String(formData.get("senha") ?? "")
              : "",
          aceitarTermos:
            formData.get("aceitarTermos") === "on",
        },
      });

      setMensagem(resposta.mensagem);
      setSucesso(resposta.sucesso);

      if (resposta.sucesso) {
        setValido(false);
      }
    } catch (error) {
      console.error(error);
      setMensagem("Não foi possível concluir a ativação.");
    } finally {
      setCarregando(false);
    }
  }

  const contaExistente = modo === "CONTA_EXISTENTE";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">
          {contaExistente
            ? "Ativar acesso de funcionário"
            : "Cadastro de funcionário"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {contaExistente
            ? "Encontramos sua conta de cliente. Seu e-mail e sua senha atuais serão mantidos."
            : "Crie sua conta operacional do Studio RD."}
        </p>

        {valido === null && (
          <p className="mt-6 text-sm text-muted-foreground">
            Validando convite...
          </p>
        )}

        {valido === false && (
          <div className="mt-6">
            <p
              className={
                sucesso
                  ? "text-sm text-emerald-500"
                  : "text-sm text-destructive"
              }
            >
              {mensagem}
            </p>

            {sucesso && (
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="mt-4 inline-block text-sm font-medium underline"
              >
                Entrar na conta
              </Link>
            )}
          </div>
        )}

        {valido && (
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="text-sm font-medium">
                E-mail
              </label>
              <input
                value={email}
                disabled
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 opacity-70"
              />
            </div>

            {contaExistente ? (
              <div>
                <label className="text-sm font-medium">
                  Nome
                </label>
                <input
                  value={nome}
                  disabled
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 opacity-70"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="nome"
                  className="text-sm font-medium"
                >
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  required
                  minLength={3}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="telefone"
                className="text-sm font-medium"
              >
                Celular
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                value={telefone}
                onChange={(event) =>
                  setTelefone(event.target.value)
                }
                placeholder="(21) 99999-9999"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="text-sm font-medium"
              >
                Descrição profissional
              </label>
              <textarea
                id="descricao"
                name="descricao"
                maxLength={500}
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
                }
                placeholder="Ex.: Especialista em degradê, tesoura e barba."
                className="mt-1 min-h-24 w-full rounded-md border bg-background px-3 py-2"
              />
            </div>

            {!contaExistente && (
              <div>
                <label
                  htmlFor="senha"
                  className="text-sm font-medium"
                >
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
            )}

            {contaExistente && (
              <div className="rounded-md border border-border bg-background/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
                Nenhuma nova senha será criada. Você continuará entrando com a mesma credencial da sua conta atual.
              </div>
            )}

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                name="aceitarTermos"
                type="checkbox"
                required
                className="mt-1 h-4 w-4"
              />
              <span>
                Li e aceito os{" "}
                <Link
                  to="/termos"
                  target="_blank"
                  className="underline"
                >
                  Termos de Uso
                </Link>{" "}
                para utilizar o acesso operacional.
              </span>
            </label>

            {mensagem && (
              <p className="text-sm text-destructive">
                {mensagem}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              {carregando
                ? "Processando..."
                : contaExistente
                  ? "Ativar acesso de funcionário"
                  : "Criar conta de funcionário"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}