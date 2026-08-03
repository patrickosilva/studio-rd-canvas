import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { l as listarMeusAgendamentos } from "./agendamento.functions-B1KNQbhE.mjs";
import "../_libs/seroval.mjs";
import { i as Scissors, l as CalendarClock, p as Clock, q as UserRound } from "../_libs/lucide-react.mjs";
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
  const [agendamentos, setAgendamentos] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  const resumo = reactExports.useMemo(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Histórico", subtitle: "Acompanhe todos os seus pedidos e atendimentos no Studio RD." }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "pedidos registrados" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Solicitados" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.solicitados }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "aguardando decisão" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Confirmados" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.confirmados }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "horários aceitos" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Concluídos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: resumo.concluidos }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "atendimentos finalizados" })
      ] })
    ] }),
    carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-border bg-surface p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando histórico..." }) }) : agendamentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-xl font-display", children: "Nenhum agendamento registrado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando você solicitar um horário, ele aparecerá aqui com o status atualizado." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Registros encontrados" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: agendamentos.map((agendamento) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-display", children: agendamento.servico.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4 text-gold" }),
            formatarDataHora(agendamento.inicio)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gold" }),
            agendamento.servico.duracaoMinutos,
            " min ·",
            " ",
            formatarMoeda(agendamento.servico.precoCentavos)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-gold" }),
            agendamento.profissional.nome
          ] })
        ] }),
        agendamento.observacaoCliente && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground", children: [
          "Observação: ",
          agendamento.observacaoCliente
        ] }),
        agendamento.motivoRecusa && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive", children: [
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
