import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { LoaderCircle, LogOut } from "lucide-react";
import { B as Button } from "./button-DjOZMqFS.js";
import { s as sair } from "./router-CUHN8dl0.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
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
function LogoutPage() {
  const executarLogout = useServerFn(sair);
  const logoutIniciado = useRef(false);
  const [erro, setErro] = useState("");
  async function encerrarSessao() {
    setErro("");
    try {
      await executarLogout();
      window.location.replace("/");
    } catch (error) {
      console.error(error);
      setErro("Não foi possível encerrar a sessão. Tente novamente.");
    }
  }
  useEffect(() => {
    if (logoutIniciado.current) {
      return;
    }
    logoutIniciado.current = true;
    void encerrarSessao();
  }, []);
  return /* @__PURE__ */ jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsx("section", { className: "w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-premium", children: !erro ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(LoaderCircle, { className: "mx-auto h-8 w-8 animate-spin text-gold" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-5 text-xl font-display", children: "Encerrando sessão" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Aguarde enquanto desconectamos sua conta com segurança." })
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(LogOut, { className: "mx-auto h-8 w-8 text-destructive" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-5 text-xl font-display", children: "Não foi possível sair" }),
    /* @__PURE__ */ jsx("p", { role: "alert", className: "mt-2 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => {
        logoutIniciado.current = true;
        void encerrarSessao();
      }, children: "Tentar novamente" }),
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: "/", children: "Voltar para a página inicial" }) })
    ] })
  ] }) }) });
}
export {
  LogoutPage as component
};
