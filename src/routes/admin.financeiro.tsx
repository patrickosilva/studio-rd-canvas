import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  CalendarClock,
  CalendarRange,
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { adminListarFinanceiroPeriodo } from "@/lib/api/financeiro.functions";
import { celulaMonetariaCsv, celulaTextoCsv, montarConteudoCsv } from "@/lib/financeiro-csv";
import {
  type AgrupamentoFinanceiro,
  type GranularidadeFinanceira,
  type IntervaloDatasFinanceiro,
  type TipoPeriodoFinanceiro,
  LIMITE_DIAS_PERIODO_FINANCEIRO,
  TIMEZONE_FINANCEIRO,
  calcularPeriodoRapido,
  chaveAgrupamento,
  contarDiasInclusivos,
  criarAgrupamentos,
  dataSaoPaulo,
  definirGranularidade,
  descreverGranularidade,
  formatarIntervaloDatas,
  hojeSaoPaulo,
  validarPeriodoFinanceiro,
} from "@/lib/financeiro-periodo";

export const Route = createFileRoute("/admin/financeiro")({
  component: FinanceiroPage,
});

type RespostaFinanceiro = Awaited<ReturnType<typeof adminListarFinanceiroPeriodo>>;

type AgendamentoFinanceiro = RespostaFinanceiro["agendamentos"][number];

type PeriodoAplicado = IntervaloDatasFinanceiro & {
  tipo: TipoPeriodoFinanceiro;
};

type DadosFinanceiros = {
  periodo: PeriodoAplicado;
  agendamentos: RespostaFinanceiro["agendamentos"];
  pagamentosAssinatura: RespostaFinanceiro["pagamentosAssinatura"];
};

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

type ResumoAgrupamento = {
  chave: string;
  label: string;
  rotuloCurto: string;
  atendimentos: number;
  assinaturas: number;
  previstos: number;
  receitaRealizada: number;
  receitaPrevista: number;
  receitaPerdida: number;
};

const STATUS_PREVISTOS = ["SOLICITADO", "CONFIRMADO"];

const STATUS_PERDIDOS = ["RECUSADO", "CANCELADO_CLIENTE", "CANCELADO_FUNCIONARIO", "FALTOU"];

const QUANTIDADE_ULTIMOS_MOVIMENTOS = 10;

const ROTULOS_PERIODO: Record<TipoPeriodoFinanceiro, string> = {
  hoje: "Hoje",
  semanaAtual: "Semana atual",
  ultimos7: "Últimos 7 dias",
  mesAtual: "Mês atual",
  mesAnterior: "Mês anterior",
  personalizado: "Personalizado",
};

const FILTROS_RAPIDOS: Exclude<TipoPeriodoFinanceiro, "personalizado">[] = [
  "hoje",
  "semanaAtual",
  "ultimos7",
  "mesAtual",
  "mesAnterior",
];

const configuracaoGrafico = {
  receitaRealizada: {
    label: "Realizado",
    color: "var(--gold)",
  },
} satisfies ChartConfig;

function criarPeriodoRapido(
  tipo: Exclude<TipoPeriodoFinanceiro, "personalizado">,
): PeriodoAplicado {
  return {
    tipo,
    ...calcularPeriodoRapido(tipo, hojeSaoPaulo()),
  };
}

function FinanceiroPage() {
  const listarFinanceiroPeriodo = useServerFn(adminListarFinanceiroPeriodo);

  const [periodoAplicado, setPeriodoAplicado] = useState<PeriodoAplicado>(() =>
    criarPeriodoRapido("semanaAtual"),
  );
  const [personalizadoAberto, setPersonalizadoAberto] = useState(false);
  const [rascunho, setRascunho] = useState<IntervaloDatasFinanceiro>(() => ({
    dataInicial: periodoAplicado.dataInicial,
    dataFinal: periodoAplicado.dataFinal,
  }));
  const [erroRascunho, setErroRascunho] = useState("");

  const [dados, setDados] = useState<DadosFinanceiros | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  // Identifica a requisição mais recente. Respostas de consultas anteriores
  // são descartadas para não sobrescrever o período selecionado depois.
  const requisicaoAtual = useRef(0);

  useEffect(() => {
    const idRequisicao = requisicaoAtual.current + 1;

    requisicaoAtual.current = idRequisicao;

    // Nunca exibir valores de outro período enquanto o novo é carregado.
    setDados(null);
    setCarregando(true);
    setErro("");

    listarFinanceiroPeriodo({
      data: {
        dataInicial: periodoAplicado.dataInicial,
        dataFinal: periodoAplicado.dataFinal,
      },
    })
      .then((resposta) => {
        if (idRequisicao !== requisicaoAtual.current) {
          return;
        }

        setDados({
          periodo: periodoAplicado,
          agendamentos: resposta.agendamentos,
          pagamentosAssinatura: resposta.pagamentosAssinatura,
        });
      })
      .catch((error: unknown) => {
        if (idRequisicao !== requisicaoAtual.current) {
          return;
        }

        console.error(error);

        setErro("Não foi possível carregar os dados financeiros do período selecionado.");
      })
      .finally(() => {
        if (idRequisicao === requisicaoAtual.current) {
          setCarregando(false);
        }
      });
  }, [listarFinanceiroPeriodo, periodoAplicado, tentativa]);

  const diasNoPeriodo = contarDiasInclusivos(
    periodoAplicado.dataInicial,
    periodoAplicado.dataFinal,
  );

  const granularidade = definirGranularidade(diasNoPeriodo);

  const intervaloAplicadoTexto = formatarIntervaloDatas(periodoAplicado);

  const validacaoRascunho = validarPeriodoFinanceiro(rascunho.dataInicial, rascunho.dataFinal);

  const rascunhoPendente =
    personalizadoAberto &&
    (periodoAplicado.tipo !== "personalizado" ||
      rascunho.dataInicial !== periodoAplicado.dataInicial ||
      rascunho.dataFinal !== periodoAplicado.dataFinal);

  const agendamentosNoPeriodo = useMemo(() => dados?.agendamentos ?? [], [dados]);

  const pagamentosAssinaturaFiltrados = useMemo(() => dados?.pagamentosAssinatura ?? [], [dados]);

  const agendamentosRecebidosNoPeriodo = useMemo(
    () => agendamentosNoPeriodo.filter((agendamento) => agendamento.status === "CONCLUIDO"),
    [agendamentosNoPeriodo],
  );

  const resumo = useMemo(() => {
    const previstos = agendamentosNoPeriodo.filter((agendamento) =>
      STATUS_PREVISTOS.includes(agendamento.status),
    );

    const perdidos = agendamentosNoPeriodo.filter((agendamento) =>
      STATUS_PERDIDOS.includes(agendamento.status),
    );

    const receitaAtendimentos = agendamentosRecebidosNoPeriodo.reduce(
      (total, agendamento) => total + obterValorRealizado(agendamento),
      0,
    );

    const receitaAssinaturas = pagamentosAssinaturaFiltrados.reduce(
      (total, pagamento) => total + pagamento.valorCentavos,
      0,
    );

    const receitaPrevista = previstos.reduce(
      (total, agendamento) => total + agendamento.servico.precoCentavos,
      0,
    );

    const receitaPerdida = perdidos.reduce(
      (total, agendamento) => total + agendamento.servico.precoCentavos,
      0,
    );

    const receitaRealizada = receitaAtendimentos + receitaAssinaturas;

    const quantidadeRecebimentos =
      agendamentosRecebidosNoPeriodo.length + pagamentosAssinaturaFiltrados.length;

    const ticketMedio =
      agendamentosRecebidosNoPeriodo.length > 0
        ? Math.round(receitaAtendimentos / agendamentosRecebidosNoPeriodo.length)
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
  }, [agendamentosNoPeriodo, agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados]);

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
      const chave = agendamento.formaPagamento ?? "NAO_INFORMADO";

      const registro = mapa.get(chave) ?? {
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

      const registro = mapa.get(chave) ?? {
        formaPagamento: chave,
        quantidade: 0,
        valor: 0,
      };

      registro.quantidade += 1;
      registro.valor += pagamento.valorCentavos;

      mapa.set(chave, registro);
    }

    return [...mapa.values()].sort((a, b) => b.valor - a.valor);
  }, [agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados]);

  const resumoPorAgrupamento = useMemo<ResumoAgrupamento[]>(() => {
    if (!dados) {
      return [];
    }

    const periodoDados = dados.periodo;
    const granularidadeDados = definirGranularidade(
      contarDiasInclusivos(periodoDados.dataInicial, periodoDados.dataFinal),
    );

    const agrupamentos = criarAgrupamentos(periodoDados, granularidadeDados);

    const mapa = new Map<string, ResumoAgrupamento>(
      agrupamentos.map((agrupamento: AgrupamentoFinanceiro) => [
        agrupamento.chave,
        {
          chave: agrupamento.chave,
          label: agrupamento.rotulo,
          rotuloCurto: agrupamento.rotuloCurto,
          atendimentos: 0,
          assinaturas: 0,
          previstos: 0,
          receitaRealizada: 0,
          receitaPrevista: 0,
          receitaPerdida: 0,
        },
      ]),
    );

    function obterRegistro(valor: string | Date) {
      const chave = chaveAgrupamento(
        dataSaoPaulo(valor),
        granularidadeDados,
        periodoDados.dataInicial,
      );

      const registro = mapa.get(chave);

      if (!registro) {
        // O servidor já filtra pelo período; isso indicaria uma inconsistência
        // de datas. Os totais dos cards não dependem deste agrupamento.
        console.warn("Registro financeiro fora do período aplicado.", valor);
      }

      return registro;
    }

    for (const agendamento of agendamentosNoPeriodo) {
      const registro = obterRegistro(obterDataFinanceiraAgendamento(agendamento));

      if (!registro) {
        continue;
      }

      if (agendamento.status === "CONCLUIDO") {
        registro.atendimentos += 1;
        registro.receitaRealizada += obterValorRealizado(agendamento);
      } else if (STATUS_PREVISTOS.includes(agendamento.status)) {
        registro.previstos += 1;
        registro.receitaPrevista += agendamento.servico.precoCentavos;
      } else if (STATUS_PERDIDOS.includes(agendamento.status)) {
        registro.receitaPerdida += agendamento.servico.precoCentavos;
      }
    }

    for (const pagamento of pagamentosAssinaturaFiltrados) {
      const registro = obterRegistro(pagamento.pagoEm);

      if (!registro) {
        continue;
      }

      registro.assinaturas += 1;
      registro.receitaRealizada += pagamento.valorCentavos;
    }

    return [...mapa.values()];
  }, [dados, agendamentosNoPeriodo, pagamentosAssinaturaFiltrados]);

  const movimentosFinanceiros = useMemo<MovimentoFinanceiro[]>(() => {
    const movimentosAtendimentos = agendamentosRecebidosNoPeriodo.map((agendamento) => ({
      id: `agendamento-${agendamento.id}`,
      tipo: "ATENDIMENTO" as const,
      data: obterDataFinanceiraAgendamento(agendamento),
      titulo: agendamento.servico.nome,
      cliente: agendamento.cliente.nome,
      detalhe: `Profissional: ${agendamento.profissional.nome}`,
      formaPagamento: agendamento.formaPagamento,
      valorCentavos: obterValorRealizado(agendamento),
    }));

    const movimentosAssinaturas = pagamentosAssinaturaFiltrados.map((pagamento) => ({
      id: `assinatura-${pagamento.id}`,
      tipo: "ASSINATURA" as const,
      data: pagamento.pagoEm,
      titulo: `Assinatura ${pagamento.assinatura.plano.nome}`,
      cliente: pagamento.assinatura.cliente.nome,
      detalhe: pagamento.observacao || `Plano com status ${pagamento.assinatura.status}`,
      formaPagamento: pagamento.formaPagamento,
      valorCentavos: pagamento.valorCentavos,
    }));

    return [...movimentosAtendimentos, ...movimentosAssinaturas].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados]);

  const ultimosMovimentos = useMemo(
    () => movimentosFinanceiros.slice(0, QUANTIDADE_ULTIMOS_MOVIMENTOS),
    [movimentosFinanceiros],
  );

  const dadosProntos = Boolean(dados) && !carregando && !erro;

  const exportacaoDisponivel = dadosProntos && movimentosFinanceiros.length > 0;

  const valorCard = (valor: string | number) => {
    if (carregando) {
      return "...";
    }

    if (!dadosProntos) {
      return "—";
    }

    return valor;
  };

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

  const contadores = [
    {
      label: "Agendamentos",
      value: resumo.totalAgendamentos,
      icon: BarChart3,
      descricao: "no período selecionado",
    },
    {
      label: "Concluídos",
      value: resumo.concluidos,
      icon: CheckCircle2,
      descricao: "atendimentos recebidos",
    },
    {
      label: "Em aberto",
      value: resumo.previstos,
      icon: Clock,
      descricao: "solicitados ou confirmados",
    },
    {
      label: "Assinaturas",
      value: resumo.quantidadeAssinaturas,
      icon: Crown,
      descricao: "pagamentos de plano",
    },
  ];

  function aplicarFiltroRapido(tipo: Exclude<TipoPeriodoFinanceiro, "personalizado">) {
    setPersonalizadoAberto(false);
    setErroRascunho("");
    setPeriodoAplicado(criarPeriodoRapido(tipo));
  }

  function abrirPersonalizado() {
    setPersonalizadoAberto(true);
    setErroRascunho("");
    setRascunho({
      dataInicial: periodoAplicado.dataInicial,
      dataFinal: periodoAplicado.dataFinal,
    });
  }

  function alterarRascunho(campo: keyof IntervaloDatasFinanceiro, valor: string) {
    setErroRascunho("");
    setRascunho((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function aplicarPersonalizado(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validacao = validarPeriodoFinanceiro(rascunho.dataInicial, rascunho.dataFinal);

    if (!validacao.valido) {
      setErroRascunho(validacao.mensagem);
      return;
    }

    setErroRascunho("");
    setPeriodoAplicado({
      tipo: "personalizado",
      dataInicial: rascunho.dataInicial,
      dataFinal: rascunho.dataFinal,
    });
  }

  function handleExportarCsv() {
    if (!dados || !exportacaoDisponivel) {
      return;
    }

    exportarMovimentosFinanceiros(movimentosFinanceiros, dados.periodo);
  }

  function handleExportarPdf() {
    if (!dados || !exportacaoDisponivel) {
      return;
    }

    const periodoDados = dados.periodo;

    abrirRelatorioFinanceiroPdf({
      periodo: periodoDados,
      granularidade: definirGranularidade(
        contarDiasInclusivos(periodoDados.dataInicial, periodoDados.dataFinal),
      ),
      resumo,
      resumoPorAgrupamento,
      faturamentoPorPagamento,
      movimentos: movimentosFinanceiros,
    });
  }

  const mensagemValidacaoVisivel =
    erroRascunho ||
    (personalizadoAberto && rascunho.dataInicial && rascunho.dataFinal && !validacaoRascunho.valido
      ? validacaoRascunho.mensagem
      : "");

  const filtroAtivo: TipoPeriodoFinanceiro = personalizadoAberto
    ? "personalizado"
    : periodoAplicado.tipo;

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Financeiro"
        subtitle={`Caixa do período: ${intervaloAplicadoTexto}. Para histórico completo, use a aba Relatórios.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportarPdf}
              disabled={!exportacaoDisponivel}
              className="inline-flex h-10 items-center rounded-full border border-gold bg-gold-soft px-5 text-sm text-gold transition hover:bg-gold-soft/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir / PDF
            </button>

            <button
              type="button"
              onClick={handleExportarCsv}
              disabled={!exportacaoDisponivel}
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

      <section className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap gap-2">
          {FILTROS_RAPIDOS.map((tipo) => {
            const ativo = filtroAtivo === tipo;

            return (
              <button
                key={tipo}
                type="button"
                aria-pressed={ativo}
                onClick={() => aplicarFiltroRapido(tipo)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  ativo
                    ? "border-gold bg-gold-soft text-gold"
                    : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
                }`}
              >
                {ROTULOS_PERIODO[tipo]}
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={filtroAtivo === "personalizado"}
            aria-expanded={personalizadoAberto}
            onClick={abrirPersonalizado}
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition ${
              filtroAtivo === "personalizado"
                ? "border-gold bg-gold-soft text-gold"
                : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
            }`}
          >
            <CalendarRange className="mr-2 h-4 w-4" />
            Personalizado
          </button>
        </div>

        {personalizadoAberto && (
          <form
            onSubmit={aplicarPersonalizado}
            noValidate
            className="mt-5 border-t border-border pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-2">
                <label
                  htmlFor="financeiro-data-inicial"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Data inicial
                </label>

                <input
                  id="financeiro-data-inicial"
                  type="date"
                  value={rascunho.dataInicial}
                  max={rascunho.dataFinal || undefined}
                  onChange={(event) => alterarRascunho("dataInicial", event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="financeiro-data-final"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Data final
                </label>

                <input
                  id="financeiro-data-final"
                  type="date"
                  value={rascunho.dataFinal}
                  min={rascunho.dataInicial || undefined}
                  onChange={(event) => alterarRascunho("dataFinal", event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full border border-gold bg-gold-soft px-6 text-sm text-gold transition hover:bg-gold-soft/80"
              >
                Aplicar período
              </button>
            </div>

            {mensagemValidacaoVisivel ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {mensagemValidacaoVisivel}
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                {rascunhoPendente
                  ? "Datas ainda não aplicadas. Clique em “Aplicar período” para atualizar os dados."
                  : `Escolha qualquer intervalo de até ${LIMITE_DIAS_PERIODO_FINANCEIRO} dias, inclusive de anos anteriores ou datas futuras.`}
              </p>
            )}
          </form>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-sm">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Período aplicado
          </span>

          <span className="font-medium text-gold">{ROTULOS_PERIODO[periodoAplicado.tipo]}</span>

          <span className="text-muted-foreground">
            {intervaloAplicadoTexto} · {diasNoPeriodo} {diasNoPeriodo === 1 ? "dia" : "dias"}
          </span>

          {carregando && <span className="text-xs text-muted-foreground">Carregando...</span>}
        </div>
      </section>

      {erro && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{erro}</span>

          <button
            type="button"
            onClick={() => setTentativa((atual) => atual + 1)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-destructive/40 px-4 text-xs transition hover:bg-destructive/10"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <section key={card.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {card.label}
              </span>

              <card.icon className="h-4 w-4 text-gold" />
            </div>

            <div className="mt-3 text-2xl font-display">{valorCard(card.value)}</div>

            <p className="mt-1 text-xs text-muted-foreground">{card.descricao}</p>
          </section>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {contadores.map((contador) => (
          <section key={contador.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {contador.label}
              </span>

              <contador.icon className="h-4 w-4 text-gold" />
            </div>

            <div className="mt-3 text-3xl font-display">{valorCard(contador.value)}</div>

            <p className="mt-1 text-xs text-muted-foreground">{contador.descricao}</p>
          </section>
        ))}
      </div>

      <GraficoEvolucaoReceita
        carregando={carregando}
        disponivel={dadosProntos}
        granularidade={granularidade}
        resumoPorAgrupamento={resumoPorAgrupamento}
        receitaRealizadaTotal={resumo.receitaRealizada}
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Resumo do período {descreverGranularidade(granularidade)}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {granularidade === "dia"
                  ? "Ideal para fechar o caixa sem olhar o histórico inteiro."
                  : "Períodos longos são agrupados para facilitar a leitura. Todos os registros do intervalo são considerados."}
              </p>
            </div>

            <CalendarClock className="h-4 w-4 shrink-0 text-gold" />
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">Carregando resumo...</div>
          ) : !dadosProntos ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Resumo indisponível para este período.
            </div>
          ) : (
            <div className="max-h-[520px] divide-y divide-border overflow-y-auto">
              {resumoPorAgrupamento.map((item) => (
                <article
                  key={item.chave}
                  className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-cols-[1fr_auto_auto_auto]"
                >
                  <div className="col-span-3 md:col-span-1">
                    <h3 className="font-medium">{item.label}</h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.atendimentos} atendimento
                      {item.atendimentos === 1 ? "" : "s"} pago
                      {item.atendimentos === 1 ? "" : "s"} · {item.assinaturas} assinatura
                      {item.assinaturas === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Realizado</p>
                    <p className="font-medium">{formatarMoeda(item.receitaRealizada)}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Previsto</p>
                    <p className="font-medium">{formatarMoeda(item.receitaPrevista)}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Perdido</p>
                    <p className="font-medium">{formatarMoeda(item.receitaPerdida)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">Formas de pagamento</h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Atendimentos pagos e assinaturas recebidas.
              </p>
            </div>

            <Wallet className="h-4 w-4 text-gold" />
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">Carregando pagamentos...</div>
          ) : !dadosProntos ? (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Pagamentos indisponíveis para este período.
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
                      {traduzirFormaPagamento(item.formaPagamento)}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.quantidade} recebimento
                      {item.quantidade === 1 ? "" : "s"}
                    </p>
                  </div>

                  <p className="text-right font-display">{formatarMoeda(item.valor)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-medium">Últimos recebimentos do período</h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {dadosProntos && movimentosFinanceiros.length > ultimosMovimentos.length
                ? `Mostrando ${ultimosMovimentos.length} de ${movimentosFinanceiros.length} recebimentos. A lista completa está no PDF e no CSV.`
                : "Lista curta para conferência rápida do caixa."}
            </p>
          </div>

          <Receipt className="h-4 w-4 shrink-0 text-gold" />
        </div>

        {carregando ? (
          <div className="px-6 py-10">
            <p className="text-sm text-muted-foreground">Carregando movimentações...</p>
          </div>
        ) : !dadosProntos ? (
          <div className="px-6 py-10">
            <p className="text-sm text-muted-foreground">
              Movimentações indisponíveis para este período.
            </p>
          </div>
        ) : ultimosMovimentos.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground" />

            <h3 className="mt-4 text-lg font-display">Nenhum recebimento no período</h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Quando houver atendimento concluído ou assinatura paga, o movimento aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {ultimosMovimentos.map((movimento) => (
              <article key={movimento.id} className="px-6 py-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-medium">{movimento.titulo}</h3>

                      <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        {movimento.tipo === "ASSINATURA" ? "Assinatura" : "Atendimento"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <p>{formatarDataHora(movimento.data)}</p>

                      <p>Cliente: {movimento.cliente}</p>

                      <p>{movimento.detalhe}</p>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Pagamento: {traduzirFormaPagamento(movimento.formaPagamento)}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-lg font-display">{formatarMoeda(movimento.valorCentavos)}</p>

                    <p className="mt-1 text-xs text-muted-foreground">recebido</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Scissors className="h-5 w-5 shrink-0 text-gold" />

          <div>
            <h2 className="text-sm font-medium">Regra atual do financeiro</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Esta tela funciona como caixa do período. Atendimento concluído entra pelo valor
              recebido, na data do atendimento. Assinatura entra no dia do pagamento. Solicitações e
              confirmações entram como previsão. Cancelamentos, recusas e faltas entram como perda
              estimada. Datas consideradas no horário de Brasília. Para análise de serviços e
              profissionais, use a aba Relatórios.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function GraficoEvolucaoReceita({
  carregando,
  disponivel,
  granularidade,
  resumoPorAgrupamento,
  receitaRealizadaTotal,
}: {
  carregando: boolean;
  disponivel: boolean;
  granularidade: GranularidadeFinanceira;
  resumoPorAgrupamento: ResumoAgrupamento[];
  receitaRealizadaTotal: number;
}) {
  const semMovimento = disponivel && receitaRealizadaTotal === 0;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-medium">
            Receita realizada {descreverGranularidade(granularidade)}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Atendimentos concluídos e assinaturas recebidas no período aplicado.
          </p>
        </div>

        <TrendingUp className="h-4 w-4 shrink-0 text-gold" />
      </div>

      {carregando ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">Carregando gráfico...</div>
      ) : !disponivel ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">
          Gráfico indisponível para este período.
        </div>
      ) : semMovimento ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">
          Nenhuma receita realizada no período.
        </div>
      ) : (
        <div className="px-2 pb-4 pt-6 sm:px-4">
          <ChartContainer config={configuracaoGrafico} className="aspect-auto h-64 w-full sm:h-72">
            <BarChart
              data={resumoPorAgrupamento}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
              barCategoryGap={resumoPorAgrupamento.length > 31 ? 1 : "20%"}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="rotuloCurto"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(valor: number) => formatarMoedaCompacta(valor)}
              />

              <ChartTooltip
                cursor={{ fill: "var(--surface-elevated)" }}
                content={<TooltipReceita />}
              />

              <Bar
                dataKey="receitaRealizada"
                fill="var(--color-receitaRealizada)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </section>
  );
}

function TooltipReceita({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ResumoAgrupamento }>;
}) {
  const item = payload?.[0]?.payload;

  if (!active || !item) {
    return null;
  }

  return (
    <div className="grid min-w-[10rem] gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{item.label}</p>

      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-gold" />
          Realizado
        </span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatarMoeda(item.receitaRealizada)}
        </span>
      </div>

      <p className="text-muted-foreground">
        {item.atendimentos} atendimento{item.atendimentos === 1 ? "" : "s"} · {item.assinaturas}{" "}
        assinatura{item.assinaturas === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function obterDataFinanceiraAgendamento(agendamento: AgendamentoFinanceiro): string | Date {
  // Para atendimentos, o financeiro segue a data em que o serviço
  // aconteceu. pagoEm continua sendo preservado como auditoria do
  // momento em que o pagamento foi registrado.
  return agendamento.inicio;
}

function obterValorRealizado(agendamento: AgendamentoFinanceiro): number {
  // "??" preserva valores iguais a zero (ex.: atendimento por assinatura).
  return agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos;
}

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
}

function formatarMoedaCompacta(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(precoCentavos / 100);
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_FINANCEIRO,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function traduzirFormaPagamento(formaPagamento: string | null): string {
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

function descreverPeriodo(periodo: PeriodoAplicado): string {
  return `${ROTULOS_PERIODO[periodo.tipo]} (${formatarIntervaloDatas(periodo)})`;
}

function sufixoArquivoPeriodo(periodo: IntervaloDatasFinanceiro): string {
  if (periodo.dataInicial === periodo.dataFinal) {
    return periodo.dataInicial;
  }

  return `${periodo.dataInicial}_a_${periodo.dataFinal}`;
}

function exportarMovimentosFinanceiros(
  movimentos: MovimentoFinanceiro[],
  periodo: PeriodoAplicado,
) {
  const descricaoPeriodo = descreverPeriodo(periodo);

  // Textos (inclusive nomes e observações informados por usuários) passam
  // pela proteção contra CSV Injection. O valor monetário é gerado pelo
  // sistema e exportado sem alteração.
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
    ].map(celulaTextoCsv),
    ...movimentos.map((movimento) => [
      celulaTextoCsv(descricaoPeriodo),
      celulaTextoCsv(movimento.tipo),
      celulaTextoCsv(formatarDataHora(movimento.data)),
      celulaTextoCsv(movimento.cliente),
      celulaTextoCsv(movimento.titulo),
      celulaTextoCsv(movimento.detalhe),
      celulaTextoCsv(traduzirFormaPagamento(movimento.formaPagamento)),
      celulaMonetariaCsv(formatarMoeda(movimento.valorCentavos)),
    ]),
  ];

  const csv = montarConteudoCsv(linhas);

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `financeiro_${sufixoArquivoPeriodo(periodo)}.csv`;

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
  granularidade,
  resumo,
  resumoPorAgrupamento,
  faturamentoPorPagamento,
  movimentos,
}: {
  periodo: PeriodoAplicado;
  granularidade: GranularidadeFinanceira;
  resumo: ResumoFinanceiroPdf;
  resumoPorAgrupamento: ResumoAgrupamento[];
  faturamentoPorPagamento: PagamentoFinanceiroPdf[];
  movimentos: MovimentoFinanceiro[];
}) {
  const dataGeracao = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_FINANCEIRO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const rotuloPeriodo = ROTULOS_PERIODO[periodo.tipo];
  const intervalo = formatarIntervaloDatas(periodo);
  const descricaoGranularidade = descreverGranularidade(granularidade);
  const colunaAgrupamento =
    granularidade === "dia" ? "Dia" : granularidade === "semana" ? "Semana" : "Mês";

  const totalRecebidoMovimentos = movimentos.reduce(
    (total, movimento) => total + movimento.valorCentavos,
    0,
  );

  const totalAgrupamentos = resumoPorAgrupamento.reduce(
    (total, item) => ({
      atendimentos: total.atendimentos + item.atendimentos,
      assinaturas: total.assinaturas + item.assinaturas,
      receitaRealizada: total.receitaRealizada + item.receitaRealizada,
      receitaPrevista: total.receitaPrevista + item.receitaPrevista,
      receitaPerdida: total.receitaPerdida + item.receitaPerdida,
    }),
    {
      atendimentos: 0,
      assinaturas: 0,
      receitaRealizada: 0,
      receitaPrevista: 0,
      receitaPerdida: 0,
    },
  );

  const linhasAgrupamentos = resumoPorAgrupamento
    .map(
      (item) => `
        <tr>
          <td>${escaparHtml(item.label)}</td>
          <td>${item.atendimentos}</td>
          <td>${item.assinaturas}</td>
          <td>${formatarMoeda(item.receitaRealizada)}</td>
          <td>${formatarMoeda(item.receitaPrevista)}</td>
          <td>${formatarMoeda(item.receitaPerdida)}</td>
        </tr>
      `,
    )
    .join("");

  const linhasPagamentos = faturamentoPorPagamento
    .map(
      (pagamento) => `
        <tr>
          <td>${escaparHtml(traduzirFormaPagamento(pagamento.formaPagamento))}</td>
          <td>${pagamento.quantidade}</td>
          <td>${formatarMoeda(pagamento.valor)}</td>
        </tr>
      `,
    )
    .join("");

  const linhasMovimentos = movimentos
    .map(
      (movimento) => `
        <tr>
          <td>${escaparHtml(formatarDataHora(movimento.data))}</td>
          <td>${escaparHtml(movimento.tipo === "ASSINATURA" ? "Assinatura" : "Atendimento")}</td>
          <td>${escaparHtml(movimento.cliente)}</td>
          <td>${escaparHtml(movimento.titulo)}</td>
          <td>${escaparHtml(traduzirFormaPagamento(movimento.formaPagamento))}</td>
          <td class="valor">${formatarMoeda(movimento.valorCentavos)}</td>
        </tr>
      `,
    )
    .join("");

  // O título do documento é usado pelo navegador como nome sugerido do PDF.
  const tituloDocumento = `Relatório financeiro ${sufixoArquivoPeriodo(periodo)}`;

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${escaparHtml(tituloDocumento)}</title>

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
            break-after: avoid;
            page-break-after: avoid;
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
            break-inside: avoid;
            page-break-inside: avoid;
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

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-row-group;
          }

          th {
            background: #111111;
            color: #ffffff;
            text-align: left;
            font-size: 12px;
            padding: 9px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          td {
            border-bottom: 1px solid #dddddd;
            padding: 9px;
            vertical-align: top;
            overflow-wrap: anywhere;
          }

          td.valor {
            white-space: nowrap;
          }

          tfoot td {
            border-top: 2px solid #111111;
            font-weight: 800;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .observacao {
            margin-top: 24px;
            padding: 14px;
            border: 1px solid #dddddd;
            border-radius: 10px;
            background: #f7f7f7;
            color: #444444;
            break-inside: avoid;
            page-break-inside: avoid;
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
              padding: 0;
            }

            @page {
              margin: 14mm;
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
            <strong>Período:</strong> ${escaparHtml(rotuloPeriodo)}<br />
            <strong>Intervalo:</strong> ${escaparHtml(intervalo)} (horário de Brasília)<br />
            <strong>Gerado em:</strong> ${escaparHtml(dataGeracao)}
          </div>
        </section>

        <section>
          <h2>Resumo financeiro</h2>

          <div class="grid">
            <div class="card">
              <div class="card-label">Receita realizada</div>
              <div class="card-value">${formatarMoeda(resumo.receitaRealizada)}</div>
            </div>

            <div class="card">
              <div class="card-label">Atendimentos</div>
              <div class="card-value">${formatarMoeda(resumo.receitaAtendimentos)}</div>
            </div>

            <div class="card">
              <div class="card-label">Assinaturas</div>
              <div class="card-value">${formatarMoeda(resumo.receitaAssinaturas)}</div>
            </div>

            <div class="card">
              <div class="card-label">Receita prevista</div>
              <div class="card-value">${formatarMoeda(resumo.receitaPrevista)}</div>
            </div>

            <div class="card">
              <div class="card-label">Ticket médio</div>
              <div class="card-value">${formatarMoeda(resumo.ticketMedio)}</div>
            </div>

            <div class="card">
              <div class="card-label">Perdas estimadas</div>
              <div class="card-value">${formatarMoeda(resumo.receitaPerdida)}</div>
            </div>
          </div>
        </section>

        <section>
          <h2>Resumo ${escaparHtml(descricaoGranularidade)}</h2>

          <table>
            <thead>
              <tr>
                <th>${colunaAgrupamento}</th>
                <th>Atend.</th>
                <th>Assin.</th>
                <th>Realizado</th>
                <th>Previsto</th>
                <th>Perdido</th>
              </tr>
            </thead>

            <tbody>
              ${linhasAgrupamentos}
            </tbody>

            <tfoot>
              <tr>
                <td>Total</td>
                <td>${totalAgrupamentos.atendimentos}</td>
                <td>${totalAgrupamentos.assinaturas}</td>
                <td>${formatarMoeda(totalAgrupamentos.receitaRealizada)}</td>
                <td>${formatarMoeda(totalAgrupamentos.receitaPrevista)}</td>
                <td>${formatarMoeda(totalAgrupamentos.receitaPerdida)}</td>
              </tr>
            </tfoot>
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
              ${linhasPagamentos || '<tr><td colspan="3">Nenhum pagamento registrado.</td></tr>'}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Recebimentos do período (${movimentos.length})</h2>

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
              ${linhasMovimentos || '<tr><td colspan="6">Nenhum recebimento registrado.</td></tr>'}
            </tbody>

            <tfoot>
              <tr>
                <td colspan="5">Total recebido</td>
                <td class="valor">${formatarMoeda(totalRecebidoMovimentos)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section class="observacao">
          <strong>Regra do relatório:</strong><br />
          Atendimentos concluídos entram pelo valor recebido, na data do atendimento. Assinaturas entram no dia do pagamento.
          Solicitações e confirmações aparecem como receita prevista. Cancelamentos, recusas e faltas
          aparecem como perda estimada. Datas consideradas no horário de Brasília.
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
    alert("Não foi possível abrir o relatório. Verifique se o navegador bloqueou pop-ups.");

    return;
  }

  janela.document.open();
  janela.document.write(html);
  janela.document.close();
}
