import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente/historico")({ component: Page });

const rows = [
  ["30 mai 2026", "Corte + Barba", "Bruno R.", "R$ 110", "Concluído"],
  ["12 mai 2026", "Corte Masculino", "Diego S.", "R$ 70", "Concluído"],
  ["28 abr 2026", "Limpeza de Pele", "Camila T.", "R$ 130", "Concluído"],
  ["10 abr 2026", "Corte + Barba", "Bruno R.", "R$ 110", "Concluído"],
  ["22 mar 2026", "Sobrancelha", "Camila T.", "R$ 35", "Concluído"],
];

function Page() {
  return (
    <div className="p-8 lg:p-12 max-w-6xl">
      <PageHeader title="Histórico" subtitle="Todos os seus atendimentos." />
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-6 py-3">Data</th><th className="text-left px-6 py-3">Serviço</th><th className="text-left px-6 py-3">Profissional</th><th className="text-right px-6 py-3">Valor</th><th className="text-right px-6 py-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-border">
                <td className="px-6 py-4">{r[0]}</td>
                <td className="px-6 py-4">{r[1]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                <td className="px-6 py-4 text-right text-gold">{r[3]}</td>
                <td className="px-6 py-4 text-right"><span className="inline-flex px-2 py-1 rounded-full text-xs bg-gold-soft text-gold">{r[4]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
