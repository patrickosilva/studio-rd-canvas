import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { Scissors, CalendarClock, Clock, UserRound } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { l as listarMeusAgendamentos } from "./agendamento.functions-jzDVYlE5.js";
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
function traduzirStatus(status) {
  const mapa = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado por você",
    CANCELADO_FUNCIONARIO: "Cancelado pela equipe",
    CONCLUIDO: "Concluído",
    FALTOU: "Não compareceu"
  };
  return mapa[status] ?? status;
}
function obterClasseStatus(status) {
  if (status === "CONFIRMADO") {
    return "bg-gold-soft text-gold";
  }
  if (status === "SOLICITADO") {
    return "border border-border bg-background text-muted-foreground";
  }
  if (status === "CONCLUIDO") {
    return "bg-emerald-500/10 text-emerald-400";
  }
  if (status === "RECUSADO" || status === "CANCELADO_CLIENTE" || status === "CANCELADO_FUNCIONARIO" || status === "FALTOU") {
    return "bg-destructive/10 text-destructive";
  }
  return "bg-surface-elevated text-muted-foreground";
}
function HistoricoPage() {
  const carregarMeusAgendamentos = useServerFn(listarMeusAgendamentos);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await carregarMeusAgendamentos();
      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar seu histórico.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  const resumo = useMemo(() => {
    const total = agendamentos.length;
    const solicitados = agendamentos.filter((agendamento) => agendamento.status === "SOLICITADO").length;
    const confirmados = agendamentos.filter((agendamento) => agendamento.status === "CONFIRMADO").length;
    const concluidos = agendamentos.filter((agendamento) => agendamento.status === "CONCLUIDO").length;
    return {
      total,
      solicitados,
      confirmados,
      concluidos
    };
  }, [agendamentos]);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Histórico", subtitle: "Acompanhe todos os seus pedidos e atendimentos no Studio RD." }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Total" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.total }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "pedidos registrados" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Solicitados" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.solicitados }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "aguardando decisão" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Confirmados" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.confirmados }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "horários aceitos" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Concluídos" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.concluidos }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "atendimentos finalizados" })
      ] })
    ] }),
    carregando ? /* @__PURE__ */ jsx("section", { className: "rounded-2xl border border-border bg-surface p-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando histórico..." }) }) : agendamentos.length === 0 ? /* @__PURE__ */ jsxs("section", { className: "flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center", children: [
      /* @__PURE__ */ jsx(Scissors, { className: "h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-5 text-xl font-display", children: "Nenhum agendamento registrado" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando você solicitar um horário, ele aparecerá aqui com o status atualizado." })
    ] }) : /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-border px-6 py-4", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Registros encontrados" }) }),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: agendamentos.map((agendamento) => /* @__PURE__ */ jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-display", children: agendamento.servico.nome }),
          /* @__PURE__ */ jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CalendarClock, { className: "h-4 w-4 text-gold" }),
            formatarDataHora(agendamento.inicio)
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-gold" }),
            agendamento.servico.duracaoMinutos,
            " min ·",
            " ",
            formatarMoeda(agendamento.servico.precoCentavos)
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4 text-gold" }),
            agendamento.profissional.nome
          ] })
        ] }),
        agendamento.observacaoCliente && /* @__PURE__ */ jsxs("p", { className: "mt-4 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground", children: [
          "Observação: ",
          agendamento.observacaoCliente
        ] }),
        agendamento.motivoRecusa && /* @__PURE__ */ jsxs("p", { className: "mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive", children: [
          "Motivo da recusa: ",
          agendamento.motivoRecusa
        ] })
      ] }) }) }, agendamento.id)) })
    ] })
  ] });
}
export {
  HistoricoPage as component
};
