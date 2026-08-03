import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as createSsrRpc } from "./router-oC4Qe4sf.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { B as Badge } from "./badge-YM7oB01y.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-B2WPZ-Hv.mjs";
import "../_libs/seroval.mjs";
import { x as RefreshCw, j as Sparkles, G as Gift, m as Star, i as Scissors, f as Crown, l as CalendarClock } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/tailwind-merge.mjs";
const clienteBuscarFidelidade = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d3b8c3b283e09f4f72bc3de1764fb1e6962584e1134b64a345e821d0a1380012"));
function ClienteFidelidadePage() {
  const buscarFidelidade = useServerFn(clienteBuscarFidelidade);
  const [resumo, setResumo] = reactExports.useState(null);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
    void carregarFidelidade();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-col justify-between gap-4 lg:flex-row lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cliente Studio RD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Fidelidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground", children: "Seus pontos são calculados com base nos atendimentos concluídos e pagamentos de assinatura. Cada R$ 1,00 gasto gera 1 ponto." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: () => void carregarFidelidade(), disabled: carregando, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "Atualizar"
      ] })
    ] }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-destructive/40 bg-destructive/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-sm text-destructive", children: erro }) }),
    carregando && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Carregando fidelidade..." }) }),
    !carregando && resumo && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.25em] text-gold", children: "Seu saldo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-end gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-5xl font-bold", children: resumo.pontosTotais.toLocaleString("pt-BR") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 text-sm text-muted-foreground", children: "pontos" })
            ] }),
            resumo.proximaRecompensa ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
              "Faltam",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: resumo.pontosParaProximaRecompensa.toLocaleString("pt-BR") }),
              " ",
              "pontos para",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: resumo.proximaRecompensa.nome }),
              "."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Você já possui pontos suficientes para as principais recompensas." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-background/60 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-gold" }),
              "Regra atual"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "R$ 1,00 gasto = 1 ponto de fidelidade." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gold", style: {
          width: `${resumo.progresso}%`
        } }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "grid gap-4 md:grid-cols-3", children: resumo.recompensas.map((recompensa) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: recompensa.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-medium text-gold", children: [
              recompensa.pontosNecessarios.toLocaleString("pt-BR"),
              " ",
              "pts"
            ] })
          ] }),
          recompensa.disponivel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "Disponível" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Bloqueado" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: recompensa.descricao }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "mt-5 w-full", variant: recompensa.disponivel ? "default" : "outline", disabled: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "mr-2 h-4 w-4" }),
            recompensa.disponivel ? "Resgate disponível" : "Junte mais pontos"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "O resgate será liberado na próxima etapa do sistema." })
        ] })
      ] }, recompensa.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Histórico de pontos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Últimos registros que geraram pontos na sua conta." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          resumo.eventos.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed p-8 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-medium", children: "Nenhum ponto registrado ainda" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Quando um atendimento for concluído ou uma assinatura for paga, os pontos aparecerão aqui." })
          ] }),
          resumo.eventos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: resumo.eventos.map((evento) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 rounded-full bg-gold/10 p-2 text-gold", children: evento.tipo === "ATENDIMENTO" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: evento.titulo }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: evento.descricao }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3 w-3" }),
                  formatarDataHora(evento.data)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left md:text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: formatarDinheiro(evento.valorCentavos) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gold", children: [
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
