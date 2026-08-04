import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { DollarSign, Scissors, Crown, TrendingUp, Receipt, XCircle, Printer, Download, FileBarChart, BarChart3, CheckCircle2, Clock, CalendarClock, Wallet, CreditCard } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { h as adminListarAgenda } from "./agendamento.functions-jzDVYlE5.js";
import { a as adminListarPagamentosAssinatura } from "./assinatura.functions-IMPsAmw2.js";
import "@tanstack/react-router";
import "./router-CUHN8dl0.js";
import "@tanstack/react-query";
import "./server-n3LmVJQm.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
function FinanceiroPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);
  const listarPagamentosAssinatura = useServerFn(adminListarPagamentosAssinatura);
  const [agendamentos, setAgendamentos] = useState([]);
  const [pagamentosAssinatura, setPagamentosAssinatura] = useState([]);
  const [periodo, setPeriodo] = useState("semanaAtual");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const [agendaResposta, pagamentosAssinaturaResposta] = await Promise.all([carregarAgenda(), listarPagamentosAssinatura()]);
      setAgendamentos(agendaResposta);
      setPagamentosAssinatura(pagamentosAssinaturaResposta);
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
  const intervaloPeriodo = useMemo(() => obterIntervaloPeriodo(periodo), [periodo]);
  const agendamentosNoPeriodo = useMemo(() => {
    return agendamentos.filter((agendamento) => estaEntreDatas(agendamento.inicio, intervaloPeriodo.inicio, intervaloPeriodo.fim));
  }, [agendamentos, intervaloPeriodo]);
  const agendamentosRecebidosNoPeriodo = useMemo(() => {
    return agendamentos.filter((agendamento) => {
      if (agendamento.status !== "CONCLUIDO") {
        return false;
      }
      return estaEntreDatas(obterDataFinanceiraAgendamento(agendamento), intervaloPeriodo.inicio, intervaloPeriodo.fim);
    });
  }, [agendamentos, intervaloPeriodo]);
  const pagamentosAssinaturaFiltrados = useMemo(() => {
    return pagamentosAssinatura.filter((pagamento) => estaEntreDatas(pagamento.pagoEm, intervaloPeriodo.inicio, intervaloPeriodo.fim));
  }, [pagamentosAssinatura, intervaloPeriodo]);
  const resumo = useMemo(() => {
    const previstos = agendamentosNoPeriodo.filter((agendamento) => ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status));
    const perdidos = agendamentosNoPeriodo.filter((agendamento) => ["RECUSADO", "CANCELADO_CLIENTE", "CANCELADO_FUNCIONARIO", "FALTOU"].includes(agendamento.status));
    const receitaAtendimentos = agendamentosRecebidosNoPeriodo.reduce((total, agendamento) => total + obterValorRealizado(agendamento), 0);
    const receitaAssinaturas = pagamentosAssinaturaFiltrados.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
    const receitaPrevista = previstos.reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
    const receitaPerdida = perdidos.reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
    const receitaRealizada = receitaAtendimentos + receitaAssinaturas;
    const quantidadeRecebimentos = agendamentosRecebidosNoPeriodo.length + pagamentosAssinaturaFiltrados.length;
    const ticketMedio = agendamentosRecebidosNoPeriodo.length > 0 ? Math.round(receitaAtendimentos / agendamentosRecebidosNoPeriodo.length) : 0;
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
      ticketMedio
    };
  }, [agendamentosNoPeriodo, agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados]);
  const faturamentoPorPagamento = useMemo(() => {
    const mapa = /* @__PURE__ */ new Map();
    for (const agendamento of agendamentosRecebidosNoPeriodo) {
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
    for (const pagamento of pagamentosAssinaturaFiltrados) {
      const chave = pagamento.formaPagamento;
      const registro = mapa.get(chave) ?? {
        formaPagamento: chave,
        quantidade: 0,
        valor: 0
      };
      registro.quantidade += 1;
      registro.valor += pagamento.valorCentavos;
      mapa.set(chave, registro);
    }
    return [...mapa.values()].sort((a, b) => b.valor - a.valor);
  }, [agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados]);
  const resumoPorDia = useMemo(() => {
    const dias = criarDiasEntre(intervaloPeriodo.inicio, intervaloPeriodo.fim);
    return dias.map((dia) => {
      const atendimentosDoDia = agendamentosRecebidosNoPeriodo.filter((agendamento) => mesmaData(obterDataFinanceiraAgendamento(agendamento), dia));
      const assinaturasDoDia = pagamentosAssinaturaFiltrados.filter((pagamento) => mesmaData(pagamento.pagoEm, dia));
      const previstosDoDia = agendamentosNoPeriodo.filter((agendamento) => ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status) && mesmaData(agendamento.inicio, dia));
      const perdidosDoDia = agendamentosNoPeriodo.filter((agendamento) => ["RECUSADO", "CANCELADO_CLIENTE", "CANCELADO_FUNCIONARIO", "FALTOU"].includes(agendamento.status) && mesmaData(agendamento.inicio, dia));
      const receitaAtendimentos = atendimentosDoDia.reduce((total, agendamento) => total + obterValorRealizado(agendamento), 0);
      const receitaAssinaturas = assinaturasDoDia.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
      const receitaPrevista = previstosDoDia.reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
      const receitaPerdida = perdidosDoDia.reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
      return {
        data: dia,
        label: formatarDataCurta(dia),
        atendimentos: atendimentosDoDia.length,
        assinaturas: assinaturasDoDia.length,
        previstos: previstosDoDia.length,
        receitaRealizada: receitaAtendimentos + receitaAssinaturas,
        receitaPrevista,
        receitaPerdida
      };
    });
  }, [agendamentosNoPeriodo, agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados, intervaloPeriodo]);
  const movimentosFinanceiros = useMemo(() => {
    const movimentosAtendimentos = agendamentosRecebidosNoPeriodo.map((agendamento) => ({
      id: `agendamento-${agendamento.id}`,
      tipo: "ATENDIMENTO",
      data: obterDataFinanceiraAgendamento(agendamento),
      titulo: agendamento.servico.nome,
      cliente: agendamento.cliente.nome,
      detalhe: `Profissional: ${agendamento.profissional.nome}`,
      formaPagamento: agendamento.formaPagamento,
      valorCentavos: obterValorRealizado(agendamento)
    }));
    const movimentosAssinaturas = pagamentosAssinaturaFiltrados.map((pagamento) => ({
      id: `assinatura-${pagamento.id}`,
      tipo: "ASSINATURA",
      data: pagamento.pagoEm,
      titulo: `Assinatura ${pagamento.assinatura.plano.nome}`,
      cliente: pagamento.assinatura.cliente.nome,
      detalhe: pagamento.observacao || `Plano com status ${pagamento.assinatura.status}`,
      formaPagamento: pagamento.formaPagamento,
      valorCentavos: pagamento.valorCentavos
    }));
    return [...movimentosAtendimentos, ...movimentosAssinaturas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [agendamentosRecebidosNoPeriodo, pagamentosAssinaturaFiltrados]);
  const ultimosMovimentos = useMemo(() => movimentosFinanceiros.slice(0, 10), [movimentosFinanceiros]);
  const filtros = [{
    label: "Hoje",
    value: "hoje"
  }, {
    label: "Semana atual",
    value: "semanaAtual"
  }, {
    label: "Últimos 7 dias",
    value: "ultimos7"
  }, {
    label: "Mês atual",
    value: "mesAtual"
  }];
  const cards = [{
    label: "Realizado",
    value: formatarMoeda(resumo.receitaRealizada),
    icon: DollarSign,
    descricao: "Caixa recebido no período."
  }, {
    label: "Atendimentos",
    value: formatarMoeda(resumo.receitaAtendimentos),
    icon: Scissors,
    descricao: "Serviços concluídos e pagos."
  }, {
    label: "Assinaturas",
    value: formatarMoeda(resumo.receitaAssinaturas),
    icon: Crown,
    descricao: "Planos RD Black recebidos."
  }, {
    label: "Previsto",
    value: formatarMoeda(resumo.receitaPrevista),
    icon: TrendingUp,
    descricao: "Solicitados e confirmados."
  }, {
    label: "Ticket médio",
    value: formatarMoeda(resumo.ticketMedio),
    icon: Receipt,
    descricao: "Média dos atendimentos pagos."
  }, {
    label: "Perdido",
    value: formatarMoeda(resumo.receitaPerdida),
    icon: XCircle,
    descricao: "Cancelamentos, recusas e faltas."
  }];
  function handleExportarCsv() {
    exportarMovimentosFinanceiros(movimentosFinanceiros, intervaloPeriodo.rotulo);
  }
  function handleExportarPdf() {
    abrirRelatorioFinanceiroPdf({
      periodo: intervaloPeriodo.rotulo,
      intervalo: formatarIntervalo(intervaloPeriodo.inicio, intervaloPeriodo.fim),
      resumo,
      resumoPorDia,
      faturamentoPorPagamento,
      movimentos: movimentosFinanceiros
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Financeiro", subtitle: `Caixa do período: ${formatarIntervalo(intervaloPeriodo.inicio, intervaloPeriodo.fim)}. Para histórico completo, use a aba Relatórios.`, actions: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleExportarPdf, disabled: movimentosFinanceiros.length === 0, className: "inline-flex h-10 items-center rounded-full border border-gold bg-gold-soft px-5 text-sm text-gold transition hover:bg-gold-soft/80 disabled:cursor-not-allowed disabled:opacity-50", children: [
        /* @__PURE__ */ jsx(Printer, { className: "mr-2 h-4 w-4" }),
        "Imprimir / PDF"
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleExportarCsv, disabled: movimentosFinanceiros.length === 0, className: "inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50", children: [
        /* @__PURE__ */ jsx(Download, { className: "mr-2 h-4 w-4" }),
        "CSV"
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "/admin/relatorios", className: "inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated", children: [
        /* @__PURE__ */ jsx(FileBarChart, { className: "mr-2 h-4 w-4" }),
        "Ver relatório completo"
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/admin/agenda", className: "inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated", children: "Ver agenda" })
    ] }) }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 flex flex-wrap gap-2", children: filtros.map((filtro) => {
      const ativo = periodo === filtro.value;
      return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setPeriodo(filtro.value), className: `rounded-full border px-4 py-2 text-sm transition ${ativo ? "border-gold bg-gold-soft text-gold" : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"}`, children: filtro.label }, filtro.value);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: cards.map((card) => /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: card.label }),
        /* @__PURE__ */ jsx(card.icon, { className: "h-4 w-4 text-gold" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-display", children: carregando ? "..." : card.value }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: card.descricao })
    ] }, card.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Agendamentos" }),
          /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.totalAgendamentos }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "no período selecionado" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Concluídos" }),
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.concluidos }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "atendimentos recebidos" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Em aberto" }),
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.previstos }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "solicitados ou confirmados" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Assinaturas" }),
          /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.quantidadeAssinaturas }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "pagamentos de plano" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]", children: [
      /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Resumo diário do período" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Ideal para fechar o caixa da semana sem olhar o histórico inteiro." })
          ] }),
          /* @__PURE__ */ jsx(CalendarClock, { className: "h-4 w-4 text-gold" })
        ] }),
        carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando resumo diário..." }) : /* @__PURE__ */ jsx("div", { className: "max-h-[520px] divide-y divide-border overflow-y-auto", children: resumoPorDia.map((dia) => /* @__PURE__ */ jsxs("article", { className: "grid gap-4 px-6 py-4 md:grid-cols-[1fr_auto_auto_auto]", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: dia.label }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              dia.atendimentos,
              " atendimento",
              dia.atendimentos === 1 ? "" : "s",
              " pago",
              dia.atendimentos === 1 ? "" : "s",
              " ·",
              " ",
              dia.assinaturas,
              " assinatura",
              dia.assinaturas === 1 ? "" : "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Realizado" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatarMoeda(dia.receitaRealizada) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Previsto" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatarMoeda(dia.receitaPrevista) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Perdido" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: formatarMoeda(dia.receitaPerdida) })
          ] })
        ] }, dia.data.toISOString())) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Formas de pagamento" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Atendimentos pagos e assinaturas recebidas." })
          ] }),
          /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-gold" })
        ] }),
        carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Carregando pagamentos..." }) : faturamentoPorPagamento.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-sm text-muted-foreground", children: "Nenhum pagamento registrado no período." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: faturamentoPorPagamento.map((item) => /* @__PURE__ */ jsxs("article", { className: "flex items-center justify-between gap-4 px-6 py-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4 text-gold" }),
              traduzirFormaPagamento(item.formaPagamento)
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              item.quantidade,
              " recebimento",
              item.quantidade === 1 ? "" : "s"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-right font-display", children: formatarMoeda(item.valor) })
        ] }, item.formaPagamento)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-8 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Últimos recebimentos do período" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Lista curta para conferência rápida do caixa." })
        ] }),
        /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4 text-gold" })
      ] }),
      carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando movimentações..." }) }) : ultimosMovimentos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsx(Receipt, { className: "h-10 w-10 text-muted-foreground" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-display", children: "Nenhum recebimento no período" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando houver atendimento concluído ou assinatura paga, o movimento aparecerá aqui." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: ultimosMovimentos.map((movimento) => /* @__PURE__ */ jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: movimento.titulo }),
            /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground", children: movimento.tipo === "ASSINATURA" ? "Assinatura" : "Atendimento" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3", children: [
            /* @__PURE__ */ jsx("p", { children: formatarDataHora(movimento.data) }),
            /* @__PURE__ */ jsxs("p", { children: [
              "Cliente: ",
              movimento.cliente
            ] }),
            /* @__PURE__ */ jsx("p", { children: movimento.detalhe })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
            "Pagamento:",
            " ",
            traduzirFormaPagamento(movimento.formaPagamento)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-left lg:text-right", children: [
          /* @__PURE__ */ jsx("p", { className: "text-lg font-display", children: formatarMoeda(movimento.valorCentavos) }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "recebido" })
        ] })
      ] }) }, movimento.id)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "rounded-2xl border border-border bg-surface p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Scissors, { className: "h-5 w-5 text-gold" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Regra atual do financeiro" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Esta tela funciona como caixa do período. Atendimento concluído entra pelo valor recebido. Assinatura entra no dia do pagamento. Solicitações e confirmações entram como previsão. Cancelamentos, recusas e faltas entram como perda estimada. Para análise histórica completa, use a aba Relatórios." })
      ] })
    ] }) })
  ] });
}
function obterDataFinanceiraAgendamento(agendamento) {
  return agendamento.pagoEm ?? agendamento.inicio;
}
function obterValorRealizado(agendamento) {
  return agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos;
}
function formatarMoeda(precoCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(precoCentavos / 100);
}
function formatarDataHora(valor) {
  const data = new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(data);
}
function formatarDataCurta(valor) {
  const data = new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(data);
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
function inicioDoDia(data) {
  const novaData = new Date(data);
  novaData.setHours(0, 0, 0, 0);
  return novaData;
}
function fimDoDia(data) {
  const novaData = new Date(data);
  novaData.setHours(23, 59, 59, 999);
  return novaData;
}
function inicioDaSemana(data) {
  const novaData = inicioDoDia(data);
  const diaSemana = novaData.getDay();
  const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;
  novaData.setDate(novaData.getDate() + diferenca);
  return novaData;
}
function fimDaSemana(data) {
  const inicio = inicioDaSemana(data);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}
function inicioDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}
function fimDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);
}
function obterIntervaloPeriodo(periodo) {
  const agora = /* @__PURE__ */ new Date();
  if (periodo === "hoje") {
    return {
      inicio: inicioDoDia(agora),
      fim: fimDoDia(agora),
      rotulo: "Hoje"
    };
  }
  if (periodo === "ultimos7") {
    const inicio = inicioDoDia(agora);
    inicio.setDate(inicio.getDate() - 6);
    return {
      inicio,
      fim: fimDoDia(agora),
      rotulo: "Últimos 7 dias"
    };
  }
  if (periodo === "mesAtual") {
    return {
      inicio: inicioDoMes(agora),
      fim: fimDoMes(agora),
      rotulo: "Mês atual"
    };
  }
  return {
    inicio: inicioDaSemana(agora),
    fim: fimDaSemana(agora),
    rotulo: "Semana atual"
  };
}
function estaEntreDatas(valor, inicio, fim) {
  const data = new Date(valor);
  return data >= inicio && data <= fim;
}
function mesmaData(valor, referencia) {
  const data = new Date(valor);
  return data.getFullYear() === referencia.getFullYear() && data.getMonth() === referencia.getMonth() && data.getDate() === referencia.getDate();
}
function criarDiasEntre(inicio, fim) {
  const dias = [];
  const cursor = inicioDoDia(inicio);
  const limite = fimDoDia(fim);
  while (cursor <= limite && dias.length <= 40) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}
function formatarIntervalo(inicio, fim) {
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  return `${formatador.format(inicio)} até ${formatador.format(fim)}`;
}
function normalizarValorCsv(valor) {
  const texto = valor === null || valor === void 0 ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}
function exportarMovimentosFinanceiros(movimentos, rotuloPeriodo) {
  const linhas = [["Período", "Tipo", "Data", "Cliente", "Descrição", "Detalhe", "Forma de pagamento", "Valor"], ...movimentos.map((movimento) => [rotuloPeriodo, movimento.tipo, formatarDataHora(movimento.data), movimento.cliente, movimento.titulo, movimento.detalhe, traduzirFormaPagamento(movimento.formaPagamento), formatarMoeda(movimento.valorCentavos)])];
  const csv = linhas.map((linha) => linha.map(normalizarValorCsv).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `financeiro-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function escaparHtml(valor) {
  const texto = valor === null || valor === void 0 ? "" : String(valor);
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function abrirRelatorioFinanceiroPdf({
  periodo,
  intervalo,
  resumo,
  resumoPorDia,
  faturamentoPorPagamento,
  movimentos
}) {
  const dataGeracao = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(/* @__PURE__ */ new Date());
  const linhasDias = resumoPorDia.map((dia) => `
        <tr>
          <td>${escaparHtml(dia.label)}</td>
          <td>${dia.atendimentos}</td>
          <td>${dia.assinaturas}</td>
          <td>${formatarMoeda(dia.receitaRealizada)}</td>
          <td>${formatarMoeda(dia.receitaPrevista)}</td>
          <td>${formatarMoeda(dia.receitaPerdida)}</td>
        </tr>
      `).join("");
  const linhasPagamentos = faturamentoPorPagamento.map((pagamento) => `
        <tr>
          <td>${escaparHtml(traduzirFormaPagamento(pagamento.formaPagamento))}</td>
          <td>${pagamento.quantidade}</td>
          <td>${formatarMoeda(pagamento.valor)}</td>
        </tr>
      `).join("");
  const linhasMovimentos = movimentos.slice(0, 25).map((movimento) => `
        <tr>
          <td>${escaparHtml(formatarDataHora(movimento.data))}</td>
          <td>${escaparHtml(movimento.tipo === "ASSINATURA" ? "Assinatura" : "Atendimento")}</td>
          <td>${escaparHtml(movimento.cliente)}</td>
          <td>${escaparHtml(movimento.titulo)}</td>
          <td>${escaparHtml(traduzirFormaPagamento(movimento.formaPagamento))}</td>
          <td>${formatarMoeda(movimento.valorCentavos)}</td>
        </tr>
      `).join("");
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
              ${linhasPagamentos || '<tr><td colspan="3">Nenhum pagamento registrado.</td></tr>'}
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
              ${linhasMovimentos || '<tr><td colspan="6">Nenhum recebimento registrado.</td></tr>'}
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
        <\/script>
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
export {
  FinanceiroPage as component
};
