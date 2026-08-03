import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { f as Crown, n as ShieldCheck, m as Star, G as Gift } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
function Page() {
  const items = [{
    icon: Crown,
    t: "2 cortes inclusos / mês",
    d: "Restam 1 corte neste ciclo."
  }, {
    icon: ShieldCheck,
    t: "Prioridade na agenda",
    d: "Janela exclusiva de reserva."
  }, {
    icon: Star,
    t: "20% off em limpeza de pele",
    d: "Aplicado automaticamente."
  }, {
    icon: Gift,
    t: "Preço de membro em produtos",
    d: "Linha premium até -30%."
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 lg:p-12 max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Benefícios", subtitle: "Tudo que vem com o RD Black." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-surface p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(i.icon, { className: "w-5 h-5 text-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 font-medium", children: i.t }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-1", children: i.d })
    ] }, i.t)) })
  ] });
}
export {
  Page as component
};
