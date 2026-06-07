import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, History, Gift, Crown, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente")({
  head: () => ({ meta: [{ title: "Área do Cliente · Studio RD" }] }),
  component: ClientLayout,
});

const items = [
  { label: "Dashboard", to: "/cliente", icon: LayoutDashboard },
  { label: "Agendamentos", to: "/cliente/agendamentos", icon: Calendar },
  { label: "Histórico", to: "/cliente/historico", icon: History },
  { label: "Benefícios", to: "/cliente/beneficios", icon: Gift },
  { label: "Fidelidade", to: "/cliente/fidelidade", icon: Crown },
  { label: "Perfil", to: "/cliente/perfil", icon: User },
];

function ClientLayout() {
  return (
    <DashboardShell items={items} title="Cliente" user={{ name: "Rafael Dias", role: "Membro RD Black" }}>
      <Outlet />
    </DashboardShell>
  );
}
