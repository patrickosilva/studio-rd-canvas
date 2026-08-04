import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { CalendarCheck, Scissors, CheckCircle2, Clock } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { f as funcionarioListarSolicitacoes } from "./agendamento.functions-jzDVYlE5.js";
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
function ehMesmoDia(data, referencia) {
  const dataComparada = new Date(data);
  return dataComparada.getFullYear() === referencia.getFullYear() && dataComparada.getMonth() === referencia.getMonth() && dataComparada.getDate() === referencia.getDate();
}
function formatarDataHora(valor) {
  const data = new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(data);
}
function traduzirStatus(status) {
  const mapa = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado"
  };
  return mapa[status] ?? status;
}
function obterClasseStatus(status) {
  if (status === "CONFIRMADO") {
    return "bg-gold-soft text-gold";
  }
  return "border border-border bg-background text-muted-foreground";
}
function FuncionarioDashboard() {
  const carregarSolicitacoes = useServerFn(funcionarioListarSolicitacoes);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await carregarSolicitacoes();
      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar o painel operacional.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  const resumo = useMemo(() => {
    const hoje = /* @__PURE__ */ new Date();
    const solicitados = agendamentos.filter((agendamento) => agendamento.status === "SOLICITADO");
    const confirmados = agendamentos.filter((agendamento) => agendamento.status === "CONFIRMADO");
    const confirmadosHoje = confirmados.filter((agendamento) => ehMesmoDia(agendamento.inicio, hoje));
    return {
      solicitados: solicitados.length,
      confirmados: confirmados.length,
      confirmadosHoje: confirmadosHoje.length
    };
  }, [agendamentos]);
  const proximosAtendimentos = useMemo(() => agendamentos.filter((agendamento) => agendamento.status === "SOLICITADO" || agendamento.status === "CONFIRMADO").sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()).slice(0, 5), [agendamentos]);
  const cards = [{
    label: "Solicitações pendentes",
    value: String(resumo.solicitados),
    icon: CalendarCheck,
    descricao: "Pedidos aguardando confirmação ou recusa."
  }, {
    label: "Confirmados hoje",
    value: String(resumo.confirmadosHoje),
    icon: Scissors,
    descricao: "Atendimentos confirmados para hoje."
  }, {
    label: "Confirmados no total",
    value: String(resumo.confirmados),
    icon: CheckCircle2,
    descricao: "Horários aceitos e ainda não concluídos."
  }];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Painel do funcionário", subtitle: "Acompanhe as solicitações e atendimentos operacionais do Studio RD.", actions: /* @__PURE__ */ jsx(Link, { to: "/funcionario/solicitacoes", className: "inline-flex h-10 items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-foreground transition hover:opacity-90", children: "Ver solicitações" }) }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-5 lg:grid-cols-3", children: cards.map((card) => /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: card.label }),
        /* @__PURE__ */ jsx(card.icon, { className: "h-4 w-4 text-gold" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : card.value }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: card.descricao })
    ] }, card.label)) }),
    /* @__PURE__ */ jsxs("section", { className: "mt-10 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Próximos movimentos da agenda" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Solicitações pendentes e horários confirmados." })
        ] }),
        /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-gold" })
      ] }),
      carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando agenda operacional..." }) }) : proximosAtendimentos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsx(CalendarCheck, { className: "h-10 w-10 text-muted-foreground" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-display", children: "Nenhum movimento pendente" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando houver solicitações ou horários confirmados, eles aparecerão aqui." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: proximosAtendimentos.map((agendamento) => /* @__PURE__ */ jsxs("article", { className: "flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: agendamento.servico.nome }),
            /* @__PURE__ */ jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
            formatarDataHora(agendamento.inicio),
            " ·",
            " ",
            agendamento.profissional.nome
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            "Cliente: ",
            agendamento.cliente.nome
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/funcionario/solicitacoes", className: "inline-flex h-9 w-fit items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated", children: "Gerenciar" })
      ] }, agendamento.id)) })
    ] })
  ] });
}
export {
  FuncionarioDashboard as component
};
