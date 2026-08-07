import { jsx } from "react/jsx-runtime";
import { Outlet, getRouteApi } from "@tanstack/react-router";
import { ArrowLeftCircle, LayoutDashboard, CalendarCheck, CalendarX2 } from "lucide-react";
import { D as DashboardShell } from "./Sidebar-D9rUF8JL.js";
const rootRoute = getRouteApi("__root__");
const itemsFuncionario = [{
  label: "Painel",
  to: "/funcionario",
  icon: LayoutDashboard
}, {
  label: "Solicitações",
  to: "/funcionario/solicitacoes",
  icon: CalendarCheck
}, {
  label: "Bloqueios",
  to: "/funcionario/bloqueios",
  icon: CalendarX2
}];
function FuncionarioLayout() {
  const {
    usuario
  } = rootRoute.useRouteContext();
  const items = usuario?.papel === "DONO" ? [{
    label: "Voltar ao admin",
    to: "/admin",
    icon: ArrowLeftCircle
  }, ...itemsFuncionario] : itemsFuncionario;
  return /* @__PURE__ */ jsx(DashboardShell, { items, title: "Funcionário", user: {
    name: usuario?.nome ?? "Funcionário",
    role: usuario?.papel === "DONO" ? "Administrador / Operacional" : "Funcionário Studio RD"
  }, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  FuncionarioLayout as component
};
