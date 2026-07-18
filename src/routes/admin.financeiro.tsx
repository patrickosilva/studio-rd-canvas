import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  FileBarChart,
  Receipt,
  Printer,
  Scissors,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { adminListarAgenda } from "@/lib/api/agendamento.functions";
import { adminListarPagamentosAssinatura } from "@/lib/api/assinatura.functions";

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

type PagamentoAssinatura = {
  id: string;
  formaPagamento:
  | "PIX"
  | "DINHEIRO"
  | "CARTAO_DEBITO"
  | "CARTAO_CREDITO"
  | "ASSINATURA"
  | "CORTESIA"
  | "OUTRO";
  valorCentavos: number;
  pagoEm: string | Date;
  observacao: string | null;

  assinatura: {
    id: string;
    status: string;

    cliente: {
      id: string;
      nome: string;
      email: string;
      telefone: string | null;
    };

    plano: {
      id: string;
      nome: string;
      precoCentavos: number;
    };
  };
};

type FiltroPeriodo =
  | "hoje"
  | "semanaAtual"
  | "ultimos7"
  | "mesAtual";

type MovimentoFinanceiro = {
  id: string;
  tipo: "ATENDIMENTO" | "ASSINATURA";
  data: string | Date;
  titulo: string;
  cliente: string;
  detalhe: string;
  formaPagamento: string | null;
  valorCentavos: number;
};

function FinanceiroPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);
  const listarPagamentosAssinatura = useServerFn(
    adminListarPagamentosAssinatura,
  );

  const [agendamentos, setAgendamentos] = useState<
    AgendamentoFinanceiro[]
  >([]);
  const [pagamentosAssinatura, setPagamentosAssinatura] = useState<
    PagamentoAssinatura[]
  >([]);
  const [periodo, setPeriodo] =
    useState<FiltroPeriodo>("semanaAtual");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [agendaResposta, pagamentosAssinaturaResposta] =
        await Promise.all([
          carregarAgenda(),
          listarPagamentosAssinatura(),
        ]);

      setAgendamentos(agendaResposta as AgendamentoFinanceiro[]);
      setPagamentosAssinatura(
        pagamentosAssinaturaResposta as PagamentoAssinatura[],
      );
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

  const intervaloPeriodo = useMemo(
    () => obterIntervaloPeriodo(periodo),
    [periodo],
  );

  const agendamentosNoPeriodo = useMemo(() => {
    return agendamentos.filter((agendamento) =>
      estaEntreDatas(
        agendamento.inicio,
        intervaloPeriodo.inicio,
        intervaloPeriodo.fim,
      ),
    );
  }, [agendamentos, intervaloPeriodo]);

  const agendamentosRecebidosNoPeriodo = useMemo(() => {
    return agendamentos.filter((agendamento) => {
      if (agendamento.status !== "CONCLUIDO") {
        return false;
      }

      return estaEntreDatas(
        obterDataFinanceiraAgendamento(agendamento),
        intervaloPeriodo.inicio,
        intervaloPeriodo.fim,
      );
    });
  }, [agendamentos, intervaloPeriodo]);

  const pagamentosAssinaturaFiltrados = useMemo(() => {
    return pagamentosAssinatura.filter((pagamento) =>
      estaEntreDatas(
        pagamento.pagoEm,
        intervaloPeriodo.inicio,
        intervaloPeriodo.fim,
      ),
    );
  }, [pagamentosAssinatura, intervaloPeriodo]);

  const resumo = useMemo(() => {
    const previstos = agendamentosNoPeriodo.filter((agendamento) =>
      ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status),
    );

    const perdidos = agendamentosNoPeriodo.filter((agendamento) =>
      [
        "RECUSADO",
        "CANCELADO_CLIENTE",
        "CANCELADO_FUNCIONARIO",
        "FALTOU",
      ].includes(agendamento.status),
    );

    const receitaAtendimentos =
      agendamentosRecebidosNoPeriodo.reduce(
        (total, agendamento) =>
          total + obterValorRealizado(agendamento),
        0,
      );

    const receitaAssinaturas =
      pagamentosAssinaturaFiltrados.reduce(
        (total, pagamento) => total + pagamento.valorCentavos,
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

    const receitaRealizada =
      receitaAtendimentos + receitaAssinaturas;

    const quantidadeRecebimentos =
      agendamentosRecebidosNoPeriodo.length +
      pagamentosAssinaturaFiltrados.length;

    const ticketMedio =
      agendamentosRecebidosNoPeriodo.length > 0
        ? Math.round(
          receitaAtendimentos /
          agendamentosRecebidosNoPeriodo.length,
        )
        : 0;

    return {
      totalAgendamentos: agendamentosNoPeriodo.length,
      concluidos: agendamentosRecebidosNoPeriodo.length,
      previstos: previstos.length,
      perdidos: perdidos.length,
      quantidadeAssinaturas: pagamentosAssinaturaFiltrados.length,
      quantidadeRecebimentos,
      receitaAtendimentos,
      receitaAssinaturas,
      receitaRealizada,
      receitaPrevista,
      receitaPerdida,
      ticketMedio,
    };
  }, [
    agendamentosNoPeriodo,
    agendamentosRecebidosNoPeriodo,
    pagamentosAssinaturaFiltrados,
  ]);

  const faturamentoPorPagamento = useMemo(() => {
    const mapa = new Map<
      string,
      {
        formaPagamento: string;
        quantidade: number;
        valor: number;
      }
    >();

    for (const agendamento of agendamentosRecebidosNoPeriodo) {
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

    for (const pagamento of pagamentosAssinaturaFiltrados) {
      const chave = pagamento.formaPagamento;

      const registro =
        mapa.get(chave) ??
        {
          formaPagamento: chave,
          quantidade: 0,
          valor: 0,
        };

      registro.quantidade += 1;
      registro.valor += pagamento.valorCentavos;

      mapa.set(chave, registro);
    }

    return [...mapa.values()].sort((a, b) => b.valor - a.valor);
  }, [
    agendamentosRecebidosNoPeriodo,
    pagamentosAssinaturaFiltrados,
  ]);

  const resumoPorDia = useMemo(() => {
    const dias = criarDiasEntre(
      intervaloPeriodo.inicio,
      intervaloPeriodo.fim,
    );

    return dias.map((dia) => {
      const atendimentosDoDia =
        agendamentosRecebidosNoPeriodo.filter((agendamento) =>
          mesmaData(
            obterDataFinanceiraAgendamento(agendamento),
            dia,
          ),
        );

      const assinaturasDoDia =
        pagamentosAssinaturaFiltrados.filter((pagamento) =>
          mesmaData(pagamento.pagoEm, dia),
        );

      const previstosDoDia = agendamentosNoPeriodo.filter(
        (agendamento) =>
          ["SOLICITADO", "CONFIRMADO"].includes(
            agendamento.status,
          ) && mesmaData(agendamento.inicio, dia),
      );

      const perdidosDoDia = agendamentosNoPeriodo.filter(
        (agendamento) =>
          [
            "RECUSADO",
            "CANCELADO_CLIENTE",
            "CANCELADO_FUNCIONARIO",
            "FALTOU",
          ].includes(agendamento.status) &&
          mesmaData(agendamento.inicio, dia),
      );

      const receitaAtendimentos = atendimentosDoDia.reduce(
        (total, agendamento) =>
          total + obterValorRealizado(agendamento),
        0,
      );

      const receitaAssinaturas = assinaturasDoDia.reduce(
        (total, pagamento) => total + pagamento.valorCentavos,
        0,
      );

      const receitaPrevista = previstosDoDia.reduce(
        (total, agendamento) =>
          total + agendamento.servico.precoCentavos,
        0,
      );

      const receitaPerdida = perdidosDoDia.reduce(
        (total, agendamento) =>
          total + agendamento.servico.precoCentavos,
        0,
      );

      return {
        data: dia,
        label: formatarDataCurta(dia),
        atendimentos: atendimentosDoDia.length,
        assinaturas: assinaturasDoDia.length,
        previstos: previstosDoDia.length,
        receitaRealizada: receitaAtendimentos + receitaAssinaturas,
        receitaPrevista,
        receitaPerdida,
      };
    });
  }, [
    agendamentosNoPeriodo,
    agendamentosRecebidosNoPeriodo,
    pagamentosAssinaturaFiltrados,
    intervaloPeriodo,
  ]);

  const movimentosFinanceiros = useMemo<MovimentoFinanceiro[]>(() => {
    const movimentosAtendimentos =
      agendamentosRecebidosNoPeriodo.map((agendamento) => ({
        id: `agendamento-${agendamento.id}`,
        tipo: "ATENDIMENTO" as const,
        data: obterDataFinanceiraAgendamento(agendamento),
        titulo: agendamento.servico.nome,
        cliente: agendamento.cliente.nome,
        detalhe: `Profissional: ${agendamento.profissional.nome}`,
        formaPagamento: agendamento.formaPagamento,
        valorCentavos: obterValorRealizado(agendamento),
      }));

    const movimentosAssinaturas =
      pagamentosAssinaturaFiltrados.map((pagamento) => ({
        id: `assinatura-${pagamento.id}`,
        tipo: "ASSINATURA" as const,
        data: pagamento.pagoEm,
        titulo: `Assinatura ${pagamento.assinatura.plano.nome}`,
        cliente: pagamento.assinatura.cliente.nome,
        detalhe:
          pagamento.observacao ||
          `Plano com status ${pagamento.assinatura.status}`,
        formaPagamento: pagamento.formaPagamento,
        valorCentavos: pagamento.valorCentavos,
      }));

    return [
      ...movimentosAtendimentos,
      ...movimentosAssinaturas,
    ].sort(
      (a, b) =>
        new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [
    agendamentosRecebidosNoPeriodo,
    pagamentosAssinaturaFiltrados,
  ]);

  const ultimosMovimentos = useMemo(
    () => movimentosFinanceiros.slice(0, 10),
    [movimentosFinanceiros],
  );

  const filtros = [
    {
      label: "Hoje",
      value: "hoje" as const,
    },
    {
      label: "Semana atual",
      value: "semanaAtual" as const,
    },
    {
      label: "Últimos 7 dias",
      value: "ultimos7" as const,
    },
    {
      label: "Mês atual",
      value: "mesAtual" as const,
    },
  ];

  const cards = [
    {
      label: "Realizado",
      value: formatarMoeda(resumo.receitaRealizada),
      icon: DollarSign,
      descricao: "Caixa recebido no período.",
    },
    {
      label: "Atendimentos",
      value: formatarMoeda(resumo.receitaAtendimentos),
      icon: Scissors,
      descricao: "Serviços concluídos e pagos.",
    },
    {
      label: "Assinaturas",
      value: formatarMoeda(resumo.receitaAssinaturas),
      icon: Crown,
      descricao: "Planos RD Black recebidos.",
    },
    {
      label: "Previsto",
      value: formatarMoeda(resumo.receitaPrevista),
      icon: TrendingUp,
      descricao: "Solicitados e confirmados.",
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(resumo.ticketMedio),
      icon: Receipt,
      descricao: "Média dos atendimentos pagos.",
    },
    {
      label: "Perdido",
      value: formatarMoeda(resumo.receitaPerdida),
      icon: XCircle,
      descricao: "Cancelamentos, recusas e faltas.",
    },
  ];

  function handleExportarCsv() {
    exportarMovimentosFinanceiros(
      movimentosFinanceiros,
      intervaloPeriodo.rotulo,
    );
  }

  function handleExportarPdf() {
    abrirRelatorioFinanceiroPdf({
      periodo: intervaloPeriodo.rotulo,
      intervalo: formatarIntervalo(
        intervaloPeriodo.inicio,
        intervaloPeriodo.fim,
      ),
      resumo,
      resumoPorDia,
      faturamentoPorPagamento,
      movimentos: movimentosFinanceiros,
    });
  }

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Financeiro"
        subtitle={`Caixa do período: ${formatarIntervalo(
          intervaloPeriodo.inicio,
          intervaloPeriodo.fim,
        )}. Para histórico completo, use a aba Relatórios.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportarPdf}
              disabled={movimentosFinanceiros.length === 0}
              className="inline-flex h-10 items-center rounded-full border border-gold bg-gold-soft px-5 text-sm text-gold transition hover:bg-gold-soft/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir / PDF
            </button>

            <button
              type="button"
              onClick={handleExportarCsv}
              disabled={movimentosFinanceiros.length === 0}
              className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </button>
            <a
              href="/admin/relatorios"
              className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated"
            >
              <FileBarChart className="mr-2 h-4 w-4" />
              Ver relatório completo
            </a>

            <a
              href="/admin/agenda"
              className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated"
            >
              Ver agenda
            </a>
          </div>
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
              className={`rounded-full border px-4 py-2 text-sm transition ${ativo
                  ? "border-gold bg-gold-soft text-gold"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
                }`}
            >
              {filtro.label}
            </button>
          );
        })}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              Agendamentos
            </span>

            <BarChart3 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.totalAgendamentos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            no período selecionado
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
            atendimentos recebidos
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
              Assinaturas
            </span>

            <Crown className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.quantidadeAssinaturas}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            pagamentos de plano
          </p>
        </section>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Resumo diário do período
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Ideal para fechar o caixa da semana sem olhar o
                histórico inteiro.
              </p>
            </div>

            <CalendarClock className="h-4 w-4 text-gold" />
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Carregando resumo diário...
            </div>
          ) : (
            <div className="max-h-[520px] divide-y divide-border overflow-y-auto">
              {resumoPorDia.map((dia) => (
                <article
                  key={dia.data.toISOString()}
                  className="grid gap-4 px-6 py-4 md:grid-cols-[1fr_auto_auto_auto]"
                >
                  <div>
                    <h3 className="font-medium">{dia.label}</h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {dia.atendimentos} atendimento
                      {dia.atendimentos === 1 ? "" : "s"} pago
                      {dia.atendimentos === 1 ? "" : "s"} ·{" "}
                      {dia.assinaturas} assinatura
                      {dia.assinaturas === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">
                      Realizado
                    </p>
                    <p className="font-medium">
                      {formatarMoeda(dia.receitaRealizada)}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">
                      Previsto
                    </p>
                    <p className="font-medium">
                      {formatarMoeda(dia.receitaPrevista)}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">
                      Perdido
                    </p>
                    <p className="font-medium">
                      {formatarMoeda(dia.receitaPerdida)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Formas de pagamento
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Atendimentos pagos e assinaturas recebidas.
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
                      {item.quantidade} recebimento
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
      </div>

      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-medium">
              Últimos recebimentos do período
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Lista curta para conferência rápida do caixa.
            </p>
          </div>

          <Receipt className="h-4 w-4 text-gold" />
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
              Nenhum recebimento no período
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Quando houver atendimento concluído ou assinatura paga,
              o movimento aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ultimosMovimentos.map((movimento) => (
              <article key={movimento.id} className="px-6 py-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-medium">
                        {movimento.titulo}
                      </h3>

                      <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        {movimento.tipo === "ASSINATURA"
                          ? "Assinatura"
                          : "Atendimento"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <p>{formatarDataHora(movimento.data)}</p>

                      <p>Cliente: {movimento.cliente}</p>

                      <p>{movimento.detalhe}</p>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Pagamento:{" "}
                      {traduzirFormaPagamento(
                        movimento.formaPagamento,
                      )}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-lg font-display">
                      {formatarMoeda(movimento.valorCentavos)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      recebido
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Scissors className="h-5 w-5 text-gold" />

          <div>
            <h2 className="text-sm font-medium">
              Regra atual do financeiro
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Esta tela funciona como caixa do período. Atendimento
              concluído entra pelo valor recebido. Assinatura entra no
              dia do pagamento. Solicitações e confirmações entram como
              previsão. Cancelamentos, recusas e faltas entram como
              perda estimada. Para análise histórica completa, use a
              aba Relatórios.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function obterDataFinanceiraAgendamento(
  agendamento: AgendamentoFinanceiro,
): string | Date {
  return agendamento.pagoEm ?? agendamento.inicio;
}

function obterValorRealizado(
  agendamento: AgendamentoFinanceiro,
): number {
  return (
    agendamento.valorPagoCentavos ??
    agendamento.servico.precoCentavos
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
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function formatarDataCurta(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(data);
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

function inicioDoDia(data: Date): Date {
  const novaData = new Date(data);

  novaData.setHours(0, 0, 0, 0);

  return novaData;
}

function fimDoDia(data: Date): Date {
  const novaData = new Date(data);

  novaData.setHours(23, 59, 59, 999);

  return novaData;
}

function inicioDaSemana(data: Date): Date {
  const novaData = inicioDoDia(data);
  const diaSemana = novaData.getDay();
  const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

  novaData.setDate(novaData.getDate() + diferenca);

  return novaData;
}

function fimDaSemana(data: Date): Date {
  const inicio = inicioDaSemana(data);
  const fim = new Date(inicio);

  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);

  return fim;
}

function inicioDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function fimDoMes(data: Date): Date {
  return new Date(
    data.getFullYear(),
    data.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
}

function obterIntervaloPeriodo(periodo: FiltroPeriodo) {
  const agora = new Date();

  if (periodo === "hoje") {
    return {
      inicio: inicioDoDia(agora),
      fim: fimDoDia(agora),
      rotulo: "Hoje",
    };
  }

  if (periodo === "ultimos7") {
    const inicio = inicioDoDia(agora);

    inicio.setDate(inicio.getDate() - 6);

    return {
      inicio,
      fim: fimDoDia(agora),
      rotulo: "Últimos 7 dias",
    };
  }

  if (periodo === "mesAtual") {
    return {
      inicio: inicioDoMes(agora),
      fim: fimDoMes(agora),
      rotulo: "Mês atual",
    };
  }

  return {
    inicio: inicioDaSemana(agora),
    fim: fimDaSemana(agora),
    rotulo: "Semana atual",
  };
}

function estaEntreDatas(
  valor: string | Date,
  inicio: Date,
  fim: Date,
): boolean {
  const data = new Date(valor);

  return data >= inicio && data <= fim;
}

function mesmaData(valor: string | Date, referencia: Date): boolean {
  const data = new Date(valor);

  return (
    data.getFullYear() === referencia.getFullYear() &&
    data.getMonth() === referencia.getMonth() &&
    data.getDate() === referencia.getDate()
  );
}

function criarDiasEntre(inicio: Date, fim: Date): Date[] {
  const dias: Date[] = [];
  const cursor = inicioDoDia(inicio);
  const limite = fimDoDia(fim);

  while (cursor <= limite && dias.length <= 40) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dias;
}

function formatarIntervalo(inicio: Date, fim: Date): string {
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${formatador.format(inicio)} até ${formatador.format(
    fim,
  )}`;
}

function normalizarValorCsv(
  valor: string | number | null | undefined,
): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);

  return `"${texto.replace(/"/g, '""')}"`;
}

function exportarMovimentosFinanceiros(
  movimentos: MovimentoFinanceiro[],
  rotuloPeriodo: string,
) {
  const linhas = [
    [
      "Período",
      "Tipo",
      "Data",
      "Cliente",
      "Descrição",
      "Detalhe",
      "Forma de pagamento",
      "Valor",
    ],
    ...movimentos.map((movimento) => [
      rotuloPeriodo,
      movimento.tipo,
      formatarDataHora(movimento.data),
      movimento.cliente,
      movimento.titulo,
      movimento.detalhe,
      traduzirFormaPagamento(movimento.formaPagamento),
      formatarMoeda(movimento.valorCentavos),
    ]),
  ];

  const csv = linhas
    .map((linha) => linha.map(normalizarValorCsv).join(";"))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `financeiro-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
type ResumoFinanceiroPdf = {
  totalAgendamentos: number;
  concluidos: number;
  previstos: number;
  perdidos: number;
  quantidadeAssinaturas: number;
  quantidadeRecebimentos: number;
  receitaAtendimentos: number;
  receitaAssinaturas: number;
  receitaRealizada: number;
  receitaPrevista: number;
  receitaPerdida: number;
  ticketMedio: number;
};

type DiaFinanceiroPdf = {
  data: Date;
  label: string;
  atendimentos: number;
  assinaturas: number;
  previstos: number;
  receitaRealizada: number;
  receitaPrevista: number;
  receitaPerdida: number;
};

type PagamentoFinanceiroPdf = {
  formaPagamento: string;
  quantidade: number;
  valor: number;
};

function escaparHtml(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);

  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function abrirRelatorioFinanceiroPdf({
  periodo,
  intervalo,
  resumo,
  resumoPorDia,
  faturamentoPorPagamento,
  movimentos,
}: {
  periodo: string;
  intervalo: string;
  resumo: ResumoFinanceiroPdf;
  resumoPorDia: DiaFinanceiroPdf[];
  faturamentoPorPagamento: PagamentoFinanceiroPdf[];
  movimentos: MovimentoFinanceiro[];
}) {
  const dataGeracao = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const linhasDias = resumoPorDia
    .map(
      (dia) => `
        <tr>
          <td>${escaparHtml(dia.label)}</td>
          <td>${dia.atendimentos}</td>
          <td>${dia.assinaturas}</td>
          <td>${formatarMoeda(dia.receitaRealizada)}</td>
          <td>${formatarMoeda(dia.receitaPrevista)}</td>
          <td>${formatarMoeda(dia.receitaPerdida)}</td>
        </tr>
      `,
    )
    .join("");

  const linhasPagamentos = faturamentoPorPagamento
    .map(
      (pagamento) => `
        <tr>
          <td>${escaparHtml(
            traduzirFormaPagamento(pagamento.formaPagamento),
          )}</td>
          <td>${pagamento.quantidade}</td>
          <td>${formatarMoeda(pagamento.valor)}</td>
        </tr>
      `,
    )
    .join("");

  const linhasMovimentos = movimentos
    .slice(0, 25)
    .map(
      (movimento) => `
        <tr>
          <td>${escaparHtml(formatarDataHora(movimento.data))}</td>
          <td>${escaparHtml(
            movimento.tipo === "ASSINATURA"
              ? "Assinatura"
              : "Atendimento",
          )}</td>
          <td>${escaparHtml(movimento.cliente)}</td>
          <td>${escaparHtml(movimento.titulo)}</td>
          <td>${escaparHtml(
            traduzirFormaPagamento(movimento.formaPagamento),
          )}</td>
          <td>${formatarMoeda(movimento.valorCentavos)}</td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Relatório financeiro - ${escaparHtml(periodo)}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 32px;
            background: #ffffff;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            line-height: 1.45;
          }

          .cabecalho {
            border-bottom: 3px solid #111111;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }

          .marca {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 0.02em;
          }

          .subtitulo {
            margin-top: 6px;
            color: #555555;
            font-size: 15px;
          }

          .periodo {
            margin-top: 16px;
            padding: 12px 14px;
            border: 1px solid #dddddd;
            border-radius: 10px;
            background: #f7f7f7;
            font-size: 15px;
          }

          h1 {
            margin: 0;
            font-size: 24px;
          }

          h2 {
            margin: 28px 0 12px;
            font-size: 18px;
            border-bottom: 1px solid #dddddd;
            padding-bottom: 6px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 18px;
          }

          .card {
            border: 1px solid #dddddd;
            border-radius: 12px;
            padding: 14px;
            background: #fafafa;
          }

          .card-label {
            color: #555555;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .card-value {
            margin-top: 8px;
            font-size: 22px;
            font-weight: 800;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            page-break-inside: auto;
          }

          th {
            background: #111111;
            color: #ffffff;
            text-align: left;
            font-size: 12px;
            padding: 9px;
          }

          td {
            border-bottom: 1px solid #dddddd;
            padding: 9px;
            vertical-align: top;
          }

          tr {
            page-break-inside: avoid;
          }

          .observacao {
            margin-top: 24px;
            padding: 14px;
            border: 1px solid #dddddd;
            border-radius: 10px;
            background: #f7f7f7;
            color: #444444;
          }

          .rodape {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #dddddd;
            color: #666666;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 18mm;
            }

            button {
              display: none;
            }

            .no-print {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <section class="cabecalho">
          <div class="marca">Studio RD</div>
          <h1>Relatório financeiro do período</h1>

          <div class="subtitulo">
            Documento simples para conferência de caixa, impressão ou PDF.
          </div>

          <div class="periodo">
            <strong>Período:</strong> ${escaparHtml(periodo)}<br />
            <strong>Intervalo:</strong> ${escaparHtml(intervalo)}<br />
            <strong>Gerado em:</strong> ${escaparHtml(dataGeracao)}
          </div>
        </section>

        <section>
          <h2>Resumo financeiro</h2>

          <div class="grid">
            <div class="card">
              <div class="card-label">Receita realizada</div>
              <div class="card-value">${formatarMoeda(
                resumo.receitaRealizada,
              )}</div>
            </div>

            <div class="card">
              <div class="card-label">Atendimentos</div>
              <div class="card-value">${formatarMoeda(
                resumo.receitaAtendimentos,
              )}</div>
            </div>

            <div class="card">
              <div class="card-label">Assinaturas</div>
              <div class="card-value">${formatarMoeda(
                resumo.receitaAssinaturas,
              )}</div>
            </div>

            <div class="card">
              <div class="card-label">Receita prevista</div>
              <div class="card-value">${formatarMoeda(
                resumo.receitaPrevista,
              )}</div>
            </div>

            <div class="card">
              <div class="card-label">Ticket médio</div>
              <div class="card-value">${formatarMoeda(
                resumo.ticketMedio,
              )}</div>
            </div>

            <div class="card">
              <div class="card-label">Perdas estimadas</div>
              <div class="card-value">${formatarMoeda(
                resumo.receitaPerdida,
              )}</div>
            </div>
          </div>
        </section>

        <section>
          <h2>Resumo por dia</h2>

          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Atend.</th>
                <th>Assin.</th>
                <th>Realizado</th>
                <th>Previsto</th>
                <th>Perdido</th>
              </tr>
            </thead>

            <tbody>
              ${linhasDias}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Formas de pagamento</h2>

          <table>
            <thead>
              <tr>
                <th>Forma</th>
                <th>Qtd.</th>
                <th>Valor</th>
              </tr>
            </thead>

            <tbody>
              ${
                linhasPagamentos ||
                '<tr><td colspan="3">Nenhum pagamento registrado.</td></tr>'
              }
            </tbody>
          </table>
        </section>

        <section>
          <h2>Recebimentos do período</h2>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Pagamento</th>
                <th>Valor</th>
              </tr>
            </thead>

            <tbody>
              ${
                linhasMovimentos ||
                '<tr><td colspan="6">Nenhum recebimento registrado.</td></tr>'
              }
            </tbody>
          </table>
        </section>

        <section class="observacao">
          <strong>Regra do relatório:</strong><br />
          Atendimentos concluídos entram pelo valor recebido. Assinaturas entram no dia do pagamento.
          Solicitações e confirmações aparecem como receita prevista. Cancelamentos, recusas e faltas
          aparecem como perda estimada.
        </section>

        <footer class="rodape">
          Relatório gerado pelo sistema Studio RD.
        </footer>

        <script>
          window.addEventListener("load", () => {
            window.print();
          });
        </script>
      </body>
    </html>
  `;

  const janela = window.open("", "_blank");

  if (!janela) {
    alert(
      "Não foi possível abrir o relatório. Verifique se o navegador bloqueou pop-ups.",
    );

    return;
  }

  janela.document.open();
  janela.document.write(html);
  janela.document.close();
}