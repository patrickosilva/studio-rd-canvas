import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { Calendar, UserRound, Crown, ArrowRight, Star, Scissors } from "lucide-react";
import { l as listarMeusAgendamentos } from "./agendamento.functions-jzDVYlE5.js";
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
const rootRoute = getRouteApi("__root__");
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
    return "bg-background text-muted-foreground border border-border";
  }
  if (status === "RECUSADO" || status.includes("CANCELADO")) {
    return "bg-destructive/10 text-destructive";
  }
  return "bg-surface-elevated text-muted-foreground";
}
function ClientDashboard() {
  const {
    usuario
  } = rootRoute.useRouteContext();
  const carregarMeusAgendamentos = useServerFn(listarMeusAgendamentos);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  usuario?.nome.trim().split(/\s+/)[0] ?? "Cliente";
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await carregarMeusAgendamentos();
      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar seus agendamentos agora.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  const proximoAgendamento = useMemo(() => {
    const agora = Date.now();
    return agendamentos.filter((agendamento) => ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status)).filter((agendamento) => new Date(agendamento.inicio).getTime() >= agora).sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())[0];
  }, [agendamentos]);
  const atendimentosConcluidos = useMemo(() => agendamentos.filter((agendamento) => agendamento.status === "CONCLUIDO").length, [agendamentos]);
  const historicoRecente = useMemo(() => agendamentos.slice(0, 4), [agendamentos]);
  const indicadores = [{
    label: "Pontos de fidelidade",
    value: "0",
    icon: Star,
    descricao: "Ainda não há pontuação registrada."
  }, {
    label: "Atendimentos realizados",
    value: String(atendimentosConcluidos),
    icon: Scissors,
    descricao: atendimentosConcluidos === 1 ? "1 atendimento concluído." : `${atendimentosConcluidos} atendimentos concluídos.`
  }, {
    label: "Economia RD Black",
    value: "R$ 0,00",
    icon: Crown,
    descricao: "Economia será calculada quando os planos forem ativados."
  }];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-10", children: [
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-dark p-7 shadow-premium lg:col-span-2", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.13_85/0.15),transparent_60%)]" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
            "Próximo agendamento"
          ] }),
          carregando ? /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm text-muted-foreground", children: "Carregando seu próximo horário..." }) : proximoAgendamento ? /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-display", children: proximoAgendamento.servico.nome }),
              /* @__PURE__ */ jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(proximoAgendamento.status)}`, children: traduzirStatus(proximoAgendamento.status) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: formatarDataHora(proximoAgendamento.inicio) }),
            /* @__PURE__ */ jsxs("p", { className: "mt-2 flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
              proximoAgendamento.profissional.nome
            ] }),
            proximoAgendamento.status === "SOLICITADO" && /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xl text-sm text-muted-foreground", children: "Sua solicitação foi enviada e está aguardando confirmação da equipe." }),
            proximoAgendamento.status === "CONFIRMADO" && /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xl text-sm text-muted-foreground", children: "Seu horário já foi confirmado pela equipe do Studio RD." }),
            /* @__PURE__ */ jsx(Link, { to: "/cliente/agendamentos", className: "mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated", children: "Ver meus pedidos" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-display", children: "Nenhum agendamento futuro" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xl text-sm text-muted-foreground", children: "Quando uma solicitação for enviada ou confirmada, os dados do atendimento aparecerão aqui." }),
            /* @__PURE__ */ jsx(Link, { to: "/cliente/agendamentos", className: "mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated", children: "Solicitar um horário" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-7", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Assinatura" }),
          /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mt-4 text-2xl font-display", children: "Nenhuma assinatura ativa" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Seus dados do plano RD Black aparecerão aqui após a ativação." }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 hairline" }),
        /* @__PURE__ */ jsxs(Link, { to: "/cliente/beneficios", className: "mt-5 inline-flex items-center gap-1 text-sm text-gold hover:underline", children: [
          "Conhecer benefícios",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
        ] })
      ] }),
      indicadores.map((indicador) => /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: indicador.label }),
          /* @__PURE__ */ jsx(indicador.icon, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: indicador.value }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: indicador.descricao })
      ] }, indicador.label))
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-10 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Histórico recente" }),
        /* @__PURE__ */ jsxs(Link, { to: "/cliente/historico", className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
          "Ver tudo",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })
        ] })
      ] }),
      carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando histórico..." }) }) : historicoRecente.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsx(Scissors, { className: "h-8 w-8 text-muted-foreground" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 text-base font-medium", children: "Nenhum atendimento registrado" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Depois que você solicitar ou concluir um atendimento, ele aparecerá aqui." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: historicoRecente.map((agendamento) => /* @__PURE__ */ jsxs("article", { className: "flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: agendamento.servico.nome }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            formatarDataHora(agendamento.inicio),
            " ·",
            " ",
            agendamento.profissional.nome
          ] }),
          agendamento.motivoRecusa && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-destructive", children: [
            "Motivo da recusa: ",
            agendamento.motivoRecusa
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `w-fit rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
      ] }, agendamento.id)) })
    ] })
  ] });
}
export {
  ClientDashboard as component
};
