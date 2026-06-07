import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente/fidelidade")({ component: Page });

function Page() {
  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <PageHeader title="Fidelidade" subtitle="Quanto mais você vem, mais ganha." />
      <div className="rounded-2xl border border-gold/20 bg-gradient-dark p-8 shadow-premium">
        <div className="text-xs uppercase tracking-widest text-gold">Seu saldo</div>
        <div className="mt-3 text-5xl font-display">1.240 <span className="text-base text-muted-foreground">pontos</span></div>
        <div className="mt-6 h-2 bg-surface-elevated rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-gold" />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Faltam 260 pontos para o próximo prêmio.</div>
      </div>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[{t:"Corte grátis",p:"1.500 pts"},{t:"Barba grátis",p:"800 pts"},{t:"Produto premium",p:"2.500 pts"}].map((r)=>(
          <div key={r.t} className="rounded-2xl border border-border bg-surface p-6">
            <div className="font-medium">{r.t}</div>
            <div className="text-sm text-gold mt-1">{r.p}</div>
            <button className="mt-4 w-full h-10 rounded-full border border-border text-sm hover:border-gold/40">Resgatar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
