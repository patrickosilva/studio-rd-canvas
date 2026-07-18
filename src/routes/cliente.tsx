import {
  createFileRoute,
  getRouteApi,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  Calendar,
  Crown,
  Gift,
  History,
  LayoutDashboard,
  User,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente")({
  beforeLoad: ({ context, location }) => {
    const { usuario } = context;

    // Visitante tentou acessar uma área privada.
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // O administrador possui sua própria área.
    if (usuario.papel === "DONO") {
      throw redirect({
        to: "/admin",
      });
    }

    /*
     * A área do funcionário ainda será criada.
     * Enquanto isso, evitamos que ele entre na área de cliente.
     */
    if (usuario.papel === "FUNCIONARIO") {
      throw redirect({
        to: "/",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Área do Cliente · Studio RD",
      },
    ],
  }),

  component: ClientLayout,
});

const rootRoute = getRouteApi("__root__");

const items = [
  {
    label: "Dashboard",
    to: "/cliente",
    icon: LayoutDashboard,
  },
  {
    label: "Agendamentos",
    to: "/cliente/agendamentos",
    icon: Calendar,
  },
  {
    label: "Assinatura",
    to: "/cliente/assinatura",
    icon: Crown,
  },
  {
    label: "Histórico",
    to: "/cliente/historico",
    icon: History,
  },
  
  {
    label: "Benefícios",
    to: "/cliente/beneficios",
    icon: Gift,
  },
  {
    label: "Fidelidade",
    to: "/cliente/fidelidade",
    icon: Crown,
  },
  {
    label: "Perfil",
    to: "/cliente/perfil",
    icon: User,
  },
];

function ClientLayout() {
  const { usuario } = rootRoute.useRouteContext();

  return (
    <DashboardShell
      items={items}
      title="Cliente"
      user={{
        name: usuario?.nome ?? "Cliente",
        role: "Cliente Studio RD",
      }}
    >
      <Outlet />
    </DashboardShell>
  );
}