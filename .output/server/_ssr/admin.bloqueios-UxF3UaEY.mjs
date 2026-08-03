import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { l as listarProfissionaisAtivos } from "./catalogo.functions-CvTABOgz.mjs";
import { l as listarBloqueiosAgenda, c as criarBloqueioAgenda, r as removerBloqueioAgenda } from "./bloqueio-agenda.functions-DfIZgj-J.mjs";
import "../_libs/seroval.mjs";
import { d as CalendarX2, p as Clock, q as UserRound, s as Plus, T as Trash2, i as Scissors } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
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
function AdminBloqueiosPage() {
  const buscarBloqueios = useServerFn(listarBloqueiosAgenda);
  const buscarProfissionais = useServerFn(listarProfissionaisAtivos);
  const criarBloqueio = useServerFn(criarBloqueioAgenda);
  const removerBloqueio = useServerFn(removerBloqueioAgenda);
  const [bloqueios, setBloqueios] = reactExports.useState([]);
  const [profissionais, setProfissionais] = reactExports.useState([]);
  const [profissionalId, setProfissionalId] = reactExports.useState("");
  const [inicio, setInicio] = reactExports.useState("");
  const [fim, setFim] = reactExports.useState("");
  const [motivo, setMotivo] = reactExports.useState("");
  const [carregando, setCarregando] = reactExports.useState(true);
  const [salvando, setSalvando] = reactExports.useState(false);
  const [removendoId, setRemovendoId] = reactExports.useState("");
  const [mensagem, setMensagem] = reactExports.useState("");
  const [erro, setErro] = reactExports.useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const [bloqueiosResposta, profissionaisResposta] = await Promise.all([buscarBloqueios(), buscarProfissionais()]);
      setBloqueios(bloqueiosResposta);
      setProfissionais(profissionaisResposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os bloqueios.");
    } finally {
      setCarregando(false);
    }
  }
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  async function handleCriarBloqueio(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);
    try {
      const resultado = await criarBloqueio({
        data: {
          profissionalId,
          inicio,
          fim,
          motivo
        }
      });
      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }
      setMensagem(resultado.mensagem);
      setProfissionalId("");
      setInicio("");
      setFim("");
      setMotivo("");
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível criar o bloqueio. Confira se início, fim e profissional estão corretos.");
    } finally {
      setSalvando(false);
    }
  }
  async function handleRemoverBloqueio(bloqueioId) {
    const confirmar = window.confirm("Tem certeza que deseja remover este bloqueio?");
    if (!confirmar) {
      return;
    }
    setMensagem("");
    setErro("");
    setRemovendoId(bloqueioId);
    try {
      const resultado = await removerBloqueio({
        data: {
          bloqueioId
        }
      });
      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }
      setMensagem(resultado.mensagem);
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível remover o bloqueio.");
    } finally {
      setRemovendoId("");
    }
  }
  const resumo = reactExports.useMemo(() => {
    const gerais = bloqueios.filter((bloqueio) => !bloqueio.profissionalId);
    const porProfissional = bloqueios.filter((bloqueio) => bloqueio.profissionalId);
    return {
      total: bloqueios.length,
      gerais: gerais.length,
      porProfissional: porProfissional.length
    };
  }, [bloqueios]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Bloqueios de agenda", subtitle: "Bloqueie horários gerais da barbearia ou horários específicos de profissionais." }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarX2, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "bloqueios ativos" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Gerais" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.gerais }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "bloqueiam toda a barbearia" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Profissionais" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.porProfissional }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "bloqueios individuais" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.8fr_1.2fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5 text-gold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Novo bloqueio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Use para folgas, pausas, feriados, manutenção ou compromissos internos." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (event) => void handleCriarBloqueio(event), className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Tipo de bloqueio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: profissionalId, onChange: (event) => setProfissionalId(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Bloqueio geral da barbearia" }),
              profissionais.map((profissional) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: profissional.id, children: [
                "Somente ",
                profissional.nome
              ] }, profissional.id))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bloqueio geral impede qualquer profissional de receber agendamento no período." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Início" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "datetime-local", value: inicio, onChange: (event) => setInicio(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Fim" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "datetime-local", value: fim, onChange: (event) => setFim(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Motivo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: motivo, onChange: (event) => setMotivo(event.target.value), placeholder: "Ex.: almoço, manutenção, folga, evento interno...", className: "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: salvando, className: "w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarX2, { className: "mr-2 h-4 w-4" }),
            salvando ? "Criando..." : "Criar bloqueio"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Bloqueios ativos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Apenas bloqueios ativos aparecem aqui." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarX2, { className: "h-4 w-4 text-gold" })
        ] }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando bloqueios..." }) }) : bloqueios.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarX2, { className: "h-10 w-10 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-display", children: "Nenhum bloqueio ativo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando houver um horário bloqueado, ele aparecerá nesta lista." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: bloqueios.map((bloqueio) => {
          const removendo = removendoId === bloqueio.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: bloqueio.profissional ? bloqueio.profissional.nome : "Bloqueio geral" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground", children: bloqueio.profissional ? "Profissional" : "Geral" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gold" }),
                  "Início: ",
                  formatarDataHora(bloqueio.inicio)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gold" }),
                  "Fim: ",
                  formatarDataHora(bloqueio.fim)
                ] })
              ] }),
              bloqueio.motivo && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground", children: [
                "Motivo: ",
                bloqueio.motivo
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", disabled: removendo, onClick: () => void handleRemoverBloqueio(bloqueio.id), className: "shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              removendo ? "Removendo..." : "Remover"
            ] })
          ] }) }, bloqueio.id);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 rounded-2xl border border-border bg-surface p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-5 w-5 text-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Como o bloqueio funciona" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Bloqueios gerais impedem qualquer agendamento no período. Bloqueios por profissional impedem apenas aquele profissional de receber agendamentos naquele intervalo." })
      ] })
    ] }) })
  ] });
}
export {
  AdminBloqueiosPage as component
};
