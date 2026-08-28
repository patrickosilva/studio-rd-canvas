import {
  createFileRoute,
  getRouteApi,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  CalendarX2,
  Crown,
  DollarSign,
  LayoutDashboard,
  Settings,
  UsersRound,
} from "lucide-react";
import { NotificadorNativo } from "@/components/notificacoes/NotificadorNativo";
import { DashboardShell } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context, location }) => {
    const { usuario } = context;

    // Visitante tentando acessar a área administrativa.
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // Cliente possui sua própria área.
    if (usuario.papel === "CLIENTE") {
      throw redirect({
        to: "/cliente",
      });
    }

    /*
     * A área operacional do funcionário ainda será criada.
     * Ele não pode acessar faturamento e relatórios administrativos.
     */
    if (usuario.papel === "FUNCIONARIO") {
      throw redirect({
        to: "/",
      });
    }

    // Somente DONO chega até aqui.
    if (usuario.papel !== "DONO") {
      throw redirect({
        to: "/",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Administração · Studio RD",
      },
    ],
  }),

  component: AdminLayout,
});

const rootRoute = getRouteApi("__root__");

const items = [
  {
    label: "Visão geral",
    to: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Monitorar agenda",
    to: "/admin/agenda",
    icon: Calendar,
  },
  {
    label: "Bloqueios",
    to: "/admin/bloqueios",
    icon: CalendarX2,
  },
  {
    label: "Financeiro",
    to: "/admin/financeiro",
    icon: DollarSign,
  },
  {
    label: "Assinaturas",
    to: "/admin/assinaturas",
    icon: Crown,
  },
  {
    label: "Relatórios",
    to: "/admin/relatorios",
    icon: BarChart3,
  },
  {
    label: "Usuários",
    to: "/admin/usuarios",
    icon: UsersRound,
  },
  {
    label: "Configurações",
    to: "/admin/configuracoes",
    icon: Settings,
  },

];

function AdminLayout() {
  const { usuario } = rootRoute.useRouteContext();

  return (
    <DashboardShell
      items={items}
      title="Administração"
      user={{
        name: usuario?.nome ?? "Administrador",
        role: "Administrador",
      }}
    >
      <NotificadorNativo />
      <Outlet />
    </DashboardShell>
  );
}