import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { RefreshCw, Sparkles, Gift, Star, Scissors, Crown, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";
import { a as createSsrRpc } from "./router-CUHN8dl0.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { B as Badge } from "./badge-YM7oB01y.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-B2WPZ-Hv.js";
import "@tanstack/react-router";
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
const clienteBuscarFidelidade = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d3b8c3b283e09f4f72bc3de1764fb1e6962584e1134b64a345e821d0a1380012"));
function ClienteFidelidadePage() {
  const buscarFidelidade = useServerFn(clienteBuscarFidelidade);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  async function carregarFidelidade() {
    setCarregando(true);
    setErro("");
    try {
      const resultado = await buscarFidelidade();
      setResumo(resultado);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar sua fidelidade.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarFidelidade();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("section", { className: "flex flex-col justify-between gap-4 lg:flex-row lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Cliente Studio RD" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Fidelidade" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground", children: "Seus pontos são calculados com base nos atendimentos concluídos e pagamentos de assinatura. Cada R$ 1,00 gasto gera 1 ponto." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", onClick: () => void carregarFidelidade(), disabled: carregando, children: [
        /* @__PURE__ */ jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "Atualizar"
      ] })
    ] }),
    erro && /* @__PURE__ */ jsx(Card, { className: "border-destructive/40 bg-destructive/5", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-destructive", children: erro }) }),
    carregando && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Carregando fidelidade..." }) }),
    !carregando && resumo && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Card, { className: "border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.25em] text-gold", children: "Seu saldo" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-end gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: resumo.pontosTotais.toLocaleString("pt-BR") }),
              /* @__PURE__ */ jsx("span", { className: "mb-2 text-sm text-muted-foreground", children: "pontos" })
            ] }),
            resumo.proximaRecompensa ? /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
              "Faltam",
              " ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: resumo.pontosParaProximaRecompensa.toLocaleString("pt-BR") }),
              " ",
              "pontos para",
              " ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: resumo.proximaRecompensa.nome }),
              "."
            ] }) : /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Você já possui pontos suficientes para as principais recompensas." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-background/60 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-sm font-medium", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-gold" }),
              "Regra atual"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "R$ 1,00 gasto = 1 ponto de fidelidade." })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-gold", style: {
          width: `${resumo.progresso}%`
        } }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "grid gap-4 md:grid-cols-3", children: resumo.recompensas.map((recompensa) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: recompensa.nome }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm font-medium text-gold", children: [
              recompensa.pontosNecessarios.toLocaleString("pt-BR"),
              " ",
              "pts"
            ] })
          ] }),
          recompensa.disponivel ? /* @__PURE__ */ jsx(Badge, { children: "Disponível" }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Bloqueado" })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: recompensa.descricao }),
          /* @__PURE__ */ jsxs(Button, { type: "button", className: "mt-5 w-full", variant: recompensa.disponivel ? "default" : "outline", disabled: true, children: [
            /* @__PURE__ */ jsx(Gift, { className: "mr-2 h-4 w-4" }),
            recompensa.disponivel ? "Resgate disponível" : "Junte mais pontos"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "O resgate será liberado na próxima etapa do sistema." })
        ] })
      ] }, recompensa.id)) }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Histórico de pontos" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Últimos registros que geraram pontos na sua conta." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          resumo.eventos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed p-8 text-center", children: [
            /* @__PURE__ */ jsx(Star, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 font-medium", children: "Nenhum ponto registrado ainda" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Quando um atendimento for concluído ou uma assinatura for paga, os pontos aparecerão aqui." })
          ] }),
          resumo.eventos.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: resumo.eventos.map((evento) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "mt-1 rounded-full bg-gold/10 p-2 text-gold", children: evento.tipo === "ATENDIMENTO" ? /* @__PURE__ */ jsx(Scissors, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: evento.titulo }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: evento.descricao }),
                /* @__PURE__ */ jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(CalendarClock, { className: "h-3 w-3" }),
                  formatarDataHora(evento.data)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-left md:text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: formatarDinheiro(evento.valorCentavos) }),
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold text-gold", children: [
                "+",
                evento.pontos.toLocaleString("pt-BR"),
                " pts"
              ] })
            ] })
          ] }, evento.id)) })
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
function formatarDataHora(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(valor));
}
export {
  ClienteFidelidadePage as component
};
