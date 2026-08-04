import { jsxs, jsx } from "react/jsx-runtime";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { Crown, ShieldCheck, Star, Gift } from "lucide-react";
import "@tanstack/react-router";
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
  return /* @__PURE__ */ jsxs("div", { className: "p-8 lg:p-12 max-w-5xl", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Benefícios", subtitle: "Tudo que vem com o RD Black." }),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: items.map((i) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-surface p-6", children: [
      /* @__PURE__ */ jsx(i.icon, { className: "w-5 h-5 text-gold" }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 font-medium", children: i.t }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: i.d })
    ] }, i.t)) })
  ] });
}
export {
  Page as component
};
