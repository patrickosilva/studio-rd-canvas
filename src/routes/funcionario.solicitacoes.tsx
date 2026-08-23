import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
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
        title: "Agenda · Funcionário · Studio RD",
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

  const isMobile = useIsMobile();

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [dataSelecionada, setDataSelecionada] = useState<Date>(
    () => obterInicioDoDia(new Date()),
  );

  const [agendamentoAbertoId, setAgendamentoAbertoId] = useState<
    string | null
  >(null);

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

      setErro("Não foi possível carregar a agenda.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const inicioSemana = useMemo(
    () => obterInicioDaSemana(dataSelecionada),
    [dataSelecionada],
  );

  const diasDaSemana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, indice) =>
        adicionarDias(inicioSemana, indice),
      ),
    [inicioSemana],
  );

  const diasComAgendamento = useMemo(() => {
    const conjunto = new Set<string>();

    solicitacoes.forEach((solicitacao) => {
      conjunto.add(chaveDia(new Date(solicitacao.inicio)));
    });

    return conjunto;
  }, [solicitacoes]);

  const agendamentosDoDia = useMemo(
    () =>
      solicitacoes
        .filter((solicitacao) =>
          mesmoDia(new Date(solicitacao.inicio), dataSelecionada),
        )
        .sort(
          (a, b) =>
            new Date(a.inicio).getTime() -
            new Date(b.inicio).getTime(),
        ),
    [solicitacoes, dataSelecionada],
  );

  const resumoDia = useMemo(() => {
    const solicitados = agendamentosDoDia.filter(
      (item) => item.status === "SOLICITADO",
    ).length;

    const confirmados = agendamentosDoDia.filter(
      (item) => item.status === "CONFIRMADO",
    ).length;

    return {
      total: agendamentosDoDia.length,
      solicitados,
      confirmados,
    };
  }, [agendamentosDoDia]);

  const agendamentoSelecionado = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => solicitacao.id === agendamentoAbertoId,
      ) ?? null,
    [solicitacoes, agendamentoAbertoId],
  );

  const formaPagamentoSelecionada: FormaPagamentoValor =
    agendamentoSelecionado
      ? formasPagamentoPorAgendamento[agendamentoSelecionado.id] ??
        "PIX"
      : "PIX";

  const valorSelecionado = agendamentoSelecionado
    ? formaPagamentoSelecionada === "ASSINATURA"
      ? "0,00"
      : valoresPagosPorAgendamento[agendamentoSelecionado.id] ??
        String(
          agendamentoSelecionado.servico.precoCentavos / 100,
        ).replace(".", ",")
    : "";

  function selecionarDia(dia: Date) {
    setDataSelecionada(obterInicioDoDia(dia));
  }

  function irParaSemanaAnterior() {
    setDataSelecionada((atual) => adicionarDias(atual, -7));
  }

  function irParaProximaSemana() {
    setDataSelecionada((atual) => adicionarDias(atual, 7));
  }

  function irParaHoje() {
    setDataSelecionada(obterInicioDoDia(new Date()));
  }

  function abrirDetalhes(agendamentoId: string) {
    setAgendamentoAbertoId(agendamentoId);
  }

  function fecharDetalhes() {
    setAgendamentoAbertoId(null);
  }

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
      <div className="mx-auto flex max-w-5xl flex-col gap-5 pb-24 lg:pb-8">
        <header className="space-y-4">
          <Badge className="border-gold/40 bg-gold-soft text-gold">
            Área operacional
          </Badge>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Agenda
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Navegue pelos dias, confirme pedidos e conclua
                atendimentos direto pelo celular.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
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

              <Button
                type="button"
                asChild
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <Link to="/funcionario/agendar-cliente">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Novo agendamento
                </Link>
              </Button>
            </div>
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

        <SeletorDeDias
          dias={diasDaSemana}
          dataSelecionada={dataSelecionada}
          diasComAgendamento={diasComAgendamento}
          onSelecionar={selecionarDia}
          onSemanaAnterior={irParaSemanaAnterior}
          onProximaSemana={irParaProximaSemana}
          onHoje={irParaHoje}
        />

        <section className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-medium">
                Agenda do dia
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {formatarDataCompleta(dataSelecionada)}
                {!carregando &&
                  ` · ${resumoDia.total} agendamento${
                    resumoDia.total === 1 ? "" : "s"
                  }${
                    resumoDia.solicitados > 0
                      ? ` · ${resumoDia.solicitados} pendente${
                          resumoDia.solicitados === 1 ? "" : "s"
                        }`
                      : ""
                  }`}
              </p>
            </div>

            <Clock className="h-4 w-4 shrink-0 text-gold" />
          </div>

          {carregando ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />

              <p className="text-sm text-muted-foreground">
                Carregando agenda...
              </p>
            </div>
          ) : agendamentosDoDia.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
              <CalendarCheck className="h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-display">
                Nenhum agendamento para este dia
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Selecione outro dia ou crie um novo agendamento
                para este cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4 sm:p-5">
              {agendamentosDoDia.map((solicitacao) => (
                <CartaoAgendamento
                  key={solicitacao.id}
                  agendamento={solicitacao}
                  onClick={() => abrirDetalhes(solicitacao.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Link
        to="/funcionario/agendar-cliente"
        aria-label="Novo agendamento"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-gold-foreground shadow-premium transition hover:opacity-90 lg:hidden"
      >
        <CalendarPlus className="h-6 w-6" />
      </Link>

      <PainelDetalhes
        agendamento={agendamentoSelecionado}
        isMobile={isMobile}
        processandoId={processandoId}
        formaPagamentoAtual={formaPagamentoSelecionada}
        valorAtual={valorSelecionado}
        onFechar={fecharDetalhes}
        onFormaPagamentoChange={(valor) => {
          if (!agendamentoSelecionado) {
            return;
          }

          setFormasPagamentoPorAgendamento((estadoAtual) => ({
            ...estadoAtual,
            [agendamentoSelecionado.id]: valor,
          }));
        }}
        onValorChange={(valor) => {
          if (!agendamentoSelecionado) {
            return;
          }

          setValoresPagosPorAgendamento((estadoAtual) => ({
            ...estadoAtual,
            [agendamentoSelecionado.id]: valor,
          }));
        }}
        onConfirmar={() => {
          if (agendamentoSelecionado) {
            void handleConfirmar(agendamentoSelecionado.id);
          }
        }}
        onAbrirRecusa={() => {
          if (agendamentoSelecionado) {
            abrirModalRecusa(agendamentoSelecionado.id);
          }
        }}
        onConcluir={() => {
          if (agendamentoSelecionado) {
            void handleConcluir(agendamentoSelecionado);
          }
        }}
        onAbrirCancelamento={() => {
          if (agendamentoSelecionado) {
            abrirModalCancelamentoEquipe(agendamentoSelecionado.id);
          }
        }}
      />

      {modalAcao && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
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
  );
}

function SeletorDeDias({
  dias,
  dataSelecionada,
  diasComAgendamento,
  onSelecionar,
  onSemanaAnterior,
  onProximaSemana,
  onHoje,
}: {
  dias: Date[];
  dataSelecionada: Date;
  diasComAgendamento: Set<string>;
  onSelecionar: (dia: Date) => void;
  onSemanaAnterior: () => void;
  onProximaSemana: () => void;
  onHoje: () => void;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <p className="truncate text-sm font-medium capitalize">
          {formatarMesAno(dataSelecionada)}
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onHoje}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-surface-elevated"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={onSemanaAnterior}
            aria-label="Semana anterior"
            className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-surface-elevated"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onProximaSemana}
            aria-label="Próxima semana"
            className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-surface-elevated"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dias.map((dia) => {
          const selecionado = mesmoDia(dia, dataSelecionada);
          const temAgendamento = diasComAgendamento.has(
            chaveDia(dia),
          );

          return (
            <button
              key={dia.toISOString()}
              type="button"
              onClick={() => onSelecionar(dia)}
              aria-pressed={selecionado}
              aria-label={formatarDataCompleta(dia)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition ${
                selecionado
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-border bg-background/40 text-foreground hover:bg-surface-elevated"
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wide ${
                  selecionado
                    ? "text-gold-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {formatarDiaSemanaCurto(dia)}
              </span>

              <span className="text-base font-semibold">
                {dia.getDate()}
              </span>

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  temAgendamento
                    ? selecionado
                      ? "bg-gold-foreground"
                      : "bg-gold"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CartaoAgendamento({
  agendamento,
  onClick,
}: {
  agendamento: Solicitacao;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-background/40 p-4 text-left transition hover:border-gold/40 hover:bg-surface-elevated"
    >
      <div className="flex w-14 shrink-0 flex-col items-center">
        <span className="text-sm font-semibold text-gold">
          {formatarHora(agendamento.inicio)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatarHora(agendamento.fim)}
        </span>
      </div>

      <div className="h-10 w-px shrink-0 bg-border" />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {agendamento.cliente.nome}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {agendamento.servico.nome}
        </p>
      </div>

      <StatusBadge status={agendamento.status} />
    </button>
  );
}

function PainelDetalhes({
  agendamento,
  isMobile,
  processandoId,
  formaPagamentoAtual,
  valorAtual,
  onFechar,
  onFormaPagamentoChange,
  onValorChange,
  onConfirmar,
  onAbrirRecusa,
  onConcluir,
  onAbrirCancelamento,
}: {
  agendamento: Solicitacao | null;
  isMobile: boolean;
  processandoId: string;
  formaPagamentoAtual: FormaPagamentoValor;
  valorAtual: string;
  onFechar: () => void;
  onFormaPagamentoChange: (valor: FormaPagamentoValor) => void;
  onValorChange: (valor: string) => void;
  onConfirmar: () => void;
  onAbrirRecusa: () => void;
  onConcluir: () => void;
  onAbrirCancelamento: () => void;
}) {
  const aberto = agendamento !== null;

  if (isMobile) {
    return (
      <Drawer
        open={aberto}
        onOpenChange={(proximoEstado) => {
          if (!proximoEstado) {
            onFechar();
          }
        }}
      >
        <DrawerContent className="border-border bg-surface">
          {agendamento && (
            <>
              <DrawerHeader className="text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <DrawerTitle className="truncate font-display text-xl">
                      {agendamento.cliente.nome}
                    </DrawerTitle>
                    <DrawerDescription>
                      {formatarDataCompleta(agendamento.inicio)} ·{" "}
                      {formatarHora(agendamento.inicio)} –{" "}
                      {formatarHora(agendamento.fim)}
                    </DrawerDescription>
                  </div>

                  <DrawerClose asChild>
                    <button
                      type="button"
                      aria-label="Fechar"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-surface-elevated"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
                <ConteudoDetalhes
                  agendamento={agendamento}
                  processandoId={processandoId}
                  formaPagamentoAtual={formaPagamentoAtual}
                  valorAtual={valorAtual}
                  onFormaPagamentoChange={onFormaPagamentoChange}
                  onValorChange={onValorChange}
                  onConfirmar={onConfirmar}
                  onAbrirRecusa={onAbrirRecusa}
                  onConcluir={onConcluir}
                  onAbrirCancelamento={onAbrirCancelamento}
                />
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(proximoEstado) => {
        if (!proximoEstado) {
          onFechar();
        }
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border bg-surface">
        {agendamento && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {agendamento.cliente.nome}
              </DialogTitle>
              <DialogDescription>
                {formatarDataCompleta(agendamento.inicio)} ·{" "}
                {formatarHora(agendamento.inicio)} –{" "}
                {formatarHora(agendamento.fim)}
              </DialogDescription>
            </DialogHeader>

            <ConteudoDetalhes
              agendamento={agendamento}
              processandoId={processandoId}
              formaPagamentoAtual={formaPagamentoAtual}
              valorAtual={valorAtual}
              onFormaPagamentoChange={onFormaPagamentoChange}
              onValorChange={onValorChange}
              onConfirmar={onConfirmar}
              onAbrirRecusa={onAbrirRecusa}
              onConcluir={onConcluir}
              onAbrirCancelamento={onAbrirCancelamento}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConteudoDetalhes({
  agendamento,
  processandoId,
  formaPagamentoAtual,
  valorAtual,
  onFormaPagamentoChange,
  onValorChange,
  onConfirmar,
  onAbrirRecusa,
  onConcluir,
  onAbrirCancelamento,
}: {
  agendamento: Solicitacao;
  processandoId: string;
  formaPagamentoAtual: FormaPagamentoValor;
  valorAtual: string;
  onFormaPagamentoChange: (valor: FormaPagamentoValor) => void;
  onValorChange: (valor: string) => void;
  onConfirmar: () => void;
  onAbrirRecusa: () => void;
  onConcluir: () => void;
  onAbrirCancelamento: () => void;
}) {
  const processando = processandoId === agendamento.id;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={agendamento.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoBox
          icon={Scissors}
          title="Serviço"
          lines={[
            agendamento.servico.nome,
            `${agendamento.servico.duracaoMinutos} min`,
            formatarMoeda(agendamento.servico.precoCentavos),
          ]}
        />

        <InfoBox
          icon={UserRound}
          title="Profissional"
          lines={[
            agendamento.profissional.nome,
            `Status: ${traduzirStatus(agendamento.status)}`,
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ContatoLinha
          icon={Mail}
          label="E-mail"
          value={agendamento.cliente.email}
        />

        <ContatoLinha
          icon={Phone}
          label="Telefone"
          value={formatarTelefone(agendamento.cliente.telefone)}
        />
      </div>

      {agendamento.observacaoCliente && (
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <h3 className="text-sm font-medium">
            Observação do cliente
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {agendamento.observacaoCliente}
          </p>
        </div>
      )}

      {agendamento.status === "SOLICITADO" && (
        <div className="rounded-2xl border border-border bg-background/40 p-3">
          <p className="mb-3 text-sm font-medium">
            Decisão da equipe
          </p>

          <div className="grid gap-2">
            <Button
              type="button"
              disabled={processando}
              onClick={onConfirmar}
              className="h-11 w-full rounded-xl"
            >
              {processando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {processando ? "Processando..." : "Confirmar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={processando}
              onClick={onAbrirRecusa}
              className="h-11 w-full rounded-xl"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Recusar
            </Button>
          </div>
        </div>
      )}

      {agendamento.status === "CONFIRMADO" && (
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
                  onFormaPagamentoChange(
                    event.target.value as FormaPagamentoValor,
                  )
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
              >
                {formasPagamento.map((forma) => (
                  <option key={forma.value} value={forma.value}>
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
                  onValorChange(event.target.value)
                }
                disabled={formaPagamentoAtual === "ASSINATURA"}
                inputMode="decimal"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
              />

              {formaPagamentoAtual === "ASSINATURA" && (
                <p className="text-xs leading-5 text-muted-foreground">
                  O valor fica zerado e o sistema tenta descontar 1
                  corte da assinatura ativa do cliente.
                </p>
              )}
            </div>

            <Button
              type="button"
              disabled={processando}
              onClick={onConcluir}
              className="h-11 w-full rounded-xl"
            >
              {processando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {processando ? "Processando..." : "Marcar concluído"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={processando}
              onClick={onAbrirCancelamento}
              className="h-11 w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar pela equipe
            </Button>
          </div>
        </div>
      )}
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
      className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
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

function formatarHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function formatarDataCompleta(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor));
}

function formatarDiaSemanaCurto(data: Date): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  })
    .format(data)
    .replace(".", "");

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatarMesAno(data: Date): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function obterInicioDoDia(data: Date): Date {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
  );
}

function adicionarDias(data: Date, dias: number): Date {
  const resultado = obterInicioDoDia(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

function obterInicioDaSemana(data: Date): Date {
  const diaSemana = (data.getDay() + 6) % 7;
  return adicionarDias(data, -diaSemana);
}

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function chaveDia(data: Date): string {
  return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
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
