import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { h as adminListarAgenda } from "./agendamento.functions-B1KNQbhE.mjs";
import "../_libs/seroval.mjs";
import { D as DollarSign, B as TrendingUp, g as ChartColumn, o as CircleCheck, E as Funnel, i as Scissors, q as UserRound, W as Wallet, r as CreditCard, l as CalendarClock } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "./router-oC4Qe4sf.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./server-BeKYjhVv.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/zod.mjs";
function formatarMoeda(precoCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(precoCentavos / 100);
}
function formatarPercentual(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(valor);
}
function formatarDataHora(valor) {
  const data = new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(data);
}
function estaNoMesAtual(valor) {
  const data = new Date(valor);
  const hoje = /* @__PURE__ */ new Date();
  return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
}
function estaNosUltimos30Dias(valor) {
  const data = new Date(valor);
  const agora = /* @__PURE__ */ new Date();
  const limite = new Date(agora);
  limite.setDate(agora.getDate() - 30);
  limite.setHours(0, 0, 0, 0);
  return data >= limite && data <= agora;
}
function obterValorRealizado(agendamento) {
  return agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos;
}
function obterValorParaRelatorio(agendamento) {
  if (agendamento.status === "CONCLUIDO") {
    return obterValorRealizado(agendamento);
  }
  return agendamento.servico.precoCentavos;
}
function traduzirFormaPagamento(formaPagamento) {
  const mapa = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    ASSINATURA: "Assinatura RD Black",
    CORTESIA: "Cortesia",
    OUTRO: "Outro",
    NAO_INFORMADO: "Não informado"
  };
  if (!formaPagamento) {
    return "Não informado";
  }
  return mapa[formaPagamento] ?? formaPagamento;
}
function traduzirStatus(status) {
  const mapa = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado pelo cliente",
    CANCELADO_FUNCIONARIO: "Cancelado pela equipe",
    CONCLUIDO: "Concluído",
    FALTOU: "Não compareceu"
  };
  return mapa[status] ?? status;
}
function obterClasseStatus(status) {
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
function criarRankingPorServico(agendamentos) {
  const mapa = /* @__PURE__ */ new Map();
  for (const agendamento of agendamentos) {
    const registro = mapa.get(agendamento.servico.id) ?? {
      id: agendamento.servico.id,
      nome: agendamento.servico.nome,
      total: 0,
      concluidos: 0,
      receitaRealizada: 0,
      receitaPrevista: 0
    };
    registro.total += 1;
    if (agendamento.status === "CONCLUIDO") {
      registro.concluidos += 1;
      registro.receitaRealizada += obterValorRealizado(agendamento);
    }
    if (agendamento.status === "SOLICITADO" || agendamento.status === "CONFIRMADO") {
      registro.receitaPrevista += agendamento.servico.precoCentavos;
    }
    mapa.set(agendamento.servico.id, registro);
  }
  return [...mapa.values()].sort((a, b) => b.receitaRealizada - a.receitaRealizada || b.total - a.total);
}
function criarRankingPorProfissional(agendamentos) {
  const mapa = /* @__PURE__ */ new Map();
  for (const agendamento of agendamentos) {
    const registro = mapa.get(agendamento.profissional.id) ?? {
      id: agendamento.profissional.id,
      nome: agendamento.profissional.nome,
      total: 0,
      solicitados: 0,
      confirmados: 0,
      concluidos: 0,
      receitaRealizada: 0,
      receitaPrevista: 0
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
  return [...mapa.values()].sort((a, b) => b.receitaRealizada - a.receitaRealizada || b.concluidos - a.concluidos || b.total - a.total);
}
function criarDistribuicaoStatus(agendamentos) {
  const mapa = /* @__PURE__ */ new Map();
  for (const agendamento of agendamentos) {
    const registro = mapa.get(agendamento.status) ?? {
      status: agendamento.status,
      quantidade: 0,
      valor: 0
    };
    registro.quantidade += 1;
    registro.valor += obterValorParaRelatorio(agendamento);
    mapa.set(agendamento.status, registro);
  }
  return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade);
}
function criarDistribuicaoPagamento(agendamentos) {
  const mapa = /* @__PURE__ */ new Map();
  const concluidos = agendamentos.filter((agendamento) => agendamento.status === "CONCLUIDO");
  for (const agendamento of concluidos) {
    const chave = agendamento.formaPagamento ?? "NAO_INFORMADO";
    const registro = mapa.get(chave) ?? {
      formaPagamento: chave,
      quantidade: 0,
      valor: 0
    };
    registro.quantidade += 1;
    registro.valor += obterValorRealizado(agendamento);
    mapa.set(chave, registro);
  }
  return [...mapa.values()].sort((a, b) => b.valor - a.valor);
}
function RelatoriosPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);
  const [agendamentos, setAgendamentos] = reactExports.useState([]);
  const [periodo, setPeriodo] = reactExports.useState("todos");
  const [servicoSelecionado, setServicoSelecionado] = reactExports.useState("todos");
  const [profissionalSelecionado, setProfissionalSelecionado] = reactExports.useState("todos");
  const [pagamentoSelecionado, setPagamentoSelecionado] = reactExports.useState("todos");
  const [carregando, setCarregando] = reactExports.useState(true);
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  const servicosDisponiveis = reactExports.useMemo(() => {
    const mapa = /* @__PURE__ */ new Map();
    for (const agendamento of agendamentos) {
      mapa.set(agendamento.servico.id, agendamento.servico.nome);
    }
    return [...mapa.entries()].map(([id, nome]) => ({
      id,
      nome
    })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [agendamentos]);
  const profissionaisDisponiveis = reactExports.useMemo(() => {
    const mapa = /* @__PURE__ */ new Map();
    for (const agendamento of agendamentos) {
      mapa.set(agendamento.profissional.id, agendamento.profissional.nome);
    }
    return [...mapa.entries()].map(([id, nome]) => ({
      id,
      nome
    })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [agendamentos]);
  const pagamentosDisponiveis = reactExports.useMemo(() => {
    const mapa = /* @__PURE__ */ new Map();
    for (const agendamento of agendamentos) {
      if (agendamento.status !== "CONCLUIDO") {
        continue;
      }
      const chave = agendamento.formaPagamento ?? "NAO_INFORMADO";
      mapa.set(chave, traduzirFormaPagamento(chave));
    }
    return [...mapa.entries()].map(([id, nome]) => ({
      id,
      nome
    })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [agendamentos]);
  const agendamentosFiltrados = reactExports.useMemo(() => {
    return agendamentos.filter((agendamento) => {
      if (periodo === "mesAtual" && !estaNoMesAtual(agendamento.inicio)) {
        return false;
      }
      if (periodo === "ultimos30" && !estaNosUltimos30Dias(agendamento.inicio)) {
        return false;
      }
      if (servicoSelecionado !== "todos" && agendamento.servico.id !== servicoSelecionado) {
        return false;
      }
      if (profissionalSelecionado !== "todos" && agendamento.profissional.id !== profissionalSelecionado) {
        return false;
      }
      if (pagamentoSelecionado !== "todos") {
        const formaPagamento = agendamento.formaPagamento ?? "NAO_INFORMADO";
        return agendamento.status === "CONCLUIDO" && formaPagamento === pagamentoSelecionado;
      }
      return true;
    });
  }, [agendamentos, periodo, servicoSelecionado, profissionalSelecionado, pagamentoSelecionado]);
  const resumo = reactExports.useMemo(() => {
    const concluidos = agendamentosFiltrados.filter((agendamento) => agendamento.status === "CONCLUIDO");
    const emAberto = agendamentosFiltrados.filter((agendamento) => ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status));
    const perdidos = agendamentosFiltrados.filter((agendamento) => ["RECUSADO", "CANCELADO_CLIENTE", "CANCELADO_FUNCIONARIO", "FALTOU"].includes(agendamento.status));
    const receitaRealizada = concluidos.reduce((total, agendamento) => total + obterValorRealizado(agendamento), 0);
    const receitaPrevista = emAberto.reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
    const receitaPerdida = perdidos.reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
    const taxaConclusao = agendamentosFiltrados.length > 0 ? concluidos.length / agendamentosFiltrados.length : 0;
    const ticketMedio = concluidos.length > 0 ? Math.round(receitaRealizada / concluidos.length) : 0;
    return {
      total: agendamentosFiltrados.length,
      concluidos: concluidos.length,
      emAberto: emAberto.length,
      perdidos: perdidos.length,
      receitaRealizada,
      receitaPrevista,
      receitaPerdida,
      taxaConclusao,
      ticketMedio
    };
  }, [agendamentosFiltrados]);
  const rankingServicos = reactExports.useMemo(() => criarRankingPorServico(agendamentosFiltrados), [agendamentosFiltrados]);
  const rankingProfissionais = reactExports.useMemo(() => criarRankingPorProfissional(agendamentosFiltrados), [agendamentosFiltrados]);
  const distribuicaoStatus = reactExports.useMemo(() => criarDistribuicaoStatus(agendamentosFiltrados), [agendamentosFiltrados]);
  const distribuicaoPagamento = reactExports.useMemo(() => criarDistribuicaoPagamento(agendamentosFiltrados), [agendamentosFiltrados]);
  const ultimosRegistros = reactExports.useMemo(() => [...agendamentosFiltrados].sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()).slice(0, 8), [agendamentosFiltrados]);
  const filtrosPeriodo = [{
    label: "Tudo",
    value: "todos"
  }, {
    label: "Mês atual",
    value: "mesAtual"
  }, {
    label: "Últimos 30 dias",
    value: "ultimos30"
  }];
  const cards = [{
    label: "Receita realizada",
    value: formatarMoeda(resumo.receitaRealizada),
    icon: DollarSign,
    descricao: "Somente valores realmente recebidos."
  }, {
    label: "Receita prevista",
    value: formatarMoeda(resumo.receitaPrevista),
    icon: TrendingUp,
    descricao: "Solicitados e confirmados."
  }, {
    label: "Ticket médio",
    value: formatarMoeda(resumo.ticketMedio),
    icon: ChartColumn,
    descricao: "Média dos concluídos."
  }, {
    label: "Taxa de conclusão",
    value: formatarPercentual(resumo.taxaConclusao),
    icon: CircleCheck,
    descricao: "Concluídos sobre o total filtrado."
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Relatórios", subtitle: "Analise desempenho por período, serviço, profissional e forma de pagamento.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/financeiro", className: "inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated", children: "Ver financeiro" }) }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-8 rounded-2xl border border-border bg-surface p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-5 w-5 text-gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Filtros do relatório" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Use os filtros para analisar recortes específicos da operação." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex flex-wrap gap-2", children: filtrosPeriodo.map((filtro) => {
        const ativo = periodo === filtro.value;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPeriodo(filtro.value), className: `rounded-full border px-4 py-2 text-sm transition ${ativo ? "border-gold bg-gold-soft text-gold" : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"}`, children: filtro.label }, filtro.value);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Serviço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: servicoSelecionado, onChange: (event) => setServicoSelecionado(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "todos", children: "Todos os serviços" }),
            servicosDisponiveis.map((servico) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: servico.id, children: servico.nome }, servico.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Profissional" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: profissionalSelecionado, onChange: (event) => setProfissionalSelecionado(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "todos", children: "Todos os profissionais" }),
            profissionaisDisponiveis.map((profissional) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: profissional.id, children: profissional.nome }, profissional.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Forma de pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: pagamentoSelecionado, onChange: (event) => setPagamentoSelecionado(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "todos", children: "Todas as formas" }),
            pagamentosDisponiveis.map((pagamento) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: pagamento.id, children: pagamento.nome }, pagamento.id))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: card.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(card.icon, { className: "h-4 w-4 text-gold" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-display", children: carregando ? "..." : card.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: card.descricao })
    ] }, card.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "registros filtrados" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Concluídos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.concluidos }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "atendimentos realizados" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Em aberto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.emAberto }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "solicitados ou confirmados" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Perdidos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.perdidos }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "recusas, cancelamentos ou faltas" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Desempenho por serviço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Ranking por receita realizada e quantidade de pedidos." })
        ] }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando serviços..." }) : rankingServicos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Nenhum dado de serviço encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: rankingServicos.map((servico) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-4 w-4 text-gold" }),
              servico.nome
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              servico.total,
              " pedidos ·",
              " ",
              servico.concluidos,
              " concluídos"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Previsto:",
              " ",
              formatarMoeda(servico.receitaPrevista)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-right font-display", children: formatarMoeda(servico.receitaRealizada) })
        ] }) }, servico.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Desempenho por profissional" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Receita realizada, pedidos e atendimentos por profissional." })
        ] }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando profissionais..." }) : rankingProfissionais.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Nenhum dado de profissional encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: rankingProfissionais.map((profissional) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-gold" }),
              profissional.nome
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              profissional.total,
              " pedidos ·",
              " ",
              profissional.concluidos,
              " concluídos"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              profissional.solicitados,
              " solicitados ·",
              " ",
              profissional.confirmados,
              " confirmados"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display", children: formatarMoeda(profissional.receitaRealizada) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "previsto",
              " ",
              formatarMoeda(profissional.receitaPrevista)
            ] })
          ] })
        ] }) }, profissional.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Distribuição por status" }) }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando status..." }) : distribuicaoStatus.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Nenhum status encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: distribuicaoStatus.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex items-center justify-between gap-4 px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(item.status)}`, children: traduzirStatus(item.status) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
              item.quantidade,
              " registros"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display", children: formatarMoeda(item.valor) })
        ] }, item.status)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Distribuição por pagamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Considera apenas atendimentos concluídos." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-gold" })
        ] }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando pagamentos..." }) : distribuicaoPagamento.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Nenhum pagamento encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: distribuicaoPagamento.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex items-center justify-between gap-4 px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-gold" }),
              traduzirFormaPagamento(item.formaPagamento)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              item.quantidade,
              " atendimento",
              item.quantidade === 1 ? "" : "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display", children: formatarMoeda(item.valor) })
        ] }, item.formaPagamento)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Últimos registros analisados" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Movimentações mais recentes dentro dos filtros selecionados." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4 text-gold" })
      ] }),
      carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando registros..." }) : ultimosRegistros.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Nenhum registro encontrado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: ultimosRegistros.map((agendamento) => {
        const valorRegistro = agendamento.status === "CONCLUIDO" ? obterValorRealizado(agendamento) : agendamento.servico.precoCentavos;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: agendamento.servico.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
              formatarDataHora(agendamento.inicio),
              " ·",
              " ",
              agendamento.profissional.nome
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Cliente: ",
              agendamento.cliente.nome
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Pagamento:",
              " ",
              agendamento.status === "CONCLUIDO" ? traduzirFormaPagamento(agendamento.formaPagamento) : "ainda não recebido"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display", children: formatarMoeda(valorRegistro) })
        ] }) }, agendamento.id);
      }) })
    ] })
  ] });
}
export {
  RelatoriosPage as component
};
