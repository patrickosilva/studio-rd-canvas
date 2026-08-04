import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { Scissors, Plus, Trash2, Clock, UserRound } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { I as Input } from "./input-D_U8fI25.js";
import { L as Label } from "./label-C8WJLhmR.js";
import { b as listarServicos, c as listarProfissionais, d as cadastrarServico, e as cadastrarProfissional, f as adminDesativarServico, g as adminDesativarProfissional } from "./catalogo.functions-BtguInIk.js";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
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
function formatarMoeda(precoCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(precoCentavos / 100);
}
function formatarTelefone(telefone) {
  if (!telefone) {
    return "Não informado";
  }
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}
function converterPrecoParaCentavos(valor) {
  const limpo = valor.trim().replace(/\./g, "").replace(",", ".");
  const numero = Number(limpo);
  if (!Number.isFinite(numero)) {
    return 0;
  }
  return Math.round(numero * 100);
}
function ConfiguracoesPage() {
  const carregarServicos = useServerFn(listarServicos);
  const carregarProfissionais = useServerFn(listarProfissionais);
  const criarServico = useServerFn(cadastrarServico);
  const criarProfissional = useServerFn(cadastrarProfissional);
  const desativarServico = useServerFn(adminDesativarServico);
  const desativarProfissional = useServerFn(adminDesativarProfissional);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoServico, setSalvandoServico] = useState(false);
  const [salvandoProfissional, setSalvandoProfissional] = useState(false);
  const [removendoServicoId, setRemovendoServicoId] = useState("");
  const [removendoProfissionalId, setRemovendoProfissionalId] = useState("");
  const [mensagemServico, setMensagemServico] = useState("");
  const [mensagemProfissional, setMensagemProfissional] = useState("");
  const [erro, setErro] = useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const [servicosResposta, profissionaisResposta] = await Promise.all([carregarServicos(), carregarProfissionais()]);
      setServicos(servicosResposta);
      setProfissionais(profissionaisResposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar as configurações.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  async function handleCadastrarServico(event) {
    event.preventDefault();
    setSalvandoServico(true);
    setMensagemServico("");
    const formulario = event.currentTarget;
    const formData = new FormData(formulario);
    const precoCentavos = converterPrecoParaCentavos(String(formData.get("preco") ?? ""));
    try {
      const resultado = await criarServico({
        data: {
          nome: String(formData.get("nome") ?? ""),
          descricao: String(formData.get("descricao") ?? ""),
          duracaoMinutos: Number(formData.get("duracaoMinutos") ?? 0),
          precoCentavos,
          ativo: true
        }
      });
      setMensagemServico(resultado.mensagem);
      if (resultado.sucesso) {
        formulario.reset();
        await carregarDados();
      }
    } catch (error) {
      console.error(error);
      setMensagemServico("Não foi possível cadastrar o serviço.");
    } finally {
      setSalvandoServico(false);
    }
  }
  async function handleCadastrarProfissional(event) {
    event.preventDefault();
    setSalvandoProfissional(true);
    setMensagemProfissional("");
    const formulario = event.currentTarget;
    const formData = new FormData(formulario);
    try {
      const resultado = await criarProfissional({
        data: {
          nome: String(formData.get("nome") ?? ""),
          telefone: String(formData.get("telefone") ?? ""),
          descricao: String(formData.get("descricao") ?? ""),
          ativo: true
        }
      });
      setMensagemProfissional(resultado.mensagem);
      if (resultado.sucesso) {
        formulario.reset();
        await carregarDados();
      }
    } catch (error) {
      console.error(error);
      setMensagemProfissional("Não foi possível cadastrar o profissional.");
    } finally {
      setSalvandoProfissional(false);
    }
  }
  async function handleDesativarServico(servico) {
    const confirmar = window.confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"? Ele ficará indisponível para novos agendamentos.`);
    if (!confirmar) {
      return;
    }
    setMensagemServico("");
    setErro("");
    setRemovendoServicoId(servico.id);
    try {
      const resultado = await desativarServico({
        data: {
          id: servico.id
        }
      });
      if (!resultado.sucesso) {
        setMensagemServico(resultado.mensagem);
        return;
      }
      setMensagemServico(resultado.mensagem);
      await carregarDados();
    } catch (error) {
      console.error(error);
      setMensagemServico("Não foi possível excluir o serviço.");
    } finally {
      setRemovendoServicoId("");
    }
  }
  async function handleDesativarProfissional(profissional) {
    const confirmar = window.confirm(`Tem certeza que deseja excluir o profissional "${profissional.nome}"? Ele ficará indisponível para novos agendamentos.`);
    if (!confirmar) {
      return;
    }
    setMensagemProfissional("");
    setErro("");
    setRemovendoProfissionalId(profissional.id);
    try {
      const resultado = await desativarProfissional({
        data: {
          id: profissional.id
        }
      });
      if (!resultado.sucesso) {
        setMensagemProfissional(resultado.mensagem);
        return;
      }
      setMensagemProfissional(resultado.mensagem);
      await carregarDados();
    } catch (error) {
      console.error(error);
      setMensagemProfissional("Não foi possível excluir o profissional.");
    } finally {
      setRemovendoProfissionalId("");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Configurações", subtitle: "Cadastre serviços e profissionais usados no fluxo de agendamento." }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsx(Scissors, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display text-lg", children: "Serviços" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre cortes, barba, combos e outros atendimentos." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: handleCadastrarServico, children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "servicoNome", children: "Nome do serviço" }),
            /* @__PURE__ */ jsx(Input, { id: "servicoNome", name: "nome", required: true, placeholder: "Ex: Corte masculino" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "servicoDescricao", children: "Descrição" }),
            /* @__PURE__ */ jsx(Input, { id: "servicoDescricao", name: "descricao", placeholder: "Ex: Corte tradicional com acabamento" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "duracaoMinutos", children: "Duração em minutos" }),
              /* @__PURE__ */ jsx(Input, { id: "duracaoMinutos", name: "duracaoMinutos", type: "number", min: 10, max: 480, required: true, placeholder: "Ex: 45" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "preco", children: "Preço" }),
              /* @__PURE__ */ jsx(Input, { id: "preco", name: "preco", inputMode: "decimal", required: true, placeholder: "Ex: 50,00" })
            ] })
          ] }),
          mensagemServico && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: mensagemServico }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: salvandoServico, className: "w-full", children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
            salvandoServico ? "Cadastrando..." : "Cadastrar serviço"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 border-t border-border pt-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-medium", children: "Serviços cadastrados" }),
          carregando ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando serviços..." }) : servicos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum serviço cadastrado ainda." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: servicos.map((servico) => /* @__PURE__ */ jsxs("article", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium", children: servico.nome }),
                servico.descricao && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: servico.descricao })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "rounded-full bg-gold-soft px-3 py-1 text-xs text-gold", children: servico.ativo ? "Ativo" : "Inativo" }),
                servico.ativo && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: removendoServicoId === servico.id, onClick: () => void handleDesativarServico(servico), className: "border-destructive/40 text-destructive hover:bg-destructive/10", children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                  removendoServicoId === servico.id ? "Excluindo..." : "Excluir"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
                servico.duracaoMinutos,
                " min"
              ] }),
              /* @__PURE__ */ jsx("span", { children: formatarMoeda(servico.precoCentavos) })
            ] })
          ] }, servico.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsx(UserRound, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display text-lg", children: "Profissionais" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre quem poderá aparecer no agendamento." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: handleCadastrarProfissional, children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "profissionalNome", children: "Nome do profissional" }),
            /* @__PURE__ */ jsx(Input, { id: "profissionalNome", name: "nome", required: true, placeholder: "Ex: Rafael Dias" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "profissionalTelefone", children: "Telefone" }),
            /* @__PURE__ */ jsx(Input, { id: "profissionalTelefone", name: "telefone", placeholder: "Ex: (21) 99999-9999" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "profissionalDescricao", children: "Descrição" }),
            /* @__PURE__ */ jsx(Input, { id: "profissionalDescricao", name: "descricao", placeholder: "Ex: Especialista em corte masculino" })
          ] }),
          mensagemProfissional && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: mensagemProfissional }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: salvandoProfissional, className: "w-full", children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
            salvandoProfissional ? "Cadastrando..." : "Cadastrar profissional"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 border-t border-border pt-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "mb-4 text-sm font-medium", children: "Profissionais cadastrados" }),
          carregando ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando profissionais..." }) : profissionais.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum profissional cadastrado ainda." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: profissionais.map((profissional) => /* @__PURE__ */ jsx("article", { className: "rounded-xl border border-border bg-background/40 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium", children: profissional.nome }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: formatarTelefone(profissional.telefone) }),
              profissional.descricao && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: profissional.descricao })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "rounded-full bg-gold-soft px-3 py-1 text-xs text-gold", children: profissional.ativo ? "Ativo" : "Inativo" }),
              profissional.ativo && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: removendoProfissionalId === profissional.id, onClick: () => void handleDesativarProfissional(profissional), className: "border-destructive/40 text-destructive hover:bg-destructive/10", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                removendoProfissionalId === profissional.id ? "Excluindo..." : "Excluir"
              ] })
            ] })
          ] }) }, profissional.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ConfiguracoesPage as component
};
