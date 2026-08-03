import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { s as sair } from "./router-oC4Qe4sf.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle, a as LogOut } from "../_libs/lucide-react.mjs";
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
function LogoutPage() {
  const executarLogout = useServerFn(sair);
  const logoutIniciado = reactExports.useRef(false);
  const [erro, setErro] = reactExports.useState("");
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
  reactExports.useEffect(() => {
    if (logoutIniciado.current) {
      return;
    }
    logoutIniciado.current = true;
    void encerrarSessao();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-premium", children: !erro ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mx-auto h-8 w-8 animate-spin text-gold" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-xl font-display", children: "Encerrando sessão" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Aguarde enquanto desconectamos sua conta com segurança." })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mx-auto h-8 w-8 text-destructive" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-xl font-display", children: "Não foi possível sair" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "mt-2 text-sm text-destructive", children: erro }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: () => {
        logoutIniciado.current = true;
        void encerrarSessao();
      }, children: "Tentar novamente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Voltar para a página inicial" }) })
    ] })
  ] }) }) });
}
export {
  LogoutPage as component
};
