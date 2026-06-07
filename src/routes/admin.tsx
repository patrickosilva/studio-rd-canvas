import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, Users, DollarSign, Crown, Megaphone, BarChart3, Settings } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Studio RD" }] }),
  component: AdminLayout,
});

const items = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Agenda", to: "/admin/agenda", icon: Calendar },
  { label: "Clientes", to: "/admin/clientes", icon: Users },
  { label: "Financeiro", to: "/admin/financeiro", icon: DollarSign },
  { label: "Assinaturas", to: "/admin/assinaturas", icon: Crown },
  { label: "Marketing", to: "/admin/marketing", icon: Megaphone },
  { label: "Relatórios", to: "/admin/relatorios", icon: BarChart3 },
  { label: "Configurações", to: "/admin/configuracoes", icon: Settings },
];

function AdminLayout() {
  return (
    <DashboardShell items={items} title="Admin" user={{ name: "Studio RD", role: "Administrador" }}>
      <Outlet />
    </DashboardShell>
  );
}
