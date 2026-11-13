import {
  getRouteApi,
  Link,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  KeyRound,
  Laptop,
  Mail,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

import { GoogleAccountCard } from "@/components/auth/GoogleAuth";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  alterarMeuEmail,
  alterarMinhaSenha,
  atualizarMeuPerfil,
  encerrarMinhaSessao,
  encerrarOutrasSessoes,
  listarMinhasSessoes,
  obterMinhaConta,
} from "@/lib/api/conta.functions";

const rootRoute = getRouteApi("__root__");

type SessaoView = {
  id: string;
  criadoEm: Date | string;
  ultimaAtividadeEm: Date | string;
  expiraEm: Date | string;
  persistente: boolean;
  userAgent: string | null;
  atual: boolean;
};

function traduzirPapel(
  papel?: "CLIENTE" | "FUNCIONARIO" | "DONO",
): string {
  if (papel === "DONO") {
    return "Administrador";
  }

  if (papel === "FUNCIONARIO") {
    return "Barbeiro / Funcionário";
  }

  return "Cliente";
}

function descreverDispositivo(
  userAgent: string | null,
): {
  nome: string;
  tipo: "desktop" | "mobile";
} {
  if (!userAgent) {
    return {
      nome: "Dispositivo não identificado",
      tipo: "desktop",
    };
  }

  const mobile =
    /Android|iPhone|iPad|Mobile/i.test(
      userAgent,
    );

  let navegador = "Navegador";

  if (/Edg\//i.test(userAgent)) {
    navegador = "Microsoft Edge";
  } else if (
    /Chrome\//i.test(userAgent) &&
    !/Edg\//i.test(userAgent)
  ) {
    navegador = "Google Chrome";
  } else if (/Firefox\//i.test(userAgent)) {
    navegador = "Firefox";
  } else if (
    /Safari\//i.test(userAgent) &&
    !/Chrome\//i.test(userAgent)
  ) {
    navegador = "Safari";
  }

  let sistema = "";

  if (/Windows/i.test(userAgent)) {
    sistema = "Windows";
  } else if (/Android/i.test(userAgent)) {
    sistema = "Android";
  } else if (/iPhone|iPad/i.test(userAgent)) {
    sistema = "iOS";
  } else if (/Macintosh|Mac OS/i.test(userAgent)) {
    sistema = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    sistema = "Linux";
  }

  return {
    nome: sistema
      ? `${navegador} · ${sistema}`
      : navegador,
    tipo: mobile ? "mobile" : "desktop",
  };
}

function formatarData(
  valor: Date | string,
): string {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(data);
}

export function MinhaContaPage() {
  const { usuario } = rootRoute.useRouteContext();

  const obterConta = useServerFn(
    obterMinhaConta,
  );
  const atualizarPerfil = useServerFn(
    atualizarMeuPerfil,
  );
  const alterarEmail = useServerFn(
    alterarMeuEmail,
  );
  const alterarSenha = useServerFn(
    alterarMinhaSenha,
  );
  const listarSessoes = useServerFn(
    listarMinhasSessoes,
  );
  const encerrarSessao = useServerFn(
    encerrarMinhaSessao,
  );
  const encerrarOutras = useServerFn(
    encerrarOutrasSessoes,
  );

  const [nome, setNome] = useState(
    usuario?.nome ?? "",
  );
  const [telefone, setTelefone] =
    useState(usuario?.telefone ?? "");
  const [email, setEmail] = useState(
    usuario?.email ?? "",
  );
  const [temSenha, setTemSenha] =
    useState(true);

  const [sessoes, setSessoes] =
    useState<SessaoView[]>([]);

  const [mensagemPerfil, setMensagemPerfil] =
    useState("");
  const [erroPerfil, setErroPerfil] =
    useState("");

  const [mensagemSeguranca, setMensagemSeguranca] =
    useState("");
  const [erroSeguranca, setErroSeguranca] =
    useState("");

  const [processando, setProcessando] =
    useState(false);

  const carregar = useCallback(async () => {
    const [conta, resultadoSessoes] =
      await Promise.all([
        obterConta(),
        listarSessoes(),
      ]);

    if (conta.autenticado) {
      setNome(conta.usuario.nome);
      setTelefone(
        conta.usuario.telefone ?? "",
      );
      setEmail(conta.usuario.email);
      setTemSenha(conta.usuario.temSenha);
    }

    if (resultadoSessoes.autenticado) {
      setSessoes(
        resultadoSessoes.sessoes as SessaoView[],
      );
    }
  }, [listarSessoes, obterConta]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvarPerfil(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setProcessando(true);
    setMensagemPerfil("");
    setErroPerfil("");

    try {
      const resultado = await atualizarPerfil({
        data: {
          nome,
          telefone,
        },
      });

      if (!resultado.sucesso) {
        if (
          "precisaLogin" in resultado &&
          resultado.precisaLogin
        ) {
          window.location.assign("/login");
          return;
        }

        setErroPerfil(resultado.mensagem);
        return;
      }

      setMensagemPerfil(resultado.mensagem);

      /*
       * Atualiza também o contexto global do usuário
       * utilizado pelo cabeçalho/layout.
       */
      window.setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(error);
      setErroPerfil(
        "Não foi possível atualizar seus dados.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function trocarEmail(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setProcessando(true);
    setMensagemSeguranca("");
    setErroSeguranca("");

    const formData =
      new FormData(event.currentTarget);

    try {
      const resultado = await alterarEmail({
        data: {
          novoEmail: String(
            formData.get("novoEmail") ?? "",
          ),
          senhaAtual: String(
            formData.get("senhaAtualEmail") ?? "",
          ),
        },
      });

      if (!resultado.sucesso) {
        setErroSeguranca(resultado.mensagem);
        return;
      }

      setMensagemSeguranca(resultado.mensagem);

      window.setTimeout(() => {
        window.location.assign("/login");
      }, 700);
    } catch (error) {
      console.error(error);
      setErroSeguranca(
        "Não foi possível alterar o e-mail.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function trocarSenha(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setProcessando(true);
    setMensagemSeguranca("");
    setErroSeguranca("");

    const formData =
      new FormData(event.currentTarget);

    try {
      const resultado = await alterarSenha({
        data: {
          senhaAtual: String(
            formData.get("senhaAtual") ?? "",
          ),
          novaSenha: String(
            formData.get("novaSenha") ?? "",
          ),
          confirmarNovaSenha: String(
            formData.get(
              "confirmarNovaSenha",
            ) ?? "",
          ),
        },
      });

      if (!resultado.sucesso) {
        setErroSeguranca(resultado.mensagem);
        return;
      }

      setMensagemSeguranca(resultado.mensagem);

      window.setTimeout(() => {
        window.location.assign("/login");
      }, 700);
    } catch (error) {
      console.error(error);
      setErroSeguranca(
        "Não foi possível alterar a senha.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function removerSessao(
    sessaoId: string,
  ) {
    setMensagemSeguranca("");
    setErroSeguranca("");

    try {
      const resultado = await encerrarSessao({
        data: {
          sessaoId,
        },
      });

      if (!resultado.sucesso) {
        if (
          "precisaLogin" in resultado &&
          resultado.precisaLogin
        ) {
          window.location.assign("/login");
          return;
        }

        setErroSeguranca(resultado.mensagem);
        return;
      }

      if (resultado.sessaoAtualEncerrada) {
        window.location.assign("/login");
        return;
      }

      setMensagemSeguranca(resultado.mensagem);
      await carregar();
    } catch (error) {
      console.error(error);
      setErroSeguranca(
        "Não foi possível encerrar a sessão.",
      );
    }
  }

  async function removerOutrasSessoes() {
    setMensagemSeguranca("");
    setErroSeguranca("");

    try {
      const resultado = await encerrarOutras();

      if (!resultado.sucesso) {
        if (
          "precisaLogin" in resultado &&
          resultado.precisaLogin
        ) {
          window.location.assign("/login");
          return;
        }

        setErroSeguranca("Não foi possível encerrar as outras sessões.");
        return;
      }

      setMensagemSeguranca(resultado.mensagem);
      await carregar();
    } catch (error) {
      console.error(error);
      setErroSeguranca(
        "Não foi possível encerrar as outras sessões.",
      );
    }
  }

  return (
    <div className="max-w-4xl p-8 lg:p-12">
      <PageHeader
        title="Minha conta"
        subtitle="Gerencie seus dados, formas de acesso e sessões ativas."
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gold-soft">
              <UserRound className="h-6 w-6 text-gold" />
            </div>

            <div>
              <h2 className="font-medium">
                {nome || "Usuário"}
              </h2>

              <p className="text-sm text-muted-foreground">
                {traduzirPapel(usuario?.papel)}
              </p>
            </div>
          </div>

          <form
            onSubmit={salvarPerfil}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="conta-nome">
                Nome
              </Label>
              <Input
                id="conta-nome"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                autoComplete="name"
                minLength={3}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta-telefone">
                Telefone
              </Label>
              <Input
                id="conta-telefone"
                type="tel"
                value={telefone}
                onChange={(event) =>
                  setTelefone(event.target.value)
                }
                autoComplete="tel"
                maxLength={20}
                placeholder="(21) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta-email-atual">
                E-mail atual
              </Label>
              <Input
                id="conta-email-atual"
                type="email"
                value={email}
                readOnly
                className="bg-surface-elevated"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail é alterado separadamente,
                com confirmação da senha atual.
              </p>
            </div>

            {mensagemPerfil && (
              <p
                role="status"
                className="text-sm text-emerald-500"
              >
                {mensagemPerfil}
              </p>
            )}

            {erroPerfil && (
              <p
                role="alert"
                className="text-sm text-red-500"
              >
                {erroPerfil}
              </p>
            )}

            <Button
              type="submit"
              disabled={processando}
            >
              Salvar dados
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Mail className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-medium">
                Alterar e-mail
              </h2>
              <p className="text-sm text-muted-foreground">
                Exige sua senha atual e encerra
                todas as sessões.
              </p>
            </div>
          </div>

          {temSenha ? (
            <form
              onSubmit={trocarEmail}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="novoEmail">
                  Novo e-mail
                </Label>
                <Input
                  id="novoEmail"
                  name="novoEmail"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senhaAtualEmail">
                  Senha atual
                </Label>
                <Input
                  id="senhaAtualEmail"
                  name="senhaAtualEmail"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={processando}
              >
                Alterar e-mail
              </Button>
            </form>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Esta conta ainda não possui senha
              local.{" "}
              <Link
                to="/esqueci-senha"
                search={{}}
                className="font-medium text-gold hover:underline"
              >
                Crie uma senha pela recuperação
              </Link>{" "}
              antes de alterar o e-mail.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-gold" />
            <div>
              <h2 className="font-medium">
                Alterar senha
              </h2>
              <p className="text-sm text-muted-foreground">
                Ao trocar a senha, todas as sessões
                são encerradas por segurança.
              </p>
            </div>
          </div>

          {temSenha ? (
            <form
              onSubmit={trocarSenha}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">
                  Senha atual
                </Label>
                <Input
                  id="senhaAtual"
                  name="senhaAtual"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha">
                  Nova senha
                </Label>
                <Input
                  id="novaSenha"
                  name="novaSenha"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarNovaSenha">
                  Confirmar nova senha
                </Label>
                <Input
                  id="confirmarNovaSenha"
                  name="confirmarNovaSenha"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={processando}
              >
                Alterar senha
              </Button>
            </form>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Você entra pelo Google e ainda não
              possui senha local. Use{" "}
              <Link
                to="/esqueci-senha"
                search={{}}
                className="font-medium text-gold hover:underline"
              >
                Esqueci minha senha
              </Link>{" "}
              para criar uma senha com confirmação
              pelo seu e-mail.
            </p>
          )}

          {mensagemSeguranca && (
            <p
              role="status"
              className="mt-4 text-sm text-emerald-500"
            >
              {mensagemSeguranca}
            </p>
          )}

          {erroSeguranca && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-500"
            >
              {erroSeguranca}
            </p>
          )}
        </section>

        <GoogleAccountCard />

        <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <div>
                <h2 className="font-medium">
                  Sessões ativas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Revogue acessos que você não
                  reconhece.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void removerOutrasSessoes()
              }
            >
              Encerrar outras sessões
            </Button>
          </div>

          <div className="space-y-3">
            {sessoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma sessão ativa encontrada.
              </p>
            ) : (
              sessoes.map((sessao) => {
                const dispositivo =
                  descreverDispositivo(
                    sessao.userAgent,
                  );

                const Icone =
                  dispositivo.tipo === "mobile"
                    ? Smartphone
                    : Laptop;

                return (
                  <div
                    key={sessao.id}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-3">
                      <Icone className="mt-0.5 h-5 w-5 shrink-0 text-gold" />

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">
                            {dispositivo.nome}
                          </p>

                          {sessao.atual && (
                            <span className="rounded-full border border-gold/30 bg-gold-soft px-2 py-0.5 text-[11px] text-gold">
                              Sessão atual
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Última atividade:{" "}
                          {formatarData(
                            sessao.ultimaAtividadeEm,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Criada em:{" "}
                          {formatarData(
                            sessao.criadoEm,
                          )}
                          {" · "}
                          {sessao.persistente
                            ? "Persistente"
                            : "Sessão do navegador"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void removerSessao(
                          sessao.id,
                        )
                      }
                    >
                      {sessao.atual
                        ? "Sair desta sessão"
                        : "Encerrar"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
