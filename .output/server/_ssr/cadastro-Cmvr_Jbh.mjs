import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { c as cadastrarCliente } from "./router-oC4Qe4sf.mjs";
import "../_libs/seroval.mjs";
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
function CadastroPage() {
  const cadastrar = useServerFn(cadastrarCliente);
  const [carregando, setCarregando] = reactExports.useState(false);
  const [mensagem, setMensagem] = reactExports.useState("");
  const [sucesso, setSucesso] = reactExports.useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");
    setSucesso(false);
    const formulario = event.currentTarget;
    const formData = new FormData(formulario);
    try {
      const resultado = await cadastrar({
        data: {
          nome: String(formData.get("nome") ?? ""),
          email: String(formData.get("email") ?? ""),
          telefone: String(formData.get("telefone") ?? ""),
          senha: String(formData.get("senha") ?? "")
        }
      });
      setMensagem(resultado.mensagem);
      setSucesso(resultado.sucesso);
      if (resultado.sucesso) {
        formulario.reset();
      }
    } catch (error) {
      console.error(error);
      setMensagem("Não foi possível realizar o cadastro.");
    } finally {
      setCarregando(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md rounded-xl border bg-card p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Criar conta" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Cadastre-se para agendar seus atendimentos." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-6 space-y-4", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "nome", className: "text-sm font-medium", children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "nome", name: "nome", type: "text", required: true, minLength: 3, className: "mt-1 w-full rounded-md border bg-background px-3 py-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", className: "text-sm font-medium", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "email", name: "email", type: "email", required: true, className: "mt-1 w-full rounded-md border bg-background px-3 py-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "telefone", className: "text-sm font-medium", children: "Telefone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "telefone", name: "telefone", type: "tel", className: "mt-1 w-full rounded-md border bg-background px-3 py-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "senha", className: "text-sm font-medium", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "senha", name: "senha", type: "password", required: true, minLength: 8, autoComplete: "new-password", className: "mt-1 w-full rounded-md border bg-background px-3 py-2" })
      ] }),
      mensagem && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: sucesso ? "text-sm text-green-600" : "text-sm text-red-600", children: mensagem }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: carregando, className: "w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50", children: carregando ? "Cadastrando..." : "Criar conta" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-center text-sm", children: [
      "Já possui uma conta?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", search: {
        redirect: void 0
      }, className: "font-medium underline", children: "Entrar na minha conta" })
    ] })
  ] }) });
}
export {
  CadastroPage as component
};
