import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { f as funcionarioListarSolicitacoes } from "./agendamento.functions-B1KNQbhE.mjs";
import "../_libs/seroval.mjs";
import { c as CalendarCheck, i as Scissors, o as CircleCheck, p as Clock } from "../_libs/lucide-react.mjs";
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
  const [agendamentos, setAgendamentos] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  const resumo = reactExports.useMemo(() => {
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
  const proximosAtendimentos = reactExports.useMemo(() => agendamentos.filter((agendamento) => agendamento.status === "SOLICITADO" || agendamento.status === "CONFIRMADO").sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()).slice(0, 5), [agendamentos]);
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
    icon: CircleCheck,
    descricao: "Horários aceitos e ainda não concluídos."
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Painel do funcionário", subtitle: "Acompanhe as solicitações e atendimentos operacionais do Studio RD.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/funcionario/solicitacoes", className: "inline-flex h-10 items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-foreground transition hover:opacity-90", children: "Ver solicitações" }) }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-5 lg:grid-cols-3", children: cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: card.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(card.icon, { className: "h-4 w-4 text-gold" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : card.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: card.descricao })
    ] }, card.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Próximos movimentos da agenda" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Solicitações pendentes e horários confirmados." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gold" })
      ] }),
      carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando agenda operacional..." }) }) : proximosAtendimentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-10 w-10 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-display", children: "Nenhum movimento pendente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando houver solicitações ou horários confirmados, eles aparecerão aqui." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: proximosAtendimentos.map((agendamento) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: agendamento.servico.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
            formatarDataHora(agendamento.inicio),
            " ·",
            " ",
            agendamento.profissional.nome
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            "Cliente: ",
            agendamento.cliente.nome
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/funcionario/solicitacoes", className: "inline-flex h-9 w-fit items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated", children: "Gerenciar" })
      ] }, agendamento.id)) })
    ] })
  ] });
}
export {
  FuncionarioDashboard as component
};
