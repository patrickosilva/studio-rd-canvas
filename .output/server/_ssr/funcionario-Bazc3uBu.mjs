import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as Outlet, g as getRouteApi } from "../_libs/tanstack__react-router.mjs";
import { D as DashboardShell } from "./Sidebar-D9rUF8JL.mjs";
import { C as CircleArrowLeft, b as LayoutDashboard, c as CalendarCheck, d as CalendarX2 } from "../_libs/lucide-react.mjs";
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
    icon: CircleArrowLeft
  }, ...itemsFuncionario] : itemsFuncionario;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, { items, title: "Funcionário", user: {
    name: usuario?.nome ?? "Funcionário",
    role: usuario?.papel === "DONO" ? "Administrador / Operacional" : "Funcionário Studio RD"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  FuncionarioLayout as component
};
