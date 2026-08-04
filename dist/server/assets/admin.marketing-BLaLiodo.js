import { jsxs, jsx } from "react/jsx-runtime";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { Crown, Cake, UserMinus, Gift } from "lucide-react";
import "@tanstack/react-router";
const groups = [{
  icon: Crown,
  t: "Clientes VIP",
  n: "127",
  d: "Top 10% em frequência e ticket."
}, {
  icon: Cake,
  t: "Aniversariantes",
  n: "18",
  d: "Aniversários nos próximos 30 dias."
}, {
  icon: UserMinus,
  t: "Clientes Inativos",
  n: "84",
  d: "Sem visita há mais de 60 dias."
}, {
  icon: Gift,
  t: "Campanhas Ativas",
  n: "3",
  d: "Em execução neste mês."
}];
function Page() {
  return /* @__PURE__ */ jsxs("div", { className: "p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Marketing", subtitle: "Engaje os clientes certos, no momento certo.", actions: /* @__PURE__ */ jsx("button", { className: "h-10 px-5 rounded-full bg-gold text-gold-foreground text-sm font-medium", children: "Nova Campanha" }) }),
    /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4", children: groups.map((g) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-surface p-6 hover:border-gold/40 transition", children: [
      /* @__PURE__ */ jsx(g.icon, { className: "w-5 h-5 text-gold" }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 text-3xl font-display", children: g.n }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm font-medium", children: g.t }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: g.d }),
      /* @__PURE__ */ jsx("button", { className: "mt-5 w-full h-9 rounded-full border border-border text-xs hover:border-gold/40", children: "Criar campanha" })
    ] }, g.t)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-2xl border border-border bg-surface overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-border text-sm font-medium", children: "Campanhas recentes" }),
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-3", children: "Nome" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-3", children: "Público" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-3", children: "Canal" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-6 py-3", children: "Conversão" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: [["Volte e ganhe 20%", "Inativos", "WhatsApp", "18%"], ["Mês do Aniversário", "Aniversariantes", "E-mail", "42%"], ["VIP Day", "VIPs", "WhatsApp", "61%"]].map((r, i) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: r[0] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-muted-foreground", children: r[1] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-muted-foreground", children: r[2] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right text-gold", children: r[3] })
        ] }, i)) })
      ] })
    ] })
  ] });
}
export {
  Page as component
};
