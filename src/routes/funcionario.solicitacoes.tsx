import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Scissors,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  funcionarioCancelarAgendamento,
  funcionarioConfirmarAgendamento,
  funcionarioConcluirAgendamento,
  funcionarioListarSolicitacoes,
  funcionarioRecusarAgendamento,
} from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/funcionario/solicitacoes")({
  component: SolicitacoesPage,

  head: () => ({
    meta: [
      {
        title: "Solicitações · Funcionário · Studio RD",
      },
    ],
  }),
});

type Solicitacao = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  observacaoCliente: string | null;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
  };
  servico: {
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  };
  profissional: {
    id: string;
    nome: string;
  };
};

const formasPagamento = [
  {
    value: "PIX",
    label: "Pix",
  },
  {
    value: "DINHEIRO",
    label: "Dinheiro",
  },
  {
    value: "CARTAO_DEBITO",
    label: "Cartão de débito",
  },
  {
    value: "CARTAO_CREDITO",
    label: "Cartão de crédito",
  },
  {
    value: "ASSINATURA",
    label: "Assinatura RD Black",
  },
  {
    value: "CORTESIA",
    label: "Cortesia",
  },
  {
    value: "OUTRO",
    label: "Outro",
  },
] as const;

type FormaPagamentoValor =
  (typeof formasPagamento)[number]["value"];

function SolicitacoesPage() {
  const carregarSolicitacoes = useServerFn(
    funcionarioListarSolicitacoes,
  );
  const confirmarAgendamento = useServerFn(
    funcionarioConfirmarAgendamento,
  );
  const recusarAgendamento = useServerFn(
    funcionarioRecusarAgendamento,
  );
  const concluirAgendamento = useServerFn(
    funcionarioConcluirAgendamento,
  );
  const cancelarAgendamento = useServerFn(
    funcionarioCancelarAgendamento,
  );

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [modalAcao, setModalAcao] = useState<{
    tipo: "RECUSAR" | "CANCELAR_EQUIPE";
    agendamentoId: string;
    titulo: string;
    descricao: string;
  } | null>(null);

  const [motivoModal, setMotivoModal] = useState("");

  const [
    formasPagamentoPorAgendamento,
    setFormasPagamentoPorAgendamento,
  ] = useState<Record<string, FormaPagamentoValor>>({});

  const [
    valoresPagosPorAgendamento,
    setValoresPagosPorAgendamento,
  ] = useState<Record<string, string>>({});

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarSolicitacoes();

      setSolicitacoes(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar as solicitações.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const solicitados = solicitacoes.filter(
      (item) => item.status === "SOLICITADO",
    ).length;

    const confirmados = solicitacoes.filter(
      (item) => item.status === "CONFIRMADO",
    ).length;

    return {
      total: solicitacoes.length,
      solicitados,
      confirmados,
    };
  }, [solicitacoes]);

  function abrirModalRecusa(agendamentoId: string) {
    setMotivoModal("");
    setModalAcao({
      tipo: "RECUSAR",
      agendamentoId,
      titulo: "Recusar solicitação",
      descricao:
        "Informe o motivo da recusa. O cliente verá essa informação no histórico do agendamento.",
    });
  }

  function abrirModalCancelamentoEquipe(agendamentoId: string) {
    setMotivoModal("");
    setModalAcao({
      tipo: "CANCELAR_EQUIPE",
      agendamentoId,
      titulo: "Cancelar pela equipe",
      descricao:
        "Informe o motivo do cancelamento. O cliente verá que o horário foi cancelado pela equipe.",
    });
  }

  function fecharModalAcao() {
    setModalAcao(null);
    setMotivoModal("");
  }

  async function handleConfirmar(agendamentoId: string) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);

    try {
      const resultado = await confirmarAgendamento({
        data: {
          agendamentoId,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível confirmar o agendamento.");
    } finally {
      setProcessandoId("");
    }
  }

  async function handleConfirmarModalAcao() {
    if (!modalAcao) {
      return;
    }

    if (modalAcao.tipo === "RECUSAR") {
      await handleRecusar(
        modalAcao.agendamentoId,
        motivoModal,
      );

      return;
    }

    if (modalAcao.tipo === "CANCELAR_EQUIPE") {
      await handleCancelarAgendamento(
        modalAcao.agendamentoId,
        motivoModal,
      );
    }
  }

  async function handleRecusar(
    agendamentoId: string,
    motivoRecusa: string,
  ) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);

    try {
      const resultado = await recusarAgendamento({
        data: {
          agendamentoId,
          motivoRecusa,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      fecharModalAcao();

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível recusar a solicitação.");
    } finally {
      setProcessandoId("");
    }
  }

  async function handleConcluir(solicitacao: Solicitacao) {
    setMensagem("");
    setErro("");
    setProcessandoId(solicitacao.id);

    const formaPagamento =
      formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX";

    const valorDigitado =
      valoresPagosPorAgendamento[solicitacao.id] ??
      String(solicitacao.servico.precoCentavos / 100).replace(
        ".",
        ",",
      );

    try {
      const resultado = await concluirAgendamento({
        data: {
          agendamentoId: solicitacao.id,
          formaPagamento,
          valorPagoCentavos:
            formaPagamento === "ASSINATURA"
              ? undefined
              : converterPrecoParaCentavos(valorDigitado),
          observacaoPagamento:
            formaPagamento === "ASSINATURA"
              ? "Pagamento realizado com saldo de assinatura RD Black."
              : "",
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível concluir o atendimento.");
    } finally {
      setProcessandoId("");
    }
  }

  async function handleCancelarAgendamento(
    agendamentoId: string,
    motivoCancelamento: string,
  ) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);

    try {
      const resultado = await cancelarAgendamento({
        data: {
          agendamentoId,
          motivoCancelamento,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      fecharModalAcao();

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível cancelar o agendamento.");
    } finally {
      setProcessandoId("");
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="space-y-4">
          <Badge className="border-gold/40 bg-gold-soft text-gold">
            Área operacional
          </Badge>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Solicitações
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Confirme pedidos, conclua atendimentos e registre o
                pagamento direto pelo celular.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void carregarDados()}
              disabled={carregando}
              className="h-11 w-full rounded-xl sm:w-auto"
            >
              {carregando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Atualizar
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ResumoCard label="Total" valor={resumo.total} />
            <ResumoCard label="Pendentes" valor={resumo.solicitados} />
            <ResumoCard label="Confirmados" valor={resumo.confirmados} />
          </div>
        </header>

        {erro && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
            {mensagem}
          </div>
        )}

        {carregando ? (
          <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />

            <p className="mt-4 text-sm text-muted-foreground">
              Carregando solicitações...
            </p>
          </section>
        ) : solicitacoes.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center">
            <CalendarCheck className="h-10 w-10 text-muted-foreground" />

            <h2 className="mt-5 text-xl font-display">
              Nenhuma solicitação no momento
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Quando um cliente solicitar ou tiver um horário
              confirmado, o pedido aparecerá aqui para ser gerenciado.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {solicitacoes.map((solicitacao) => {
              const processando =
                processandoId === solicitacao.id;

              const formaPagamentoAtual =
                formasPagamentoPorAgendamento[solicitacao.id] ??
                "PIX";

              const valorAtual =
                formaPagamentoAtual === "ASSINATURA"
                  ? "0,00"
                  : valoresPagosPorAgendamento[solicitacao.id] ??
                    String(
                      solicitacao.servico.precoCentavos / 100,
                    ).replace(".", ",");

              return (
                <article
                  key={solicitacao.id}
                  className="overflow-hidden rounded-3xl border border-border bg-surface"
                >
                  <div className="border-b border-border/70 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={solicitacao.status} />

                          <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold">
                            <Clock className="h-3.5 w-3.5" />
                            {formatarDataHora(solicitacao.inicio)}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-display">
                          {solicitacao.cliente.nome}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {solicitacao.servico.nome} ·{" "}
                          {solicitacao.servico.duracaoMinutos} min ·{" "}
                          {formatarMoeda(
                            solicitacao.servico.precoCentavos,
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-background/50 px-3 py-2 text-sm">
                        <p className="text-xs text-muted-foreground">
                          Término previsto
                        </p>
                        <p className="font-medium">
                          {formatarDataHora(solicitacao.fim)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <InfoBox
                          icon={UserRound}
                          title="Cliente"
                          lines={[
                            solicitacao.cliente.nome,
                            solicitacao.cliente.email,
                            formatarTelefone(
                              solicitacao.cliente.telefone,
                            ),
                          ]}
                        />

                        <InfoBox
                          icon={Scissors}
                          title="Serviço"
                          lines={[
                            solicitacao.servico.nome,
                            `${solicitacao.servico.duracaoMinutos} min`,
                            formatarMoeda(
                              solicitacao.servico.precoCentavos,
                            ),
                          ]}
                        />

                        <InfoBox
                          icon={UserRound}
                          title="Profissional"
                          lines={[
                            solicitacao.profissional.nome,
                            `Status: ${traduzirStatus(
                              solicitacao.status,
                            )}`,
                          ]}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <ContatoLinha
                          icon={Mail}
                          label="E-mail"
                          value={solicitacao.cliente.email}
                        />

                        <ContatoLinha
                          icon={Phone}
                          label="Telefone"
                          value={formatarTelefone(
                            solicitacao.cliente.telefone,
                          )}
                        />
                      </div>

                      {solicitacao.observacaoCliente && (
                        <div className="rounded-2xl border border-border bg-background/40 p-4">
                          <h3 className="text-sm font-medium">
                            Observação do cliente
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {solicitacao.observacaoCliente}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {solicitacao.status === "SOLICITADO" && (
                        <div className="rounded-2xl border border-border bg-background/40 p-3">
                          <p className="mb-3 text-sm font-medium">
                            Decisão da equipe
                          </p>

                          <div className="grid gap-2">
                            <Button
                              type="button"
                              disabled={processando}
                              onClick={() =>
                                void handleConfirmar(solicitacao.id)
                              }
                              className="h-11 w-full rounded-xl"
                            >
                              {processando ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              {processando
                                ? "Processando..."
                                : "Confirmar"}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              disabled={processando}
                              onClick={() =>
                                abrirModalRecusa(solicitacao.id)
                              }
                              className="h-11 w-full rounded-xl"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Recusar
                            </Button>
                          </div>
                        </div>
                      )}

                      {solicitacao.status === "CONFIRMADO" && (
                        <div className="rounded-2xl border border-border bg-background/40 p-3">
                          <p className="mb-3 text-sm font-medium">
                            Concluir atendimento
                          </p>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                                Forma de pagamento
                              </label>

                              <select
                                value={formaPagamentoAtual}
                                onChange={(event) =>
                                  setFormasPagamentoPorAgendamento(
                                    (estadoAtual) => ({
                                      ...estadoAtual,
                                      [solicitacao.id]:
                                        event.target
                                          .value as FormaPagamentoValor,
                                    }),
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                              >
                                {formasPagamento.map((forma) => (
                                  <option
                                    key={forma.value}
                                    value={forma.value}
                                  >
                                    {forma.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                                Valor recebido
                              </label>

                              <input
                                value={valorAtual}
                                onChange={(event) =>
                                  setValoresPagosPorAgendamento(
                                    (estadoAtual) => ({
                                      ...estadoAtual,
                                      [solicitacao.id]:
                                        event.target.value,
                                    }),
                                  )
                                }
                                disabled={
                                  formaPagamentoAtual === "ASSINATURA"
                                }
                                inputMode="decimal"
                                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
                              />

                              {formaPagamentoAtual ===
                                "ASSINATURA" && (
                                <p className="text-xs leading-5 text-muted-foreground">
                                  O valor fica zerado e o sistema tenta
                                  descontar 1 corte da assinatura ativa do
                                  cliente.
                                </p>
                              )}
                            </div>

                            <Button
                              type="button"
                              disabled={processando}
                              onClick={() =>
                                void handleConcluir(solicitacao)
                              }
                              className="h-11 w-full rounded-xl"
                            >
                              {processando ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              {processando
                                ? "Processando..."
                                : "Marcar concluído"}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              disabled={processando}
                              onClick={() =>
                                abrirModalCancelamentoEquipe(
                                  solicitacao.id,
                                )
                              }
                              className="h-11 w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar pela equipe
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {modalAcao && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display">
                    {modalAcao.titulo}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {modalAcao.descricao}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fecharModalAcao}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-surface-elevated"
                >
                  Fechar
                </button>
              </div>

              <form
                className="mt-6"
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  void handleConfirmarModalAcao();
                }}
              >
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Motivo
                  </label>

                  <textarea
                    value={motivoModal}
                    onChange={(event) =>
                      setMotivoModal(event.target.value)
                    }
                    placeholder="Ex.: horário indisponível, ajuste interno, conflito de agenda..."
                    className="min-h-32 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-gold"
                  />
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fecharModalAcao}
                    disabled={processandoId === modalAcao.agendamentoId}
                    className="h-11 rounded-xl"
                  >
                    Voltar
                  </Button>

                  <Button
                    type="submit"
                    disabled={processandoId === modalAcao.agendamentoId}
                    className={
                      modalAcao.tipo === "CANCELAR_EQUIPE"
                        ? "h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "h-11 rounded-xl"
                    }
                  >
                    {processandoId === modalAcao.agendamentoId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : modalAcao.tipo === "RECUSAR" ? (
                      "Confirmar recusa"
                    ) : (
                      "Confirmar cancelamento"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumoCard({
  label,
  valor,
}: {
  label: string;
  valor: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-4 text-center">
      <p className="text-xl font-semibold text-gold">{valor}</p>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const estilos: Record<string, string> = {
    SOLICITADO: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    CONFIRMADO: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    CONCLUIDO: "border-gold/40 bg-gold-soft text-gold",
    RECUSADO: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        estilos[status] ??
        "border-border bg-background text-muted-foreground"
      }`}
    >
      {traduzirStatus(status)}
    </span>
  );
}

function InfoBox({
  icon: Icon,
  title,
  lines,
}: {
  icon: LucideIcon;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-gold" />
        {title}
      </div>

      <div className="mt-3 space-y-1">
        {lines.map((line, index) => (
          <p
            key={`${title}-${line}-${index}`}
            className={
              index === 0
                ? "break-words text-sm"
                : "break-words text-xs text-muted-foreground"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function ContatoLinha({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm">{value}</p>
      </div>
    </div>
  );
}

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function formatarTelefone(telefone: string | null): string {
  if (!telefone) {
    return "Não informado";
  }

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3",
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3",
    );
  }

  return telefone;
}

function converterPrecoParaCentavos(valor: string): number {
  const limpo = valor
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(limpo);

  if (!Number.isFinite(numero)) {
    return 0;
  }

  return Math.round(numero * 100);
}

function traduzirStatus(status: string): string {
  const mapa: Record<string, string> = {
    SOLICITADO: "aguardando decisão",
    CONFIRMADO: "confirmado",
    CONCLUIDO: "concluído",
    RECUSADO: "recusado",
  };

  return mapa[status] ?? status;
}