import {
  useEffect,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Scissors,
  UserRound,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
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
      String(solicitacao.servico.precoCentavos / 100).replace(".", ",");

    try {
      const resultado = await concluirAgendamento({
        data: {
          agendamentoId: solicitacao.id,
          formaPagamento,
          valorPagoCentavos:
            converterPrecoParaCentavos(valorDigitado),
          observacaoPagamento: "",
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
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Solicitações"
        subtitle="Confirme, recuse ou conclua atendimentos enviados pelos clientes."
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <section className="rounded-2xl border border-border bg-surface p-8">
          <p className="text-sm text-muted-foreground">
            Carregando solicitações...
          </p>
        </section>
      ) : solicitacoes.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
          <CalendarCheck className="h-10 w-10 text-muted-foreground" />

          <h2 className="mt-5 text-xl font-display">
            Nenhuma solicitação pendente
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Quando um cliente solicitar ou tiver um horário confirmado, o
            pedido aparecerá aqui para ser gerenciado.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((solicitacao) => {
            const processando =
              processandoId === solicitacao.id;

            return (
              <article
                key={solicitacao.id}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
                        <Clock className="h-4 w-4" />
                        Horário solicitado
                      </div>

                      <h2 className="mt-2 text-xl font-display">
                        {formatarDataHora(solicitacao.inicio)}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Término previsto:{" "}
                        {formatarDataHora(solicitacao.fim)}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-border bg-background/40 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <UserRound className="h-4 w-4 text-gold" />
                          Cliente
                        </div>

                        <p className="mt-2 text-sm">
                          {solicitacao.cliente.nome}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {solicitacao.cliente.email}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {formatarTelefone(
                            solicitacao.cliente.telefone,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-background/40 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Scissors className="h-4 w-4 text-gold" />
                          Serviço
                        </div>

                        <p className="mt-2 text-sm">
                          {solicitacao.servico.nome}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {solicitacao.servico.duracaoMinutos} min ·{" "}
                          {formatarMoeda(
                            solicitacao.servico.precoCentavos,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-background/40 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <UserRound className="h-4 w-4 text-gold" />
                          Profissional
                        </div>

                        <p className="mt-2 text-sm">
                          {solicitacao.profissional.nome}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Status: {traduzirStatus(solicitacao.status)}
                        </p>
                      </div>
                    </div>

                    {solicitacao.observacaoCliente && (
                      <div className="rounded-xl border border-border bg-background/40 p-4">
                        <h3 className="text-sm font-medium">
                          Observação do cliente
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {solicitacao.observacaoCliente}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                    {solicitacao.status === "SOLICITADO" && (
                      <>
                        <Button
                          type="button"
                          disabled={processando}
                          onClick={() => void handleConfirmar(solicitacao.id)}
                          className="w-full"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {processando
                            ? "Processando..."
                            : "Confirmar"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={processando}
                          onClick={() => abrirModalRecusa(solicitacao.id)}
                          className="w-full"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Recusar
                        </Button>
                      </>
                    )}

                    {solicitacao.status === "CONFIRMADO" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-muted-foreground">
                            Forma de pagamento
                          </label>

                          <select
                            value={
                              formasPagamentoPorAgendamento[
                              solicitacao.id
                              ] ?? "PIX"
                            }
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
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                            value={
                              (formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX") ===
                                "ASSINATURA"
                                ? "0,00"
                                : valoresPagosPorAgendamento[solicitacao.id] ??
                                String(solicitacao.servico.precoCentavos / 100).replace(".", ",")
                            }
                            onChange={(event) =>
                              setValoresPagosPorAgendamento((estadoAtual) => ({
                                ...estadoAtual,
                                [solicitacao.id]: event.target.value,
                              }))
                            }
                            disabled={
                              (formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX") ===
                              "ASSINATURA"
                            }
                            inputMode="decimal"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <Button
                          type="button"
                          disabled={processando}
                          onClick={() =>
                            void handleConcluir(solicitacao)
                          }
                          className="w-full"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {processando
                            ? "Processando..."
                            : "Marcar concluído"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={processando}
                          onClick={() =>
                            abrirModalCancelamentoEquipe(solicitacao.id)
                          }
                          className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar pela equipe
                        </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-display">
                  {modalAcao.titulo}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
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

            <div className="mt-6 space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Motivo
              </label>

              <textarea
                value={motivoModal}
                onChange={(event) =>
                  setMotivoModal(event.target.value)
                }
                placeholder="Ex.: horário indisponível, ajuste interno, conflito de agenda..."
                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={fecharModalAcao}
                disabled={processandoId === modalAcao.agendamentoId}
              >
                Voltar
              </Button>

              <Button
                type="button"
                onClick={() => void handleConfirmarModalAcao()}
                disabled={processandoId === modalAcao.agendamentoId}
                className={
                  modalAcao.tipo === "CANCELAR_EQUIPE"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : undefined
                }
              >
                {processandoId === modalAcao.agendamentoId
                  ? "Processando..."
                  : modalAcao.tipo === "RECUSAR"
                    ? "Confirmar recusa"
                    : "Confirmar cancelamento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}