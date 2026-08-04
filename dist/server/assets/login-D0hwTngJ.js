import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-B2WPZ-Hv.js";
import { I as Input } from "./input-D_U8fI25.js";
import { L as Label } from "./label-C8WJLhmR.js";
import { R as Route, e as entrar } from "./router-CUHN8dl0.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
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
function LoginPage() {
  const realizarLogin = useServerFn(entrar);
  const {
    redirect
  } = Route.useSearch();
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
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
  return /* @__PURE__ */ jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "Entrar" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Acesse sua conta no Studio RD Black." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "E-mail" }),
          /* @__PURE__ */ jsx(Input, { id: "email", name: "email", type: "email", required: true, autoComplete: "email", placeholder: "seuemail@exemplo.com" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "senha", children: "Senha" }),
          /* @__PURE__ */ jsx(Input, { id: "senha", name: "senha", type: "password", required: true, autoComplete: "current-password", placeholder: "Digite sua senha" })
        ] }),
        /* @__PURE__ */ jsxs("label", { htmlFor: "manterConectado", className: "flex cursor-pointer items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx("input", { id: "manterConectado", name: "manterConectado", type: "checkbox", className: "h-4 w-4 rounded border-input accent-primary" }),
          "Manter conectado"
        ] }),
        mensagem && /* @__PURE__ */ jsx("p", { role: "alert", className: "text-sm text-destructive", children: mensagem }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: carregando, className: "w-full", children: carregando ? "Entrando..." : "Entrar" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Ainda não possui conta?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/cadastro", className: "font-medium text-primary hover:underline", children: "Cadastre-se" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-sm", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "text-muted-foreground hover:text-foreground", children: "Voltar ao início" }) })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
