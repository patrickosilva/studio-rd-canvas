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
  DollarSign,
  Receipt,
  Scissors,
  TrendingUp,
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
  criadoEm: string | Date;
  atualizadoEm: string | Date;
  formaPagamento: string | null;
  valorPagoCentavos: number | null;
  pagoEm: string | Date | null;
  observacaoPagamento: string | null;

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

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
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
  };

  if (!formaPagamento) {
    return "Não informado";
  }

  return mapa[formaPagamento] ?? formaPagamento;
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

  if (
    status === "RECUSADO" ||
    status === "CANCELADO_CLIENTE" ||
    status === "CANCELADO_FUNCIONARIO" ||
    status === "FALTOU"
  ) {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-surface-elevated text-muted-foreground";
}

function estaNoMesAtual(valor: string | Date): boolean {
  const data = new Date(valor);
  const hoje = new Date();

  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth()
  );
}

function FinanceiroPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);

  const [agendamentos, setAgendamentos] = useState<
    AgendamentoFinanceiro[]
  >([]);
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

  const resumo = useMemo(() => {
    const concluidos = agendamentos.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    );

    const concluidosMesAtual = concluidos.filter((agendamento) =>
      estaNoMesAtual(agendamento.inicio),
    );

    const previstos = agendamentos.filter((agendamento) =>
      ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status),
    );

    const perdidos = agendamentos.filter((agendamento) =>
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

    const receitaRealizadaMesAtual = concluidosMesAtual.reduce(
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
      concluidos: concluidos.length,
      concluidosMesAtual: concluidosMesAtual.length,
      previstos: previstos.length,
      perdidos: perdidos.length,
      receitaRealizada,
      receitaRealizadaMesAtual,
      receitaPrevista,
      receitaPerdida,
      ticketMedio,
    };
  }, [agendamentos]);

  const ultimosMovimentos = useMemo(
    () =>
      [...agendamentos]
        .sort(
          (a, b) =>
            new Date(b.atualizadoEm).getTime() -
            new Date(a.atualizadoEm).getTime(),
        )
        .slice(0, 8),
    [agendamentos],
  );

  const cards = [
    {
      label: "Realizado total",
      value: formatarMoeda(resumo.receitaRealizada),
      icon: DollarSign,
      descricao: "Somente atendimentos concluídos.",
    },
    {
      label: "Realizado no mês",
      value: formatarMoeda(resumo.receitaRealizadaMesAtual),
      icon: TrendingUp,
      descricao: "Concluídos no mês atual.",
    },
    {
      label: "Receita prevista",
      value: formatarMoeda(resumo.receitaPrevista),
      icon: BarChart3,
      descricao: "Solicitados + confirmados.",
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(resumo.ticketMedio),
      icon: Receipt,
      descricao: "Média por atendimento concluído.",
    },
  ];

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Financeiro"
        subtitle="Acompanhe o faturamento operacional com base nos agendamentos."
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
              Concluídos
            </span>

            <CheckCircle2 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.concluidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            atendimentos finalizados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Concluídos no mês
            </span>

            <Scissors className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.concluidosMesAtual}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            realizados neste mês
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
            recusados, cancelados ou faltas
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-medium">
              Últimos movimentos financeiros
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Baseado nos agendamentos e seus status atuais.
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
              Quando houver agendamentos solicitados, confirmados ou
              concluídos, eles aparecerão aqui.
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

                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
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

                      <p className="mt-1 text-xs text-muted-foreground">
                        Pagamento:{" "}
                        {agendamento.status === "CONCLUIDO"
                          ? traduzirFormaPagamento(agendamento.formaPagamento)
                          : "ainda não recebido"}
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
  );
}