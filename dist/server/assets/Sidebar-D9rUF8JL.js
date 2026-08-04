import { jsxs, jsx } from "react/jsx-runtime";
import { useRouterState, Link } from "@tanstack/react-router";
import { Scissors, LogOut } from "lucide-react";
function DashboardShell({
  items,
  title,
  user,
  children
}) {
  const { location } = useRouterState();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex", children: [
    /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "h-16 flex items-center gap-2 px-6 border-b border-sidebar-border", children: [
        /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-md bg-gradient-gold grid place-items-center", children: /* @__PURE__ */ jsx(Scissors, { className: "w-4 h-4 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxs("span", { className: "font-display text-sm", children: [
          "Studio ",
          /* @__PURE__ */ jsx("span", { className: "text-gold", children: "RD" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "ml-auto text-[10px] uppercase tracking-widest text-muted-foreground", children: title })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-6 space-y-1", children: items.map((item) => {
        const active = location.pathname === item.to;
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: item.to,
            className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-gold-soft text-gold" : "text-sidebar-foreground hover:bg-sidebar-accent"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
              item.label
            ]
          },
          item.to
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-sidebar-border", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-gold grid place-items-center text-sm font-medium text-primary-foreground", children: user.name[0] }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm truncate", children: user.name }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: user.role })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/logout",
            className: "mt-4 flex h-10 items-center justify-center gap-2 rounded-lg border border-sidebar-border text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
              "Sair"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0", children })
  ] });
}
function PageHeader({ title, subtitle, actions }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-display tracking-tight", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: actions })
  ] });
}
export {
  DashboardShell as D,
  PageHeader as P
};
