import { jsx } from "react/jsx-runtime";
import { Outlet, getRouteApi } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Crown, History, Gift, User } from "lucide-react";
import { D as DashboardShell } from "./Sidebar-D9rUF8JL.js";
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
  return /* @__PURE__ */ jsx(DashboardShell, { items, title: "Cliente", user: {
    name: usuario?.nome ?? "Cliente",
    role: "Cliente Studio RD"
  }, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  ClientLayout as component
};
