import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/admin/configuracoes")({ component: Page });

function Page() {
  const Row = ({ t, d, on=false }: { t:string; d:string; on?:boolean }) => (
    <div className="flex items-center justify-between py-5 border-b border-border last:border-none">
      <div>
        <div className="text-sm font-medium">{t}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{d}</div>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition ${on?"bg-gold":"bg-surface-elevated"}`}>
        <div className={`absolute top-0.5 ${on?"left-5.5":"left-0.5"} w-5 h-5 rounded-full bg-background transition`} />
      </div>
    </div>
  );
  return (
    <div className="p-8 lg:p-12 max-w-3xl">
      <PageHeader title="Configurações" subtitle="Preferências do estabelecimento." />
      <div className="rounded-2xl border border-border bg-surface px-6">
        <Row t="Notificações por WhatsApp" d="Confirmação automática de agendamentos." on />
        <Row t="Lembrete 24h antes" d="Avisar cliente um dia antes do horário." on />
        <Row t="Programa de Fidelidade" d="Acúmulo automático de pontos por visita." on />
        <Row t="Lista de espera" d="Encaixar clientes em horários vagos." />
      </div>
    </div>
  );
}
