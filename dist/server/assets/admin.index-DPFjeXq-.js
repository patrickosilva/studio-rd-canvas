import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { CalendarClock, FileBarChart, Scissors, Clock, DollarSign, Receipt, CreditCard, Plus, Lock, Settings, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { a as createSsrRpc } from "./router-CUHN8dl0.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { B as Badge } from "./badge-YM7oB01y.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-B2WPZ-Hv.js";
import "@tanstack/react-query";
import "zod";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "clsx";
import "tailwind-merge";
const adminBuscarResumoDashboard = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f5abc866ae5a914d2d5aceb398a60224c2596520d17963d0ee679d7c2f26a64c"));
function AdminDashboardPage() {
  const buscarResumo = useServerFn(adminBuscarResumoDashboard);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarResumo() {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await buscarResumo();
      setResumo(resultado);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar a visão geral.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarResumo();
  }, []);
  const temAgendaHoje = useMemo(() => {
    return Boolean(resumo?.agendamentosHoje.length);
  }, [resumo]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("section", { className: "flex flex-col justify-between gap-4 lg:flex-row lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Painel administrativo" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Visão geral" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground", children: "Acompanhe rapidamente o movimento do dia, pendências, receita, assinaturas e próximos atendimentos." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/admin/agenda", children: [
          /* @__PURE__ */ jsx(CalendarClock, { className: "mr-2 h-4 w-4" }),
          "Ver agenda"
        ] }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/relatorios", children: [
          /* @__PURE__ */ jsx(FileBarChart, { className: "mr-2 h-4 w-4" }),
          "Relatórios"
        ] }) })
      ] })
    ] }),
    erro && /* @__PURE__ */ jsx(Card, { className: "border-destructive/40 bg-destructive/5", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-destructive", children: erro }) }),
    carregando && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Carregando visão geral..." }) }),
    !carregando && resumo && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Atendimentos hoje" }),
            /* @__PURE__ */ jsx(Scissors, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: resumo.cards.agendamentosHoje }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Solicitações, confirmações e concluídos de hoje." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Solicitações pendentes" }),
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: resumo.cards.solicitacoesPendentes }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Agendamentos aguardando confirmação." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Receita hoje" }),
            /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatarDinheiro(resumo.cards.receitaHoje) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Atendimentos pagos e assinaturas recebidas hoje." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Receita do mês" }),
            /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatarDinheiro(resumo.cards.receitaMes) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total realizado no mês atual." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Previsto hoje" }),
            /* @__PURE__ */ jsx(CalendarClock, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatarDinheiro(resumo.cards.receitaPrevistaHoje) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Valor previsto dos atendimentos ainda não concluídos." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Assinaturas ativas" }),
            /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: resumo.cards.assinaturasAtivas }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Clientes com plano ativo no momento." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "grid gap-4 xl:grid-cols-[1.4fr_1fr]", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Agenda de hoje" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Movimento operacional do dia." })
            ] }),
            /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsx(Link, { to: "/admin/agenda", children: "Ver completa" }) })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            !temAgendaHoje && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Nenhum atendimento marcado para hoje." }),
            temAgendaHoje && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: resumo.agendamentosHoje.map((agendamento) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
                    formatarHorario(agendamento.inicio),
                    " -",
                    " ",
                    formatarHorario(agendamento.fim)
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { variant: obterVariantStatus(agendamento.status), children: formatarStatus(agendamento.status) })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm", children: [
                  agendamento.cliente.nome,
                  " ·",
                  " ",
                  agendamento.servico.nome
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Profissional:",
                  " ",
                  agendamento.profissional.nome
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: formatarDinheiro(agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos) })
            ] }, agendamento.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Próximos agendamentos" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Os próximos horários que precisam de atenção." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { children: [
              resumo.proximosAgendamentos.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Nenhum próximo agendamento encontrado." }),
              resumo.proximosAgendamentos.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: resumo.proximosAgendamentos.map((agendamento) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: agendamento.cliente.nome }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: formatarDataHora(agendamento.inicio) })
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { variant: obterVariantStatus(agendamento.status), children: formatarStatus(agendamento.status) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: agendamento.servico.nome }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: agendamento.profissional.nome })
              ] }, agendamento.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Atalhos rápidos" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Ações mais usadas pelo dono." })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "justify-start", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/agenda", children: [
                /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
                "Novo agendamento / agenda"
              ] }) }),
              /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "justify-start", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/bloqueios", children: [
                /* @__PURE__ */ jsx(Lock, { className: "mr-2 h-4 w-4" }),
                "Bloquear horário"
              ] }) }),
              /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "justify-start", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/assinaturas", children: [
                /* @__PURE__ */ jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
                "Gerenciar assinaturas"
              ] }) }),
              /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "justify-start", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/configuracoes", children: [
                /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
                "Serviços e profissionais"
              ] }) }),
              /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "justify-start", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/clientes", children: [
                /* @__PURE__ */ jsx(Users, { className: "mr-2 h-4 w-4" }),
                "Clientes"
              ] }) })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function formatarDinheiro(valorCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valorCentavos / 100);
}
function formatarHorario(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(valor));
}
function formatarDataHora(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(valor));
}
function formatarStatus(status) {
  const mapa = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado pelo cliente",
    CANCELADO_FUNCIONARIO: "Cancelado pelo funcionário",
    CONCLUIDO: "Concluído",
    FALTOU: "Faltou"
  };
  return mapa[status] ?? status;
}
function obterVariantStatus(status) {
  if (status === "CONCLUIDO") {
    return "default";
  }
  if (status === "CONFIRMADO") {
    return "secondary";
  }
  if (status === "SOLICITADO") {
    return "outline";
  }
  return "destructive";
}
export {
  AdminDashboardPage as component
};
