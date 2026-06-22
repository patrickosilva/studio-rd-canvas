import {
  createFileRoute,
  getRouteApi,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/funcionario")({
  beforeLoad: ({ context, location }) => {
    const { usuario } = context;

    // Visitante tentando acessar área privada.
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // Cliente fica na área de cliente.
    if (usuario.papel === "CLIENTE") {
      throw redirect({
        to: "/cliente",
      });
    }

    /*
     * O DONO pode acessar a área do funcionário porque ele também
     * pode atuar operacionalmente na barbearia, se necessário.
     */
    if (
      usuario.papel !== "FUNCIONARIO" &&
      usuario.papel !== "DONO"
    ) {
      throw redirect({
        to: "/",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Área do Funcionário · Studio RD",
      },
    ],
  }),

  component: FuncionarioLayout,
});

const rootRoute = getRouteApi("__root__");

const items = [
  {
    label: "Painel",
    to: "/funcionario",
    icon: LayoutDashboard,
  },
  {
    label: "Solicitações",
    to: "/funcionario/solicitacoes",
    icon: CalendarCheck,
  },
];

function FuncionarioLayout() {
  const { usuario } = rootRoute.useRouteContext();

  return (
    <DashboardShell
      items={items}
      title="Funcionário"
      user={{
        name: usuario?.nome ?? "Funcionário",
        role:
          usuario?.papel === "DONO"
            ? "Administrador / Operacional"
            : "Funcionário Studio RD",
      }}
    >
      <Outlet />
    </DashboardShell>
  );
}