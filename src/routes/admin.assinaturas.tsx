import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/admin/assinaturas")({ component: Page });

const rows = [
  ["Rafael Dias","RD Black","28 mai 2026","Ativa"],
  ["André Silva","RD Black","12 mai 2026","Ativa"],
  ["Lucas Pinto","RD Black","04 mai 2026","Pendente"],
  ["Felipe Souza","RD Black","28 abr 2026","Cancelada"],
];
const statusClr: Record<string,string> = {
  Ativa: "bg-gold-soft text-gold border-gold/30",
  Pendente: "bg-muted text-muted-foreground border-border",
  Cancelada: "bg-destructive/15 text-destructive border-destructive/30",
};

function Page() {
  return (
    <div className="p-8 lg:p-12">
      <PageHeader title="Assinaturas" subtitle="Studio RD Black." />
      <div className="grid sm:grid-cols-3 gap-4">
        {[["Ativas","812","gold"],["Pendentes","23",""],["Canceladas","48",""]].map(([l,v])=>(
          <div key={l} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{l}</span>
              <Crown className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-3 text-3xl font-display">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-6 py-3">Cliente</th><th className="text-left px-6 py-3">Plano</th><th className="text-left px-6 py-3">Início</th><th className="text-right px-6 py-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-border">
                <td className="px-6 py-4">{r[0]}</td>
                <td className="px-6 py-4 text-gold">{r[1]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                <td className="px-6 py-4 text-right"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${statusClr[r[3]]}`}>{r[3]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
