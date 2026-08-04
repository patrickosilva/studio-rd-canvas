import { jsx } from "react/jsx-runtime";
import { Outlet, getRouteApi } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, CalendarX2, DollarSign, Crown, BarChart3, UsersRound, Settings } from "lucide-react";
import { D as DashboardShell } from "./Sidebar-D9rUF8JL.js";
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
  icon: BarChart3
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
  return /* @__PURE__ */ jsx(DashboardShell, { items, title: "Administração", user: {
    name: usuario?.nome ?? "Administrador",
    role: "Administrador"
  }, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  AdminLayout as component
};
