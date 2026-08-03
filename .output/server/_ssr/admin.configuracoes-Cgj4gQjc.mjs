import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { b as listarServicos, c as listarProfissionais, d as cadastrarServico, e as adminDesativarServico, f as cadastrarProfissional, g as adminDesativarProfissional } from "./catalogo.functions-CvTABOgz.mjs";
import "../_libs/seroval.mjs";
import { i as Scissors, s as Plus, T as Trash2, p as Clock, q as UserRound } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
  const [servicos, setServicos] = reactExports.useState([]);
  const [profissionais, setProfissionais] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [salvandoServico, setSalvandoServico] = reactExports.useState(false);
  const [salvandoProfissional, setSalvandoProfissional] = reactExports.useState(false);
  const [removendoServicoId, setRemovendoServicoId] = reactExports.useState("");
  const [removendoProfissionalId, setRemovendoProfissionalId] = reactExports.useState("");
  const [mensagemServico, setMensagemServico] = reactExports.useState("");
  const [mensagemProfissional, setMensagemProfissional] = reactExports.useState("");
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Configurações", subtitle: "Cadastre serviços e profissionais usados no fluxo de agendamento." }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg", children: "Serviços" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre cortes, barba, combos e outros atendimentos." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: handleCadastrarServico, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "servicoNome", children: "Nome do serviço" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "servicoNome", name: "nome", required: true, placeholder: "Ex: Corte masculino" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "servicoDescricao", children: "Descrição" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "servicoDescricao", name: "descricao", placeholder: "Ex: Corte tradicional com acabamento" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "duracaoMinutos", children: "Duração em minutos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "duracaoMinutos", name: "duracaoMinutos", type: "number", min: 10, max: 480, required: true, placeholder: "Ex: 45" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "preco", children: "Preço" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "preco", name: "preco", inputMode: "decimal", required: true, placeholder: "Ex: 50,00" })
            ] })
          ] }),
          mensagemServico && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: mensagemServico }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: salvandoServico, className: "w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            salvandoServico ? "Cadastrando..." : "Cadastrar serviço"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t border-border pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-sm font-medium", children: "Serviços cadastrados" }),
          carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando serviços..." }) : servicos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum serviço cadastrado ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: servicos.map((servico) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: servico.nome }),
                servico.descricao && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: servico.descricao })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-gold-soft px-3 py-1 text-xs text-gold", children: servico.ativo ? "Ativo" : "Inativo" }),
                servico.ativo && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: removendoServicoId === servico.id, onClick: () => void handleDesativarServico(servico), className: "border-destructive/40 text-destructive hover:bg-destructive/10", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                  removendoServicoId === servico.id ? "Excluindo..." : "Excluir"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
                servico.duracaoMinutos,
                " min"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatarMoeda(servico.precoCentavos) })
            ] })
          ] }, servico.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg", children: "Profissionais" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cadastre quem poderá aparecer no agendamento." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: handleCadastrarProfissional, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profissionalNome", children: "Nome do profissional" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "profissionalNome", name: "nome", required: true, placeholder: "Ex: Rafael Dias" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profissionalTelefone", children: "Telefone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "profissionalTelefone", name: "telefone", placeholder: "Ex: (21) 99999-9999" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profissionalDescricao", children: "Descrição" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "profissionalDescricao", name: "descricao", placeholder: "Ex: Especialista em corte masculino" })
          ] }),
          mensagemProfissional && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: mensagemProfissional }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: salvandoProfissional, className: "w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            salvandoProfissional ? "Cadastrando..." : "Cadastrar profissional"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t border-border pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-sm font-medium", children: "Profissionais cadastrados" }),
          carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando profissionais..." }) : profissionais.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum profissional cadastrado ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: profissionais.map((profissional) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-xl border border-border bg-background/40 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: profissional.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: formatarTelefone(profissional.telefone) }),
              profissional.descricao && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: profissional.descricao })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-gold-soft px-3 py-1 text-xs text-gold", children: profissional.ativo ? "Ativo" : "Inativo" }),
              profissional.ativo && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: removendoProfissionalId === profissional.id, onClick: () => void handleDesativarProfissional(profissional), className: "border-destructive/40 text-destructive hover:bg-destructive/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
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
