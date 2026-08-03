import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as Outlet, g as getRouteApi } from "../_libs/tanstack__react-router.mjs";
import { D as DashboardShell } from "./Sidebar-D9rUF8JL.mjs";
import { b as LayoutDashboard, e as Calendar, d as CalendarX2, D as DollarSign, f as Crown, g as ChartColumn, h as UsersRound, S as Settings } from "../_libs/lucide-react.mjs";
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
const rootRoute = getRouteApi("__root__");
const items = [{
  label: "Visão geral",
  to: "/admin",
  icon: LayoutDashboard
}, {
  label: "Monitorar agenda",
  to: "/admin/agenda",
  icon: Calendar
}, {
  label: "Bloqueios",
  to: "/admin/bloqueios",
  icon: CalendarX2
}, {
  label: "Financeiro",
  to: "/admin/financeiro",
  icon: DollarSign
}, {
  label: "Assinaturas",
  to: "/admin/assinaturas",
  icon: Crown
}, {
  label: "Relatórios",
  to: "/admin/relatorios",
  icon: ChartColumn
}, {
  label: "Usuários",
  to: "/admin/usuarios",
  icon: UsersRound
}, {
  label: "Configurações",
  to: "/admin/configuracoes",
  icon: Settings
}];
function AdminLayout() {
  const {
    usuario
  } = rootRoute.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, { items, title: "Administração", user: {
    name: usuario?.nome ?? "Administrador",
    role: "Administrador"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  AdminLayout as component
};
