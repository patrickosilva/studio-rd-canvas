import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { i as Scissors, a as LogOut } from "../_libs/lucide-react.mjs";
function DashboardShell({
  items,
  title,
  user,
  children
}) {
  const { location } = useRouterState();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-16 flex items-center gap-2 px-6 border-b border-sidebar-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 h-8 rounded-md bg-gradient-gold grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-4 h-4 text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-sm", children: [
          "Studio ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gold", children: "RD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] uppercase tracking-widest text-muted-foreground", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 px-3 py-6 space-y-1", children: items.map((item) => {
        const active = location.pathname === item.to;
        const Icon = item.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: item.to,
            className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-gold-soft text-gold" : "text-sidebar-foreground hover:bg-sidebar-accent"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
              item.label
            ]
          },
          item.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-sidebar-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-gold grid place-items-center text-sm font-medium text-primary-foreground", children: user.name[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm truncate", children: user.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: user.role })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/logout",
            className: "mt-4 flex h-10 items-center justify-center gap-2 rounded-lg border border-sidebar-border text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4" }),
              "Sair"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-w-0", children })
  ] });
}
function PageHeader({ title, subtitle, actions }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display tracking-tight", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: actions })
  ] });
}
export {
  DashboardShell as D,
  PageHeader as P
};
