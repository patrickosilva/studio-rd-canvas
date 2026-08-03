import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as Outlet, g as getRouteApi } from "../_libs/tanstack__react-router.mjs";
import { D as DashboardShell } from "./Sidebar-D9rUF8JL.mjs";
import { b as LayoutDashboard, e as Calendar, f as Crown, H as History, G as Gift, U as User } from "../_libs/lucide-react.mjs";
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
  label: "Dashboard",
  to: "/cliente",
  icon: LayoutDashboard
}, {
  label: "Agendamentos",
  to: "/cliente/agendamentos",
  icon: Calendar
}, {
  label: "Assinatura",
  to: "/cliente/assinatura",
  icon: Crown
}, {
  label: "Histórico",
  to: "/cliente/historico",
  icon: History
}, {
  label: "Benefícios",
  to: "/cliente/beneficios",
  icon: Gift
}, {
  label: "Fidelidade",
  to: "/cliente/fidelidade",
  icon: Crown
}, {
  label: "Perfil",
  to: "/cliente/perfil",
  icon: User
}];
function ClientLayout() {
  const {
    usuario
  } = rootRoute.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, { items, title: "Cliente", user: {
    name: usuario?.nome ?? "Cliente",
    role: "Cliente Studio RD"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  ClientLayout as component
};
