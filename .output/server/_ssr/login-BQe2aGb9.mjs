import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-B2WPZ-Hv.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { R as Route$p, e as entrar } from "./router-oC4Qe4sf.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
function LoginPage() {
  const realizarLogin = useServerFn(entrar);
  const {
    redirect
  } = Route$p.useSearch();
  const [carregando, setCarregando] = reactExports.useState(false);
  const [mensagem, setMensagem] = reactExports.useState("");
  async function handleSubmit(event) {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");
    const formulario = event.currentTarget;
    const formData = new FormData(formulario);
    try {
      const resultado = await realizarLogin({
        data: {
          email: String(formData.get("email") ?? ""),
          senha: String(formData.get("senha") ?? ""),
          manterConectado: formData.get("manterConectado") === "on",
          redirect
        }
      });
      if (!resultado.sucesso) {
        setMensagem(resultado.mensagem);
        return;
      }
      window.location.assign(resultado.destino);
    } catch (error) {
      console.error(error);
      setMensagem("Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl", children: "Entrar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Acesse sua conta no Studio RD Black." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", name: "email", type: "email", required: true, autoComplete: "email", placeholder: "seuemail@exemplo.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "senha", children: "Senha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "senha", name: "senha", type: "password", required: true, autoComplete: "current-password", placeholder: "Digite sua senha" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "manterConectado", className: "flex cursor-pointer items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "manterConectado", name: "manterConectado", type: "checkbox", className: "h-4 w-4 rounded border-input accent-primary" }),
          "Manter conectado"
        ] }),
        mensagem && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: mensagem }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: carregando, className: "w-full", children: carregando ? "Entrando..." : "Entrar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Ainda não possui conta?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cadastro", className: "font-medium text-primary hover:underline", children: "Cadastre-se" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-muted-foreground hover:text-foreground", children: "Voltar ao início" }) })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
