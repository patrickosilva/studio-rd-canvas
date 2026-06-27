import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Receipt,
  Scissors,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { adminListarAgenda } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/admin/financeiro")({
  component: FinanceiroPage,
});

type AgendamentoFinanceiro = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  observacaoCliente: string | null;
  motivoRecusa: string | null;
  formaPagamento: string | null;
  valorPagoCentavos: number | null;
  pagoEm: string | Date | null;
  observacaoPagamento: string | null;
  criadoEm: string | Date;
  atualizadoEm: string | Date;

  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
  };

  profissional: {
    id: string;
    nome: string;
  };

  servico: {
    id: string;
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  };
};

type FiltroPeriodo = "todos" | "mesAtual" | "ultimos30";

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function estaNoMesAtual(valor: string | Date): boolean {
  const data = new Date(valor);
  const hoje = new Date();

  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth()
  );
}

function estaNosUltimos30Dias(valor: string | Date): boolean {
  const data = new Date(valor);
  const agora = new Date();

  const limite = new Date(agora);
  limite.setDate(agora.getDate() - 30);
  limite.setHours(0, 0, 0, 0);

  return data >= limite && data <= agora;
}

function obterValorRealizado(
  agendamento: AgendamentoFinanceiro,
): number {
  return (
    agendamento.valorPagoCentavos ??
    agendamento.servico.precoCentavos
  );
}

function traduzirFormaPagamento(
  formaPagamento: string | null,
): string {
  const mapa: Record<string, string> = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    ASSINATURA: "Assinatura RD Black",
    CORTESIA: "Cortesia",
    OUTRO: "Outro",
    NAO_INFORMADO: "Não informado",
  };

  if (!formaPagamento) {
    return "Não informado";
  }

  return mapa[formaPagamento] ?? formaPagamento;
}

function traduzirStatus(status: string): string {
  const mapa: Record<string, string> = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado pelo cliente",
    CANCELADO_FUNCIONARIO: "Cancelado pela equipe",
    CONCLUIDO: "Concluído",
    FALTOU: "Não compareceu",
  };

  return mapa[status] ?? status;
}

function obterClasseStatus(status: string): string {
  if (status === "CONCLUIDO") {
    return "bg-emerald-500/10 text-emerald-400";
  }

  if (status === "CONFIRMADO") {
    return "bg-gold-soft text-gold";
  }

  if (status === "SOLICITADO") {
    return "border border-border bg-background text-muted-foreground";
  }

  return "bg-destructive/10 text-destructive";
}

function FinanceiroPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);

  const [agendamentos, setAgendamentos] = useState<
    AgendamentoFinanceiro[]
  >([]);
  const [periodo, setPeriodo] =
    useState<FiltroPeriodo>("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarAgenda();

      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar os dados financeiros.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const agendamentosFiltrados = useMemo(() => {
    if (periodo === "mesAtual") {
      return agendamentos.filter((agendamento) =>
        estaNoMesAtual(agendamento.inicio),
      );
    }

    if (periodo === "ultimos30") {
      return agendamentos.filter((agendamento) =>
        estaNosUltimos30Dias(agendamento.inicio),
      );
    }

    return agendamentos;
  }, [agendamentos, periodo]);

  const resumo = useMemo(() => {
    const concluidos = agendamentosFiltrados.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    );

    const previstos = agendamentosFiltrados.filter((agendamento) =>
      ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status),
    );

    const perdidos = agendamentosFiltrados.filter((agendamento) =>
      [
        "RECUSADO",
        "CANCELADO_CLIENTE",
        "CANCELADO_FUNCIONARIO",
        "FALTOU",
      ].includes(agendamento.status),
    );

    const receitaRealizada = concluidos.reduce(
      (total, agendamento) =>
        total + obterValorRealizado(agendamento),
      0,
    );

    const receitaPrevista = previstos.reduce(
      (total, agendamento) =>
        total + agendamento.servico.precoCentavos,
      0,
    );

    const receitaPerdida = perdidos.reduce(
      (total, agendamento) =>
        total + agendamento.servico.precoCentavos,
      0,
    );

    const ticketMedio =
      concluidos.length > 0
        ? Math.round(receitaRealizada / concluidos.length)
        : 0;

    return {
      total: agendamentosFiltrados.length,
      concluidos: concluidos.length,
      previstos: previstos.length,
      perdidos: perdidos.length,
      receitaRealizada,
      receitaPrevista,
      receitaPerdida,
      ticketMedio,
    };
  }, [agendamentosFiltrados]);

  const faturamentoPorPagamento = useMemo(() => {
    const mapa = new Map<
      string,
      {
        formaPagamento: string;
        quantidade: number;
        valor: number;
      }
    >();

    const concluidos = agendamentosFiltrados.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    );

    for (const agendamento of concluidos) {
      const chave =
        agendamento.formaPagamento ?? "NAO_INFORMADO";

      const registro =
        mapa.get(chave) ??
        {
          formaPagamento: chave,
          quantidade: 0,
          valor: 0,
        };

      registro.quantidade += 1;
      registro.valor += obterValorRealizado(agendamento);

      mapa.set(chave, registro);
    }

    return [...mapa.values()].sort((a, b) => b.valor - a.valor);
  }, [agendamentosFiltrados]);

  const ultimosMovimentos = useMemo(
    () =>
      [...agendamentosFiltrados]
        .sort(
          (a, b) =>
            new Date(b.atualizadoEm).getTime() -
            new Date(a.atualizadoEm).getTime(),
        )
        .slice(0, 10),
    [agendamentosFiltrados],
  );

  const filtros = [
    {
      label: "Tudo",
      value: "todos" as const,
    },
    {
      label: "Mês atual",
      value: "mesAtual" as const,
    },
    {
      label: "Últimos 30 dias",
      value: "ultimos30" as const,
    },
  ];

  const cards = [
    {
      label: "Realizado",
      value: formatarMoeda(resumo.receitaRealizada),
      icon: DollarSign,
      descricao: "Somente pagamentos de atendimentos concluídos.",
    },
    {
      label: "Previsto",
      value: formatarMoeda(resumo.receitaPrevista),
      icon: TrendingUp,
      descricao: "Solicitados e confirmados ainda não recebidos.",
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(resumo.ticketMedio),
      icon: Receipt,
      descricao: "Média recebida por atendimento concluído.",
    },
    {
      label: "Perdido",
      value: formatarMoeda(resumo.receitaPerdida),
      icon: XCircle,
      descricao: "Recusas, cancelamentos ou faltas.",
    },
  ];

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Financeiro"
        subtitle="Acompanhe o faturamento por período, status e forma de pagamento."
        actions={
          <Link
            to="/admin/agenda"
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated"
          >
            Ver agenda
          </Link>
        }
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {filtros.map((filtro) => {
          const ativo = periodo === filtro.value;

          return (
            <button
              key={filtro.value}
              type="button"
              onClick={() => setPeriodo(filtro.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                ativo
                  ? "border-gold bg-gold-soft text-gold"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
              }`}
            >
              {filtro.label}
            </button>
          );
        })}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <section
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {card.label}
              </span>

              <card.icon className="h-4 w-4 text-gold" />
            </div>

            <div className="mt-3 text-2xl font-display">
              {carregando ? "..." : card.value}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {card.descricao}
            </p>
          </section>
        ))}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Total
            </span>

            <BarChart3 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.total}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            registros filtrados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Concluídos
            </span>

            <CheckCircle2 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.concluidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            pagos/registrados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Em aberto
            </span>

            <Clock className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.previstos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            solicitados ou confirmados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Perdidos
            </span>

            <XCircle className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.perdidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            não realizados
          </p>
        </section>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Faturamento por pagamento
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Considera apenas atendimentos concluídos.
              </p>
            </div>

            <Wallet className="h-4 w-4 text-gold" />
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Carregando pagamentos...
            </div>
          ) : faturamentoPorPagamento.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Nenhum pagamento registrado no período.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {faturamentoPorPagamento.map((item) => (
                <article
                  key={item.formaPagamento}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <h3 className="flex items-center gap-2 font-medium">
                      <CreditCard className="h-4 w-4 text-gold" />
                      {traduzirFormaPagamento(
                        item.formaPagamento,
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.quantidade} atendimento
                      {item.quantidade === 1 ? "" : "s"}
                    </p>
                  </div>

                  <p className="text-right font-display">
                    {formatarMoeda(item.valor)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Últimos movimentos financeiros
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Valores realizados usam o pagamento registrado pelo funcionário.
              </p>
            </div>

            <CalendarClock className="h-4 w-4 text-gold" />
          </div>

          {carregando ? (
            <div className="px-6 py-10">
              <p className="text-sm text-muted-foreground">
                Carregando movimentações...
              </p>
            </div>
          ) : ultimosMovimentos.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
              <Receipt className="h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-display">
                Nenhum movimento financeiro
              </h3>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Quando houver agendamentos, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ultimosMovimentos.map((agendamento) => {
                const valorMovimento =
                  agendamento.status === "CONCLUIDO"
                    ? obterValorRealizado(agendamento)
                    : agendamento.servico.precoCentavos;

                return (
                  <article
                    key={agendamento.id}
                    className="px-6 py-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-medium">
                            {agendamento.servico.nome}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${obterClasseStatus(
                              agendamento.status,
                            )}`}
                          >
                            {traduzirStatus(agendamento.status)}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          <p>
                            {formatarDataHora(agendamento.inicio)}
                          </p>

                          <p>
                            Cliente: {agendamento.cliente.nome}
                          </p>

                          <p>
                            Profissional:{" "}
                            {agendamento.profissional.nome}
                          </p>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Pagamento:{" "}
                          {agendamento.status === "CONCLUIDO"
                            ? traduzirFormaPagamento(
                                agendamento.formaPagamento,
                              )
                            : "ainda não recebido"}
                        </p>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="text-lg font-display">
                          {formatarMoeda(valorMovimento)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {agendamento.status === "CONCLUIDO"
                            ? "realizado"
                            : agendamento.status === "SOLICITADO" ||
                                agendamento.status === "CONFIRMADO"
                              ? "previsto"
                              : "não realizado"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Scissors className="h-5 w-5 text-gold" />

          <div>
            <h2 className="text-sm font-medium">
              Regra atual do financeiro
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Atendimento concluído conta pelo valor realmente recebido.
              Atendimento solicitado ou confirmado entra como previsto.
              Recusas, cancelamentos e faltas entram como perda estimada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}