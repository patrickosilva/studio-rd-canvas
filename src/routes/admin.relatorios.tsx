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
  Filter,
  Scissors,
  TrendingUp,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { adminListarAgenda } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/admin/relatorios")({
  component: RelatoriosPage,
});

type AgendamentoRelatorio = {
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

function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(valor);
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
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
  agendamento: AgendamentoRelatorio,
): number {
  return (
    agendamento.valorPagoCentavos ??
    agendamento.servico.precoCentavos
  );
}

function obterValorParaRelatorio(
  agendamento: AgendamentoRelatorio,
): number {
  if (agendamento.status === "CONCLUIDO") {
    return obterValorRealizado(agendamento);
  }

  return agendamento.servico.precoCentavos;
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

function criarRankingPorServico(agendamentos: AgendamentoRelatorio[]) {
  const mapa = new Map<
    string,
    {
      id: string;
      nome: string;
      total: number;
      concluidos: number;
      receitaRealizada: number;
      receitaPrevista: number;
    }
  >();

  for (const agendamento of agendamentos) {
    const registro =
      mapa.get(agendamento.servico.id) ??
      {
        id: agendamento.servico.id,
        nome: agendamento.servico.nome,
        total: 0,
        concluidos: 0,
        receitaRealizada: 0,
        receitaPrevista: 0,
      };

    registro.total += 1;

    if (agendamento.status === "CONCLUIDO") {
      registro.concluidos += 1;
      registro.receitaRealizada += obterValorRealizado(agendamento);
    }

    if (
      agendamento.status === "SOLICITADO" ||
      agendamento.status === "CONFIRMADO"
    ) {
      registro.receitaPrevista += agendamento.servico.precoCentavos;
    }

    mapa.set(agendamento.servico.id, registro);
  }

  return [...mapa.values()].sort(
    (a, b) =>
      b.receitaRealizada - a.receitaRealizada ||
      b.total - a.total,
  );
}

function criarRankingPorProfissional(
  agendamentos: AgendamentoRelatorio[],
) {
  const mapa = new Map<
    string,
    {
      id: string;
      nome: string;
      total: number;
      solicitados: number;
      confirmados: number;
      concluidos: number;
      receitaRealizada: number;
      receitaPrevista: number;
    }
  >();

  for (const agendamento of agendamentos) {
    const registro =
      mapa.get(agendamento.profissional.id) ??
      {
        id: agendamento.profissional.id,
        nome: agendamento.profissional.nome,
        total: 0,
        solicitados: 0,
        confirmados: 0,
        concluidos: 0,
        receitaRealizada: 0,
        receitaPrevista: 0,
      };

    registro.total += 1;

    if (agendamento.status === "SOLICITADO") {
      registro.solicitados += 1;
      registro.receitaPrevista += agendamento.servico.precoCentavos;
    }

    if (agendamento.status === "CONFIRMADO") {
      registro.confirmados += 1;
      registro.receitaPrevista += agendamento.servico.precoCentavos;
    }

    if (agendamento.status === "CONCLUIDO") {
      registro.concluidos += 1;
      registro.receitaRealizada += obterValorRealizado(agendamento);
    }

    mapa.set(agendamento.profissional.id, registro);
  }

  return [...mapa.values()].sort(
    (a, b) =>
      b.receitaRealizada - a.receitaRealizada ||
      b.concluidos - a.concluidos ||
      b.total - a.total,
  );
}

function criarDistribuicaoStatus(
  agendamentos: AgendamentoRelatorio[],
) {
  const mapa = new Map<
    string,
    {
      status: string;
      quantidade: number;
      valor: number;
    }
  >();

  for (const agendamento of agendamentos) {
    const registro =
      mapa.get(agendamento.status) ??
      {
        status: agendamento.status,
        quantidade: 0,
        valor: 0,
      };

    registro.quantidade += 1;
    registro.valor += obterValorParaRelatorio(agendamento);

    mapa.set(agendamento.status, registro);
  }

  return [...mapa.values()].sort(
    (a, b) => b.quantidade - a.quantidade,
  );
}

function criarDistribuicaoPagamento(
  agendamentos: AgendamentoRelatorio[],
) {
  const mapa = new Map<
    string,
    {
      formaPagamento: string;
      quantidade: number;
      valor: number;
    }
  >();

  const concluidos = agendamentos.filter(
    (agendamento) => agendamento.status === "CONCLUIDO",
  );

  for (const agendamento of concluidos) {
    const chave = agendamento.formaPagamento ?? "NAO_INFORMADO";

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
}

function RelatoriosPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);

  const [agendamentos, setAgendamentos] = useState<
    AgendamentoRelatorio[]
  >([]);
  const [periodo, setPeriodo] =
    useState<FiltroPeriodo>("todos");
  const [servicoSelecionado, setServicoSelecionado] =
    useState("todos");
  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState("todos");
  const [pagamentoSelecionado, setPagamentoSelecionado] =
    useState("todos");
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

      setErro("Não foi possível carregar os relatórios.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const servicosDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>();

    for (const agendamento of agendamentos) {
      mapa.set(agendamento.servico.id, agendamento.servico.nome);
    }

    return [...mapa.entries()]
      .map(([id, nome]) => ({
        id,
        nome,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [agendamentos]);

  const profissionaisDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>();

    for (const agendamento of agendamentos) {
      mapa.set(
        agendamento.profissional.id,
        agendamento.profissional.nome,
      );
    }

    return [...mapa.entries()]
      .map(([id, nome]) => ({
        id,
        nome,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [agendamentos]);

  const pagamentosDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>();

    for (const agendamento of agendamentos) {
      if (agendamento.status !== "CONCLUIDO") {
        continue;
      }

      const chave = agendamento.formaPagamento ?? "NAO_INFORMADO";

      mapa.set(chave, traduzirFormaPagamento(chave));
    }

    return [...mapa.entries()]
      .map(([id, nome]) => ({
        id,
        nome,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [agendamentos]);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((agendamento) => {
      if (
        periodo === "mesAtual" &&
        !estaNoMesAtual(agendamento.inicio)
      ) {
        return false;
      }

      if (
        periodo === "ultimos30" &&
        !estaNosUltimos30Dias(agendamento.inicio)
      ) {
        return false;
      }

      if (
        servicoSelecionado !== "todos" &&
        agendamento.servico.id !== servicoSelecionado
      ) {
        return false;
      }

      if (
        profissionalSelecionado !== "todos" &&
        agendamento.profissional.id !== profissionalSelecionado
      ) {
        return false;
      }

      if (pagamentoSelecionado !== "todos") {
        const formaPagamento =
          agendamento.formaPagamento ?? "NAO_INFORMADO";

        return (
          agendamento.status === "CONCLUIDO" &&
          formaPagamento === pagamentoSelecionado
        );
      }

      return true;
    });
  }, [
    agendamentos,
    periodo,
    servicoSelecionado,
    profissionalSelecionado,
    pagamentoSelecionado,
  ]);

  const resumo = useMemo(() => {
    const concluidos = agendamentosFiltrados.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    );

    const emAberto = agendamentosFiltrados.filter((agendamento) =>
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

    const receitaPrevista = emAberto.reduce(
      (total, agendamento) =>
        total + agendamento.servico.precoCentavos,
      0,
    );

    const receitaPerdida = perdidos.reduce(
      (total, agendamento) =>
        total + agendamento.servico.precoCentavos,
      0,
    );

    const taxaConclusao =
      agendamentosFiltrados.length > 0
        ? concluidos.length / agendamentosFiltrados.length
        : 0;

    const ticketMedio =
      concluidos.length > 0
        ? Math.round(receitaRealizada / concluidos.length)
        : 0;

    return {
      total: agendamentosFiltrados.length,
      concluidos: concluidos.length,
      emAberto: emAberto.length,
      perdidos: perdidos.length,
      receitaRealizada,
      receitaPrevista,
      receitaPerdida,
      taxaConclusao,
      ticketMedio,
    };
  }, [agendamentosFiltrados]);

  const rankingServicos = useMemo(
    () => criarRankingPorServico(agendamentosFiltrados),
    [agendamentosFiltrados],
  );

  const rankingProfissionais = useMemo(
    () => criarRankingPorProfissional(agendamentosFiltrados),
    [agendamentosFiltrados],
  );

  const distribuicaoStatus = useMemo(
    () => criarDistribuicaoStatus(agendamentosFiltrados),
    [agendamentosFiltrados],
  );

  const distribuicaoPagamento = useMemo(
    () => criarDistribuicaoPagamento(agendamentosFiltrados),
    [agendamentosFiltrados],
  );

  const ultimosRegistros = useMemo(
    () =>
      [...agendamentosFiltrados]
        .sort(
          (a, b) =>
            new Date(b.atualizadoEm).getTime() -
            new Date(a.atualizadoEm).getTime(),
        )
        .slice(0, 8),
    [agendamentosFiltrados],
  );

  const filtrosPeriodo = [
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
      label: "Receita realizada",
      value: formatarMoeda(resumo.receitaRealizada),
      icon: DollarSign,
      descricao: "Somente valores realmente recebidos.",
    },
    {
      label: "Receita prevista",
      value: formatarMoeda(resumo.receitaPrevista),
      icon: TrendingUp,
      descricao: "Solicitados e confirmados.",
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(resumo.ticketMedio),
      icon: BarChart3,
      descricao: "Média dos concluídos.",
    },
    {
      label: "Taxa de conclusão",
      value: formatarPercentual(resumo.taxaConclusao),
      icon: CheckCircle2,
      descricao: "Concluídos sobre o total filtrado.",
    },
  ];

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Relatórios"
        subtitle="Analise desempenho por período, serviço, profissional e forma de pagamento."
        actions={
          <Link
            to="/admin/financeiro"
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated"
          >
            Ver financeiro
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

      <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-5 flex items-center gap-3">
          <Filter className="h-5 w-5 text-gold" />

          <div>
            <h2 className="text-sm font-medium">
              Filtros do relatório
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Use os filtros para analisar recortes específicos da operação.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {filtrosPeriodo.map((filtro) => {
            const ativo = periodo === filtro.value;

            return (
              <button
                key={filtro.value}
                type="button"
                onClick={() => setPeriodo(filtro.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  ativo
                    ? "border-gold bg-gold-soft text-gold"
                    : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
                }`}
              >
                {filtro.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Serviço
            </label>

            <select
              value={servicoSelecionado}
              onChange={(event) =>
                setServicoSelecionado(event.target.value)
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="todos">Todos os serviços</option>

              {servicosDisponiveis.map((servico) => (
                <option
                  key={servico.id}
                  value={servico.id}
                >
                  {servico.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Profissional
            </label>

            <select
              value={profissionalSelecionado}
              onChange={(event) =>
                setProfissionalSelecionado(event.target.value)
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="todos">Todos os profissionais</option>

              {profissionaisDisponiveis.map((profissional) => (
                <option
                  key={profissional.id}
                  value={profissional.id}
                >
                  {profissional.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Forma de pagamento
            </label>

            <select
              value={pagamentoSelecionado}
              onChange={(event) =>
                setPagamentoSelecionado(event.target.value)
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="todos">Todas as formas</option>

              {pagamentosDisponiveis.map((pagamento) => (
                <option
                  key={pagamento.id}
                  value={pagamento.id}
                >
                  {pagamento.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

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
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Total
          </span>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.total}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            registros filtrados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Concluídos
          </span>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.concluidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            atendimentos realizados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Em aberto
          </span>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.emAberto}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            solicitados ou confirmados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Perdidos
          </span>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.perdidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            recusas, cancelamentos ou faltas
          </p>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">
              Desempenho por serviço
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Ranking por receita realizada e quantidade de pedidos.
            </p>
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Carregando serviços...
            </div>
          ) : rankingServicos.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Nenhum dado de serviço encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rankingServicos.map((servico) => (
                <article
                  key={servico.id}
                  className="px-6 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 font-medium">
                        <Scissors className="h-4 w-4 text-gold" />
                        {servico.nome}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {servico.total} pedidos ·{" "}
                        {servico.concluidos} concluídos
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Previsto:{" "}
                        {formatarMoeda(servico.receitaPrevista)}
                      </p>
                    </div>

                    <p className="text-right font-display">
                      {formatarMoeda(servico.receitaRealizada)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">
              Desempenho por profissional
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Receita realizada, pedidos e atendimentos por profissional.
            </p>
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Carregando profissionais...
            </div>
          ) : rankingProfissionais.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Nenhum dado de profissional encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rankingProfissionais.map((profissional) => (
                <article
                  key={profissional.id}
                  className="px-6 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 font-medium">
                        <UserRound className="h-4 w-4 text-gold" />
                        {profissional.nome}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {profissional.total} pedidos ·{" "}
                        {profissional.concluidos} concluídos
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {profissional.solicitados} solicitados ·{" "}
                        {profissional.confirmados} confirmados
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display">
                        {formatarMoeda(
                          profissional.receitaRealizada,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        previsto{" "}
                        {formatarMoeda(
                          profissional.receitaPrevista,
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">
              Distribuição por status
            </h2>
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Carregando status...
            </div>
          ) : distribuicaoStatus.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Nenhum status encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {distribuicaoStatus.map((item) => (
                <article
                  key={item.status}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${obterClasseStatus(
                        item.status,
                      )}`}
                    >
                      {traduzirStatus(item.status)}
                    </span>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.quantidade} registros
                    </p>
                  </div>

                  <p className="font-display">
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
                Distribuição por pagamento
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
          ) : distribuicaoPagamento.length === 0 ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Nenhum pagamento encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {distribuicaoPagamento.map((item) => (
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

                  <p className="font-display">
                    {formatarMoeda(item.valor)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-medium">
              Últimos registros analisados
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Movimentações mais recentes dentro dos filtros selecionados.
            </p>
          </div>

          <CalendarClock className="h-4 w-4 text-gold" />
        </div>

        {carregando ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Carregando registros...
          </div>
        ) : ultimosRegistros.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Nenhum registro encontrado.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ultimosRegistros.map((agendamento) => {
              const valorRegistro =
                agendamento.status === "CONCLUIDO"
                  ? obterValorRealizado(agendamento)
                  : agendamento.servico.precoCentavos;

              return (
                <article
                  key={agendamento.id}
                  className="px-6 py-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatarDataHora(agendamento.inicio)} ·{" "}
                        {agendamento.profissional.nome}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Cliente: {agendamento.cliente.nome}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Pagamento:{" "}
                        {agendamento.status === "CONCLUIDO"
                          ? traduzirFormaPagamento(
                              agendamento.formaPagamento,
                            )
                          : "ainda não recebido"}
                      </p>
                    </div>

                    <p className="font-display">
                      {formatarMoeda(valorRegistro)}
                    </p>
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