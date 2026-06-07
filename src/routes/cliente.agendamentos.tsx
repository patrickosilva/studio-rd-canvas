import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente/agendamentos")({ component: Page });

function Page() {
  const slots = ["09:00","10:00","11:00","14:00","15:00","16:30","17:30","19:00"];
  return (
    <div className="p-8 lg:p-12 max-w-6xl">
      <PageHeader title="Agendamentos" subtitle="Escolha o melhor horário para você." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6">
          <div className="text-sm text-muted-foreground mb-4">Junho 2026</div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
            {["S","T","Q","Q","S","S","D"].map((d,i)=><div key={i} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:30}).map((_,i)=>{
              const day = i+1; const active=day===14; const has=[5,12,14,21,28].includes(day);
              return (
                <button key={i} className={`aspect-square rounded-lg text-sm transition ${active?"bg-gold text-gold-foreground font-medium":has?"bg-surface-elevated hover:bg-gold-soft":"hover:bg-surface-elevated text-muted-foreground"}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="text-sm font-medium mb-1">Sexta, 14 de junho</div>
          <div className="text-xs text-muted-foreground mb-5">Horários disponíveis</div>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((s,i)=>(
              <button key={s} className={`h-10 rounded-lg text-sm transition border ${i===5?"border-gold bg-gold-soft text-gold":"border-border hover:border-gold/40"}`}>{s}</button>
            ))}
          </div>
          <button className="mt-6 w-full h-11 rounded-full bg-gold text-gold-foreground font-medium">Confirmar 16:30</button>
        </div>
      </div>
    </div>
  );
}
