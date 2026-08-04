import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { RefreshCw, CreditCard, Users, Scissors, Wallet, Search, UserRound, Mail, Phone, CalendarClock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { a as createSsrRpc } from "./router-CUHN8dl0.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { B as Badge } from "./badge-YM7oB01y.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-B2WPZ-Hv.js";
import { I as Input } from "./input-D_U8fI25.js";
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
const adminListarClientesResumo = createServerFn({
  method: "GET"
}).handler(createSsrRpc("075a97a93b670f199dfcd8bbf8c998ba49134c483dc4e44607f6510a0c160344"));
function AdminClientesPage() {
  const listarClientes = useServerFn(adminListarClientesResumo);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarClientes() {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await listarClientes();
      setClientes(resultado);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os clientes.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarClientes();
  }, []);
  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return clientes;
    }
    return clientes.filter((cliente) => {
      const texto = [cliente.nome, cliente.email, cliente.telefone ?? "", cliente.assinaturaAtiva?.planoNome ?? ""].join(" ").toLowerCase();
      return texto.includes(termo);
    });
  }, [clientes, busca]);
  const resumo = useMemo(() => {
    const clientesComAssinatura = clientes.filter((cliente) => cliente.assinaturaAtiva).length;
    const totalAgendamentos = clientes.reduce((total, cliente) => total + cliente.totalAgendamentos, 0);
    const totalGasto = clientes.reduce((total, cliente) => total + cliente.totalGastoCentavos, 0);
    return {
      totalClientes: clientes.length,
      clientesComAssinatura,
      totalAgendamentos,
      totalGasto
    };
  }, [clientes]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("section", { className: "flex flex-col justify-between gap-4 lg:flex-row lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Administração" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Clientes" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground", children: "Consulte os clientes cadastrados, histórico de agendamentos, consumo e situação de assinatura." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", onClick: () => void carregarClientes(), disabled: carregando, children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
          "Atualizar"
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/admin/assinaturas", children: [
          /* @__PURE__ */ jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
          "Assinaturas"
        ] }) })
      ] })
    ] }),
    erro && /* @__PURE__ */ jsx(Card, { className: "border-destructive/40 bg-destructive/5", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-destructive", children: erro }) }),
    /* @__PURE__ */ jsxs("section", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Clientes cadastrados" }),
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: resumo.totalClientes }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total de usuários com perfil de cliente." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Com assinatura" }),
          /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: resumo.clientesComAssinatura }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Clientes com assinatura ativa." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Agendamentos" }),
          /* @__PURE__ */ jsx(Scissors, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: resumo.totalAgendamentos }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Soma dos agendamentos dos clientes." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Consumo total" }),
          /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatarDinheiro(resumo.totalGasto) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Receita já concluída por esses clientes." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Lista de clientes" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Busque por nome, e-mail, telefone ou plano ativo." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative w-full lg:max-w-sm", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { value: busca, onChange: (event) => setBusca(event.target.value), placeholder: "Buscar cliente...", className: "pl-9" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        carregando && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Carregando clientes..." }),
        !carregando && clientesFiltrados.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Nenhum cliente encontrado." }),
        !carregando && clientesFiltrados.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: clientesFiltrados.map((cliente) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: cliente.nome }),
                cliente.assinaturaAtiva ? /* @__PURE__ */ jsx(Badge, { children: "Assinante" }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Sem assinatura" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
                  cliente.email
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
                  cliente.telefone || "Telefone não informado"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-left md:text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Cliente desde" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: formatarData(cliente.criadoEm) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Agendamentos" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: cliente.totalAgendamentos })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Concluídos" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: cliente.totalConcluidos })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/40 p-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Total gasto" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: formatarDinheiro(cliente.totalGastoCentavos) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-xs font-medium text-muted-foreground", children: [
                /* @__PURE__ */ jsx(CalendarClock, { className: "h-4 w-4" }),
                "Último agendamento"
              ] }),
              cliente.ultimoAgendamento ? /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: cliente.ultimoAgendamento.servico.nome }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  formatarDataHora(cliente.ultimoAgendamento.inicio),
                  " ",
                  "·",
                  " ",
                  formatarStatus(cliente.ultimoAgendamento.status)
                ] })
              ] }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Nenhum agendamento ainda." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-xs font-medium text-muted-foreground", children: [
                /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
                "Assinatura"
              ] }),
              cliente.assinaturaAtiva ? /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: cliente.assinaturaAtiva.planoNome }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  cliente.assinaturaAtiva.saldoCortes,
                  " cortes disponíveis · vence em",
                  " ",
                  formatarData(cliente.assinaturaAtiva.vigenciaFim)
                ] })
              ] }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Cliente sem assinatura ativa." })
            ] })
          ] })
        ] }, cliente.id)) })
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
function formatarData(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
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
export {
  AdminClientesPage as component
};
