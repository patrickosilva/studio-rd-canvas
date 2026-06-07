import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { Gift, Cake, Crown, UserMinus } from "lucide-react";

export const Route = createFileRoute("/admin/marketing")({ component: Page });

const groups = [
  { icon: Crown, t: "Clientes VIP", n: "127", d: "Top 10% em frequência e ticket." },
  { icon: Cake, t: "Aniversariantes", n: "18", d: "Aniversários nos próximos 30 dias." },
  { icon: UserMinus, t: "Clientes Inativos", n: "84", d: "Sem visita há mais de 60 dias." },
  { icon: Gift, t: "Campanhas Ativas", n: "3", d: "Em execução neste mês." },
];

function Page() {
  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        title="Marketing"
        subtitle="Engaje os clientes certos, no momento certo."
        actions={<button className="h-10 px-5 rounded-full bg-gold text-gold-foreground text-sm font-medium">Nova Campanha</button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((g)=>(
          <div key={g.t} className="rounded-2xl border border-border bg-surface p-6 hover:border-gold/40 transition">
            <g.icon className="w-5 h-5 text-gold" />
            <div className="mt-5 text-3xl font-display">{g.n}</div>
            <div className="mt-1 text-sm font-medium">{g.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{g.d}</div>
            <button className="mt-5 w-full h-9 rounded-full border border-border text-xs hover:border-gold/40">Criar campanha</button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border text-sm font-medium">Campanhas recentes</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-6 py-3">Nome</th><th className="text-left px-6 py-3">Público</th><th className="text-left px-6 py-3">Canal</th><th className="text-right px-6 py-3">Conversão</th></tr>
          </thead>
          <tbody>
            {[
              ["Volte e ganhe 20%","Inativos","WhatsApp","18%"],
              ["Mês do Aniversário","Aniversariantes","E-mail","42%"],
              ["VIP Day","VIPs","WhatsApp","61%"],
            ].map((r,i)=>(
              <tr key={i} className="border-t border-border">
                <td className="px-6 py-4">{r[0]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[1]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                <td className="px-6 py-4 text-right text-gold">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
