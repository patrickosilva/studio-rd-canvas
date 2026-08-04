import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { CalendarX2, Clock, UserRound, Plus, Trash2, Scissors } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { l as listarProfissionaisAtivos } from "./catalogo.functions-BtguInIk.js";
import { l as listarBloqueiosAgenda, c as criarBloqueioAgenda, r as removerBloqueioAgenda } from "./bloqueio-agenda.functions-C1KnG_rj.js";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
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
  const [bloqueios, setBloqueios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalId, setProfissionalId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [motivo, setMotivo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
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
  useEffect(() => {
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
  const resumo = useMemo(() => {
    const gerais = bloqueios.filter((bloqueio) => !bloqueio.profissionalId);
    const porProfissional = bloqueios.filter((bloqueio) => bloqueio.profissionalId);
    return {
      total: bloqueios.length,
      gerais: gerais.length,
      porProfissional: porProfissional.length
    };
  }, [bloqueios]);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Bloqueios de agenda", subtitle: "Bloqueie horários gerais da barbearia ou horários específicos de profissionais." }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsx(CalendarX2, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.total }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "bloqueios ativos" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Gerais" }),
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.gerais }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "bloqueiam toda a barbearia" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Profissionais" }),
          /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.porProfissional }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "bloqueios individuais" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-[0.8fr_1.2fr]", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5 text-gold" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Novo bloqueio" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Use para folgas, pausas, feriados, manutenção ou compromissos internos." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (event) => void handleCriarBloqueio(event), className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Tipo de bloqueio" }),
            /* @__PURE__ */ jsxs("select", { value: profissionalId, onChange: (event) => setProfissionalId(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Bloqueio geral da barbearia" }),
              profissionais.map((profissional) => /* @__PURE__ */ jsxs("option", { value: profissional.id, children: [
                "Somente ",
                profissional.nome
              ] }, profissional.id))
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Bloqueio geral impede qualquer profissional de receber agendamento no período." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Início" }),
              /* @__PURE__ */ jsx("input", { type: "datetime-local", value: inicio, onChange: (event) => setInicio(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Fim" }),
              /* @__PURE__ */ jsx("input", { type: "datetime-local", value: fim, onChange: (event) => setFim(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Motivo" }),
            /* @__PURE__ */ jsx("textarea", { value: motivo, onChange: (event) => setMotivo(event.target.value), placeholder: "Ex.: almoço, manutenção, folga, evento interno...", className: "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: salvando, className: "w-full", children: [
            /* @__PURE__ */ jsx(CalendarX2, { className: "mr-2 h-4 w-4" }),
            salvando ? "Criando..." : "Criar bloqueio"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Bloqueios ativos" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Apenas bloqueios ativos aparecem aqui." })
          ] }),
          /* @__PURE__ */ jsx(CalendarX2, { className: "h-4 w-4 text-gold" })
        ] }),
        carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando bloqueios..." }) }) : bloqueios.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center", children: [
          /* @__PURE__ */ jsx(CalendarX2, { className: "h-10 w-10 text-muted-foreground" }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-display", children: "Nenhum bloqueio ativo" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando houver um horário bloqueado, ele aparecerá nesta lista." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: bloqueios.map((bloqueio) => {
          const removendo = removendoId === bloqueio.id;
          return /* @__PURE__ */ jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: bloqueio.profissional ? bloqueio.profissional.nome : "Bloqueio geral" }),
                /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground", children: bloqueio.profissional ? "Profissional" : "Geral" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-gold" }),
                  "Início: ",
                  formatarDataHora(bloqueio.inicio)
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-gold" }),
                  "Fim: ",
                  formatarDataHora(bloqueio.fim)
                ] })
              ] }),
              bloqueio.motivo && /* @__PURE__ */ jsxs("p", { className: "mt-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground", children: [
                "Motivo: ",
                bloqueio.motivo
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", disabled: removendo, onClick: () => void handleRemoverBloqueio(bloqueio.id), className: "shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              removendo ? "Removendo..." : "Remover"
            ] })
          ] }) }, bloqueio.id);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-6 rounded-2xl border border-border bg-surface p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Scissors, { className: "h-5 w-5 text-gold" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Como o bloqueio funciona" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Bloqueios gerais impedem qualquer agendamento no período. Bloqueios por profissional impedem apenas aquele profissional de receber agendamentos naquele intervalo." })
      ] })
    ] }) })
  ] });
}
export {
  AdminBloqueiosPage as component
};
