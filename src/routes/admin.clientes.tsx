import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/clientes")({ component: Page });

const classMap: Record<string,string> = {
  Ouro: "bg-gold-soft text-gold border-gold/30",
  Prata: "bg-muted text-foreground border-border",
  Inativo: "bg-surface-elevated text-muted-foreground border-border",
  Perdido: "bg-destructive/15 text-destructive border-destructive/30",
};

const rows = [
  ["Rafael Dias","(11) 99999-0001","30 mai 2026","Ouro","Ativo"],
  ["André Silva","(11) 99999-0002","28 mai 2026","Ouro","Ativo"],
  ["Lucas Pinto","(11) 99999-0003","22 mai 2026","Prata","Ativo"],
  ["Felipe Souza","(11) 99999-0004","18 mai 2026","Prata","Ativo"],
  ["Marcos Rocha","(11) 99999-0005","04 mar 2026","Inativo","Inativo"],
  ["Diego Alves","(11) 99999-0006","12 jan 2026","Perdido","Inativo"],
];

function Page() {
  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        title="Clientes"
        subtitle="Base completa, classificada por engajamento."
        actions={<button className="h-10 px-5 rounded-full bg-gold text-gold-foreground text-sm font-medium">Novo Cliente</button>}
      />
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar cliente..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-elevated border border-border focus:outline-none focus:border-gold/50 text-sm" />
          </div>
          <select className="h-10 px-3 rounded-lg bg-surface-elevated border border-border text-sm">
            <option>Todos</option><option>Ouro</option><option>Prata</option><option>Inativo</option><option>Perdido</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-6 py-3">Nome</th><th className="text-left px-6 py-3">Telefone</th><th className="text-left px-6 py-3">Última visita</th><th className="text-left px-6 py-3">Classificação</th><th className="text-right px-6 py-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-border hover:bg-surface-elevated transition">
                <td className="px-6 py-4">{r[0]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[1]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${classMap[r[3]]}`}>{r[3]}</span></td>
                <td className="px-6 py-4 text-right text-muted-foreground">{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
