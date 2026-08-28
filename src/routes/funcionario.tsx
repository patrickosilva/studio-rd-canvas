import {
  createFileRoute,
  getRouteApi,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import {
  ArrowLeftCircle,
  CalendarCheck,
  CalendarPlus,
  CalendarX2,
  LayoutDashboard,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/Sidebar";
import { NotificadorNativo } from "@/components/notificacoes/NotificadorNativo";

export const Route = createFileRoute("/funcionario")({
  beforeLoad: ({ context, location }) => {
    const { usuario } = context;

    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    if (usuario.papel === "CLIENTE") {
      throw redirect({
        to: "/cliente",
      });
    }

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

const itemsFuncionario = [
  {
    label: "Painel",
    to: "/funcionario",
    icon: LayoutDashboard,
  },
  {
    label: "Agenda",
    to: "/funcionario/solicitacoes",
    icon: CalendarCheck,
  },
  {
    label: "Bloqueios",
    to: "/funcionario/bloqueios",
    icon: CalendarX2,
  },
  {
    label: "Agendar Cliente",
    to: "/funcionario/agendar-cliente",
    icon: CalendarPlus,
  },
];

function FuncionarioLayout() {
  const { usuario } = rootRoute.useRouteContext();

  const items =
    usuario?.papel === "DONO"
      ? [
          {
            label: "Voltar ao admin",
            to: "/admin",
            icon: ArrowLeftCircle,
          },
          ...itemsFuncionario,
        ]
      : itemsFuncionario;

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
      <NotificadorNativo />
      <Outlet />
    </DashboardShell>
  );
}