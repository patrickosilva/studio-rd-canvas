import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { TrendingUp, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/financeiro")({ component: Page });

function Page() {
  const line = [20,28,25,40,38,52,48,60,72,68,82,90];
  return (
    <div className="p-8 lg:p-12">
      <PageHeader title="Financeiro" subtitle="Acompanhamento detalhado de receita." />
      <div className="grid sm:grid-cols-4 gap-4">
        {[["Receita Mês","R$ 124.300"],["Despesas","R$ 38.420"],["Lucro","R$ 85.880"],["Margem","69%"]].map(([l,v])=>(
          <div key={l} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{l}</span>
              <DollarSign className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-3 text-2xl font-display">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm font-medium">Crescimento</div>
            <div className="text-xs text-muted-foreground">Receita acumulada por mês</div>
          </div>
          <div className="inline-flex items-center gap-1 text-sm text-gold"><TrendingUp className="w-4 h-4" /> +24% YoY</div>
        </div>
        <svg viewBox="0 0 600 200" className="w-full h-56">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline fill="url(#g)" stroke="none" points={`0,200 ${line.map((v,i)=>`${(i*600)/(line.length-1)},${200-v*1.8}`).join(" ")} 600,200`} />
          <polyline fill="none" stroke="oklch(0.78 0.13 85)" strokeWidth="2" points={line.map((v,i)=>`${(i*600)/(line.length-1)},${200-v*1.8}`).join(" ")} />
        </svg>
      </div>
    </div>
  );
}
