import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  adminListarIntegracoes,
  adminPrepararIntegracao,
  adminSalvarConfiguracaoInfinitePay,
  adminTestarConexaoInfinitePay,
} from "@/lib/api/integracoes.functions";

export const Route = createFileRoute("/admin/conexoes")({
  component: AdminConexoesPage,
});

type StatusIntegracao =
  | "DESCONECTADA"
  | "CONFIGURANDO"
  | "CONECTADA"
  | "ERRO";

type Integracao = {
  provedor: "INTER" | "INFINITEPAY" | "META";
  status: StatusIntegracao;
  configuracaoPublica: unknown;
  possuiCredenciais: boolean;
  conectadoEm: string | Date | null;
  verificadoEm: string | Date | null;
  ultimoErro: string | null;
};

function classeStatus(
  status: StatusIntegracao,
): string {
  if (status === "CONECTADA") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "ERRO") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (status === "CONFIGURANDO") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  return "border-border bg-background text-muted-foreground";
}

function labelStatus(
  status: StatusIntegracao,
): string {
  const labels: Record<StatusIntegracao, string> = {
    DESCONECTADA: "Não configurado",
    CONFIGURANDO: "Configuração salva",
    CONECTADA: "Conectado",
    ERRO: "Revisar configuração",
  };

  return labels[status];
}

function lerInfiniteTag(
  configuracao: unknown,
): string {
  if (
    configuracao &&
    typeof configuracao === "object" &&
    !Array.isArray(configuracao)
  ) {
    const valor = (
      configuracao as Record<string, unknown>
    ).infiniteTag;

    return typeof valor === "string"
      ? valor
      : "";
  }

  return "";
}

function AdminConexoesPage() {
  const listar = useServerFn(adminListarIntegracoes);
  const preparar = useServerFn(
    adminPrepararIntegracao,
  );
  const salvar = useServerFn(
    adminSalvarConfiguracaoInfinitePay,
  );
  const testar = useServerFn(
    adminTestarConexaoInfinitePay,
  );

  const [integracoes, setIntegracoes] =
    useState<Integracao[]>([]);
  const [carregando, setCarregando] =
    useState(true);
  const [processando, setProcessando] =
    useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [formAberto, setFormAberto] =
    useState(false);
  const [mostrarApiKey, setMostrarApiKey] =
    useState(false);
  const [infiniteTag, setInfiniteTag] =
    useState("");
  const [apiKey, setApiKey] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      setIntegracoes(await listar());
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar as conexões.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const infinitePay = useMemo(
    () =>
      integracoes.find(
        (item) =>
          item.provedor === "INFINITEPAY",
      ) ?? null,
    [integracoes],
  );

  useEffect(() => {
    if (!infinitePay) {
      return;
    }

    setInfiniteTag(
      lerInfiniteTag(
        infinitePay.configuracaoPublica,
      ),
    );

    if (
      infinitePay.status === "CONFIGURANDO" ||
      infinitePay.status === "ERRO"
    ) {
      setFormAberto(true);
    }
  }, [infinitePay]);

  async function abrirConfiguracao() {
    setErro("");
    setMensagem("");
    setFormAberto(true);

    if (
      !infinitePay ||
      infinitePay.status === "DESCONECTADA"
    ) {
      setProcessando("PREPARAR");

      try {
        await preparar({
          data: {
            provedor: "INFINITEPAY",
          },
        });
        await carregar();
      } catch (error) {
        console.error(error);
        setErro(
          "Não foi possível iniciar a configuração.",
        );
      } finally {
        setProcessando("");
      }
    }
  }

  async function salvarConfiguracao() {
    if (!infiniteTag.trim()) {
      setErro("Informe a InfiniteTag da barbearia.");
      return;
    }

    if (!apiKey.trim()) {
      setErro("Informe a API Key da InfinitePay.");
      return;
    }

    setErro("");
    setMensagem("");
    setProcessando("SALVAR");

    try {
      const resultado = await salvar({
        data: {
          infiniteTag,
          apiKey,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      setApiKey("");
      await carregar();
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível salvar a configuração.",
      );
    } finally {
      setProcessando("");
    }
  }

  async function testarConfiguracao() {
    setErro("");
    setMensagem("");
    setProcessando("TESTAR");

    try {
      const resultado = await testar();

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        await carregar();
        return;
      }

      setMensagem(resultado.mensagem);
      await carregar();
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível validar a InfinitePay.",
      );
    } finally {
      setProcessando("");
    }
  }

  return (
    <div className="max-w-6xl p-6 lg:p-10">
      <PageHeader
        title="Conexões"
        subtitle="Configure os serviços externos usados pela operação do Studio RD."
      />

      {mensagem && (
        <div className="mb-5 border-l-2 border-emerald-500 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-5 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="border border-border bg-surface p-6 text-sm text-muted-foreground">
          Carregando conexões...
        </div>
      ) : (
        <div className="space-y-5">
          <section className="border border-border bg-surface">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
                  Pagamentos
                </p>
                <h2 className="mt-1 font-display text-xl">
                  InfinitePay
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  A conta da própria barbearia recebe os pagamentos.
                  O Studio RD usa a InfiniteTag e a API Key somente
                  no servidor para criar os checkouts.
                </p>
              </div>

              <span
                className={`self-start rounded-md border px-2.5 py-1 text-xs ${classeStatus(
                  infinitePay?.status ??
                    "DESCONECTADA",
                )}`}
              >
                {labelStatus(
                  infinitePay?.status ??
                    "DESCONECTADA",
                )}
              </span>
            </div>

            <div className="px-5 py-5">
              <div className="border-l-2 border-gold pl-4">
                <p className="text-sm font-medium">
                  Sem Sandbox oficial da InfinitePay
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A simulação do Studio RD continua separada e
                  não movimenta dinheiro. A validação da conexão
                  abaixo cria apenas um link real temporário de
                  R$ 1,00; ninguém é cobrado automaticamente.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() =>
                    void abrirConfiguracao()
                  }
                  disabled={
                    processando === "PREPARAR"
                  }
                >
                  {processando === "PREPARAR" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {infinitePay?.possuiCredenciais
                    ? "Gerenciar InfinitePay"
                    : "Configurar InfinitePay"}
                </Button>

                <Button
                  asChild
                  type="button"
                  variant="outline"
                >
                  <Link to="/admin/teste-cliente">
                    Abrir simulação do Studio RD
                  </Link>
                </Button>
              </div>

              {formAberto && (
                <div className="mt-7 border-t border-border pt-6">
                  <h3 className="text-base font-semibold">
                    Dados da conta InfinitePay
                  </h3>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                    No App ou na Conta Web da InfinitePay,
                    habilite o Checkout Integrado. Depois copie
                    a InfiniteTag e crie uma API Key exclusiva
                    para o Studio RD.
                  </p>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium">
                        InfiniteTag
                      </label>
                      <input
                        value={infiniteTag}
                        onChange={(event) =>
                          setInfiniteTag(
                            event.target.value
                              .replace(/^\$/, "")
                              .trim(),
                          )
                        }
                        placeholder="Ex.: studiordblack"
                        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                      />
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Use a InfiniteTag sem o símbolo $.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        API Key
                      </label>

                      <div className="relative mt-2">
                        <input
                          type={
                            mostrarApiKey
                              ? "text"
                              : "password"
                          }
                          value={apiKey}
                          onChange={(event) =>
                            setApiKey(
                              event.target.value,
                            )
                          }
                          placeholder="inchk_..."
                          className="h-11 w-full rounded-md border border-input bg-background px-3 pr-11 text-sm outline-none transition focus:border-gold"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setMostrarApiKey(
                              (atual) => !atual,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={
                            mostrarApiKey
                              ? "Ocultar API Key"
                              : "Mostrar API Key"
                          }
                        >
                          {mostrarApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        A chave fica criptografada e nunca é
                        enviada para o navegador depois de salva.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      disabled={
                        processando === "SALVAR"
                      }
                      onClick={() =>
                        void salvarConfiguracao()
                      }
                    >
                      {processando === "SALVAR" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar configuração
                    </Button>

                    {infinitePay?.possuiCredenciais && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          processando === "TESTAR"
                        }
                        onClick={() =>
                          void testarConfiguracao()
                        }
                      >
                        {processando === "TESTAR" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-4 w-4" />
                        )}
                        Validar integração
                      </Button>
                    )}
                  </div>

                  {infinitePay?.ultimoErro && (
                    <p className="mt-4 border-l-2 border-destructive pl-3 text-sm text-destructive">
                      {infinitePay.ultimoErro}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="border border-border bg-surface p-5 opacity-70">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Comunicação
            </p>
            <h2 className="mt-1 text-base font-semibold">
              Meta / WhatsApp / Instagram
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Em breve. Esta conexão continua fora do escopo
              financeiro atual.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
