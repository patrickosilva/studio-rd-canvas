import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link, g as getRouteApi } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { l as listarMeusAgendamentos } from "./agendamento.functions-B1KNQbhE.mjs";
import "../_libs/seroval.mjs";
import { e as Calendar, q as UserRound, f as Crown, A as ArrowRight, m as Star, i as Scissors } from "../_libs/lucide-react.mjs";
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
  const [agendamentos, setAgendamentos] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  const proximoAgendamento = reactExports.useMemo(() => {
    const agora = Date.now();
    return agendamentos.filter((agendamento) => ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status)).filter((agendamento) => new Date(agendamento.inicio).getTime() >= agora).sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())[0];
  }, [agendamentos]);
  const atendimentosConcluidos = reactExports.useMemo(() => agendamentos.filter((agendamento) => agendamento.status === "CONCLUIDO").length, [agendamentos]);
  const historicoRecente = reactExports.useMemo(() => agendamentos.slice(0, 4), [agendamentos]);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-10", children: [
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-dark p-7 shadow-premium lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.13_85/0.15),transparent_60%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
            "Próximo agendamento"
          ] }),
          carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-sm text-muted-foreground", children: "Carregando seu próximo horário..." }) : proximoAgendamento ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-display", children: proximoAgendamento.servico.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClasseStatus(proximoAgendamento.status)}`, children: traduzirStatus(proximoAgendamento.status) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: formatarDataHora(proximoAgendamento.inicio) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 flex items-center gap-2 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4" }),
              proximoAgendamento.profissional.nome
            ] }),
            proximoAgendamento.status === "SOLICITADO" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xl text-sm text-muted-foreground", children: "Sua solicitação foi enviada e está aguardando confirmação da equipe." }),
            proximoAgendamento.status === "CONFIRMADO" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xl text-sm text-muted-foreground", children: "Seu horário já foi confirmado pela equipe do Studio RD." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cliente/agendamentos", className: "mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated", children: "Ver meus pedidos" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-display", children: "Nenhum agendamento futuro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-xl text-sm text-muted-foreground", children: "Quando uma solicitação for enviada ou confirmada, os dados do atendimento aparecerão aqui." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cliente/agendamentos", className: "mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated", children: "Solicitar um horário" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Assinatura" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-2xl font-display", children: "Nenhuma assinatura ativa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Seus dados do plano RD Black aparecerão aqui após a ativação." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 hairline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/cliente/beneficios", className: "mt-5 inline-flex items-center gap-1 text-sm text-gold hover:underline", children: [
          "Conhecer benefícios",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
        ] })
      ] }),
      indicadores.map((indicador) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: indicador.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(indicador.icon, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: indicador.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: indicador.descricao })
      ] }, indicador.label))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Histórico recente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/cliente/historico", className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", children: [
          "Ver tudo",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
        ] })
      ] }),
      carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando histórico..." }) }) : historicoRecente.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-8 w-8 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-base font-medium", children: "Nenhum atendimento registrado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Depois que você solicitar ou concluir um atendimento, ele aparecerá aqui." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: historicoRecente.map((agendamento) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: agendamento.servico.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            formatarDataHora(agendamento.inicio),
            " ·",
            " ",
            agendamento.profissional.nome
          ] }),
          agendamento.motivoRecusa && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-destructive", children: [
            "Motivo da recusa: ",
            agendamento.motivoRecusa
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-fit rounded-full px-3 py-1 text-xs ${obterClasseStatus(agendamento.status)}`, children: traduzirStatus(agendamento.status) })
      ] }, agendamento.id)) })
    ] })
  ] });
}
export {
  ClientDashboard as component
};
