import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { Crown, Scissors, CalendarDays, CheckCircle2, History } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { l as listarMinhaAssinaturaAtiva } from "./assinatura.functions-IMPsAmw2.js";
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
function formatarDinheiro(centavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(centavos / 100);
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(valor));
}
function ClienteAssinaturaPage() {
  const buscarMinhaAssinatura = useServerFn(listarMinhaAssinaturaAtiva);
  const [assinatura, setAssinatura] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await buscarMinhaAssinatura();
      setAssinatura(resposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar sua assinatura.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Minha assinatura", subtitle: "Acompanhe seu plano, saldo de cortes e validade da assinatura." }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    carregando ? /* @__PURE__ */ jsx("section", { className: "rounded-2xl border border-border bg-surface p-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando assinatura..." }) }) : !assinatura ? /* @__PURE__ */ jsx("section", { className: "rounded-2xl border border-border bg-surface p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex max-w-2xl flex-col items-start gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold", children: /* @__PURE__ */ jsx(Crown, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-display", children: "Você ainda não possui uma assinatura ativa" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: "Quando a barbearia ativar uma assinatura para sua conta, você verá aqui o plano, a validade e o saldo de cortes disponíveis." })
      ] })
    ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Plano" }),
            /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-gold" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 text-xl font-display", children: assinatura.plano.nome }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "assinatura ativa" })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Saldo" }),
            /* @__PURE__ */ jsx(Scissors, { className: "h-4 w-4 text-gold" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: assinatura.saldoCortes }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "cortes disponíveis" })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Validade" }),
            /* @__PURE__ */ jsx(CalendarDays, { className: "h-4 w-4 text-gold" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 text-lg font-display", children: formatarData(assinatura.vigenciaFim) }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "fim da vigência" })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Valor" }),
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-gold" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 text-lg font-display", children: formatarDinheiro(assinatura.plano.precoCentavos) }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            "por ciclo de ",
            assinatura.plano.duracaoDias,
            " dias"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.8fr_1.2fr]", children: [
        /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-gold" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Detalhes do plano" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Informações da sua assinatura ativa." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Nome" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 font-medium", children: assinatura.plano.nome })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Benefício" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 font-medium", children: [
                assinatura.plano.cortesPorCiclo,
                " cortes a cada",
                " ",
                assinatura.plano.duracaoDias,
                " dias"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Vigência" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 font-medium", children: [
                formatarData(assinatura.vigenciaInicio),
                " até",
                " ",
                formatarData(assinatura.vigenciaFim)
              ] })
            ] }),
            assinatura.plano.descricao && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Descrição" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 leading-6 text-muted-foreground", children: assinatura.plano.descricao })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Histórico de uso" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Cortes já utilizados nesta assinatura." })
            ] }),
            /* @__PURE__ */ jsx(History, { className: "h-4 w-4 text-gold" })
          ] }),
          assinatura.usos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum corte foi usado pela assinatura ainda." }) }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: assinatura.usos.map((uso) => /* @__PURE__ */ jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium", children: uso.agendamento.servico.nome }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
                "Atendimento em",
                " ",
                formatarDataHora(uso.agendamento.inicio)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground", children: [
              uso.quantidadeCortes,
              " corte utilizado"
            ] })
          ] }) }, uso.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ClienteAssinaturaPage as component
};
