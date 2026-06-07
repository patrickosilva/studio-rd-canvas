import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/admin/relatorios")({ component: Page });

function Page() {
  return (
    <div className="p-8 lg:p-12">
      <PageHeader title="Relatórios" subtitle="Exporte os dados que importam." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Faturamento mensal","Clientes por classificação","Performance por profissional","Serviços mais vendidos","Retenção RD Black","Aniversariantes do mês"].map((r)=>(
          <div key={r} className="rounded-2xl border border-border bg-surface p-6">
            <div className="text-sm font-medium">{r}</div>
            <div className="text-xs text-muted-foreground mt-1">Atualizado hoje</div>
            <button className="mt-5 h-9 px-4 rounded-full bg-gold text-gold-foreground text-xs font-medium">Exportar PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}
