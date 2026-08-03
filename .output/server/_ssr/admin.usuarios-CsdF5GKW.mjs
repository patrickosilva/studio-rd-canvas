import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { a as createSsrRpc } from "./router-oC4Qe4sf.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import "../_libs/seroval.mjs";
import { h as UsersRound, q as UserRound, z as UserCog, n as ShieldCheck, M as Mail, v as Phone } from "../_libs/lucide-react.mjs";
import { o as objectType, e as enumType, s as stringType } from "../_libs/zod.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
const alterarPapelUsuarioSchema = objectType({
  usuarioId: stringType().trim().min(1, "Usuário inválido."),
  papel: enumType(["CLIENTE", "FUNCIONARIO", "DONO"])
});
const adminListarUsuarios = createServerFn({
  method: "GET"
}).handler(createSsrRpc("14c1f1f502d9b45c4c1f95c69ee13f62b91e97e3042d0b77bad547bd52097f67"));
const adminAlterarPapelUsuario = createServerFn({
  method: "POST"
}).validator(alterarPapelUsuarioSchema).handler(createSsrRpc("915c6d12c35421f6816af466b04c222ad68755a10f10a5d83a52ac9f23d05aa1"));
const papeis = [{
  value: "CLIENTE",
  label: "Cliente"
}, {
  value: "FUNCIONARIO",
  label: "Funcionário"
}, {
  value: "DONO",
  label: "Dono"
}];
function traduzirPapel(papel) {
  const mapa = {
    CLIENTE: "Cliente",
    FUNCIONARIO: "Funcionário",
    DONO: "Dono"
  };
  return mapa[papel];
}
function obterClassePapel(papel) {
  if (papel === "DONO") {
    return "bg-gold-soft text-gold";
  }
  if (papel === "FUNCIONARIO") {
    return "bg-emerald-500/10 text-emerald-400";
  }
  return "border border-border bg-background text-muted-foreground";
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
function AdminUsuariosPage() {
  const listarUsuarios = useServerFn(adminListarUsuarios);
  const alterarPapelUsuario = useServerFn(adminAlterarPapelUsuario);
  const [usuarios, setUsuarios] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [processandoId, setProcessandoId] = reactExports.useState("");
  const [busca, setBusca] = reactExports.useState("");
  const [mensagem, setMensagem] = reactExports.useState("");
  const [erro, setErro] = reactExports.useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await listarUsuarios();
      setUsuarios(resposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  async function handleAlterarPapel(usuarioId, papel) {
    setMensagem("");
    setErro("");
    setProcessandoId(usuarioId);
    try {
      const resultado = await alterarPapelUsuario({
        data: {
          usuarioId,
          papel
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
      setErro("Não foi possível alterar o papel do usuário.");
    } finally {
      setProcessandoId("");
    }
  }
  const usuariosFiltrados = reactExports.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return usuarios;
    }
    return usuarios.filter((usuario) => {
      return usuario.nome.toLowerCase().includes(termo) || usuario.email.toLowerCase().includes(termo) || usuario.telefone?.toLowerCase().includes(termo) || usuario.papel.toLowerCase().includes(termo);
    });
  }, [usuarios, busca]);
  const resumo = reactExports.useMemo(() => {
    return {
      total: usuarios.length,
      clientes: usuarios.filter((usuario) => usuario.papel === "CLIENTE").length,
      funcionarios: usuarios.filter((usuario) => usuario.papel === "FUNCIONARIO").length,
      donos: usuarios.filter((usuario) => usuario.papel === "DONO").length
    };
  }, [usuarios]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Usuários", subtitle: "Gerencie clientes, funcionários e permissões de acesso do sistema." }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "usuários cadastrados" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Clientes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.clientes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "contas comuns" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Funcionários" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.funcionarios }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "acesso operacional" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Donos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.donos }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "acesso administrativo" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-medium", children: "Lista de usuários" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Altere o papel de acesso de cada usuário conforme a função dele na barbearia." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: busca, onChange: (event) => setBusca(event.target.value), placeholder: "Buscar por nome, e-mail ou papel", className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:w-80" })
      ] }),
      carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando usuários..." }) }) : usuariosFiltrados.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UsersRound, { className: "h-10 w-10 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-display", children: "Nenhum usuário encontrado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Tente buscar por outro nome, e-mail ou papel." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: usuariosFiltrados.map((usuario) => {
        const processando = processandoId === usuario.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-display", children: usuario.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs ${obterClassePapel(usuario.papel)}`, children: traduzirPapel(usuario.papel) }),
              !usuario.ativo && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive", children: "Inativo" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-gold" }),
                usuario.email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-gold" }),
                formatarTelefone(usuario.telefone)
              ] })
            ] }),
            usuario.profissional && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-muted-foreground", children: [
              "Vinculado ao profissional:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: usuario.profissional.nome })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-64", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Papel no sistema" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: usuario.papel, disabled: processando, onChange: (event) => void handleAlterarPapel(usuario.id, event.target.value), className: "mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: papeis.map((papel) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: papel.value, children: papel.label }, papel.value)) }),
            processando && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Atualizando permissão..." })
          ] })
        ] }) }, usuario.id);
      }) })
    ] })
  ] });
}
export {
  AdminUsuariosPage as component
};
