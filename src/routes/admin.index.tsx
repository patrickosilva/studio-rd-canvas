import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { DollarSign, TrendingUp, Users, Crown, Calendar, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Page });

const kpis = [
  { label: "Faturamento Hoje", value: "R$ 4.820", delta: "+12%", icon: DollarSign },
  { label: "Faturamento Semana", value: "R$ 28.940", delta: "+8%", icon: TrendingUp },
  { label: "Faturamento Mês", value: "R$ 124.300", delta: "+18%", icon: TrendingUp },
  { label: "Ticket Médio", value: "R$ 142", delta: "+4%", icon: DollarSign },
  { label: "Clientes Ativos", value: "1.284", delta: "+62", icon: Users },
  { label: "Assinaturas RD Black", value: "812", delta: "+24", icon: Crown },
];

function Page() {
  const bars = [42,55,38,68,72,58,84,90,76,82,95,88];
  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        title="Visão Geral"
        subtitle="Resumo financeiro e operacional do Studio RD."
        actions={
          <>
            <button className="h-10 px-4 rounded-full border border-border text-sm hover:bg-surface">Exportar</button>
            <button className="h-10 px-5 rounded-full bg-gold text-gold-foreground text-sm font-medium">Novo agendamento</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{k.label}</span>
              <k.icon className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-3 text-2xl font-display">{k.value}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gold">
              <ArrowUpRight className="w-3 h-3" /> {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-medium">Faturamento</div>
              <div className="text-xs text-muted-foreground">Últimos 12 meses</div>
            </div>
            <div className="text-2xl font-display text-gold">R$ 1,2M</div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {bars.map((h,i)=>(
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-gold/30 to-gold/80" style={{height:`${h}%`}} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=><span key={i}>{m}</span>)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Próximos agendamentos</div>
            <Calendar className="w-4 h-4 text-gold" />
          </div>
          <ul className="space-y-3">
            {[
              ["09:00","Lucas P.","Corte + Barba"],
              ["10:30","André S.","Barba"],
              ["13:00","Felipe T.","Limpeza"],
              ["15:30","Marcos R.","Corte"],
              ["17:00","Diego A.","Pacote"],
            ].map((r)=>(
              <li key={r[0]} className="flex items-center gap-3 py-2 border-b border-border last:border-none">
                <div className="w-12 text-sm text-gold">{r[0]}</div>
                <div className="flex-1">
                  <div className="text-sm">{r[1]}</div>
                  <div className="text-xs text-muted-foreground">{r[2]}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border text-sm font-medium">Movimentações recentes</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-6 py-3">Cliente</th><th className="text-left px-6 py-3">Serviço</th><th className="text-left px-6 py-3">Profissional</th><th className="text-left px-6 py-3">Forma</th><th className="text-right px-6 py-3">Valor</th></tr>
          </thead>
          <tbody>
            {[
              ["Rafael Dias","Corte + Barba","Bruno R.","Pix","R$ 110"],
              ["André Silva","Limpeza de Pele","Camila T.","Crédito","R$ 130"],
              ["Lucas Pinto","Corte","Diego S.","RD Black","Incluso"],
              ["Felipe Souza","Pacote Premium","Bruno R.","Crédito","R$ 220"],
            ].map((r,i)=>(
              <tr key={i} className="border-t border-border">
                <td className="px-6 py-4">{r[0]}</td>
                <td className="px-6 py-4">{r[1]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[2]}</td>
                <td className="px-6 py-4 text-muted-foreground">{r[3]}</td>
                <td className="px-6 py-4 text-right text-gold">{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
