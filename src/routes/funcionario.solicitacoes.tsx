import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/funcionario/solicitacoes")({
  component: SolicitacoesPage,
});

function SolicitacoesPage() {
  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Solicitações"
        subtitle="Aqui ficarão os pedidos de agendamento enviados pelos clientes."
      />

      <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
        <CalendarCheck className="h-10 w-10 text-muted-foreground" />

        <h2 className="mt-5 text-xl font-display">
          Nenhuma solicitação pendente
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Quando um cliente solicitar um horário, o pedido aparecerá aqui
          para ser confirmado ou recusado por um funcionário.
        </p>
      </section>
    </div>
  );
}