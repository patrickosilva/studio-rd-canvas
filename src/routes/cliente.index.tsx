import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Crown, Star, Scissors, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente/")({
  component: ClientDashboard,
});

function ClientDashboard() {
  return (
    <div className="p-8 lg:p-12 max-w-7xl">
      <PageHeader
        title="Olá, Rafael."
        subtitle="Aqui está o resumo da sua experiência Studio RD."
        actions={
          <button className="h-10 px-5 rounded-full bg-gold text-gold-foreground text-sm font-medium hover:opacity-90 transition">
            Novo Agendamento
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Next appointment */}
        <div className="lg:col-span-2 rounded-2xl border border-gold/20 bg-gradient-dark p-7 shadow-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.13_85/0.15),transparent_60%)]" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-gold">Próximo Agendamento</div>
            <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="text-3xl font-display">Corte + Barba</div>
                <div className="text-muted-foreground mt-1">Sexta, 14 de junho · 16h30</div>
                <div className="text-sm mt-3">com <span className="text-gold">Bruno R.</span></div>
              </div>
              <div className="flex gap-2">
                <button className="h-10 px-4 rounded-full border border-border text-sm hover:bg-surface-elevated">Reagendar</button>
                <button className="h-10 px-4 rounded-full bg-gold text-gold-foreground text-sm font-medium">Detalhes</button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-border bg-surface p-7">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Assinatura</span>
            <Crown className="w-4 h-4 text-gold" />
          </div>
          <div className="mt-4 text-2xl font-display">RD Black</div>
          <div className="text-sm text-muted-foreground">Ativo · próxima cobrança 28/06</div>
          <div className="mt-5 hairline" />
          <div className="mt-5 text-sm flex justify-between">
            <span className="text-muted-foreground">Cortes restantes</span>
            <span className="text-gold font-medium">1 de 2</span>
          </div>
        </div>

        {/* KPI cards */}
        {[
          { label: "Pontos de Fidelidade", value: "1.240", icon: Star },
          { label: "Cortes este ano", value: "18", icon: Scissors },
          { label: "Economia RD Black", value: "R$ 420", icon: Crown },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{k.label}</span>
              <k.icon className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-3 text-3xl font-display">{k.value}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="mt-10 rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <h3 className="text-sm font-medium">Histórico recente</h3>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            Ver tudo <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-6 py-3">Data</th><th className="text-left px-6 py-3">Serviço</th><th className="text-left px-6 py-3">Profissional</th><th className="text-right px-6 py-3">Valor</th></tr>
          </thead>
          <tbody>
            {[
              ["30 mai 2026", "Corte + Barba", "Bruno R.", "R$ 110"],
              ["12 mai 2026", "Corte Masculino", "Diego S.", "R$ 70"],
              ["28 abr 2026", "Limpeza de Pele", "Camila T.", "R$ 130"],
              ["10 abr 2026", "Corte + Barba", "Bruno R.", "R$ 110"],
            ].map((r) => (
              <tr key={r[0]} className="border-t border-border">
                <td className="px-6 py-4">{r[0]}</td>
                <td className="px-6 py-4">{r[1]}</td>
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
