import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";
import { Gift, Crown, Star, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/cliente/beneficios")({ component: Page });

function Page() {
  const items = [
    { icon: Crown, t: "2 cortes inclusos / mês", d: "Restam 1 corte neste ciclo." },
    { icon: ShieldCheck, t: "Prioridade na agenda", d: "Janela exclusiva de reserva." },
    { icon: Star, t: "20% off em limpeza de pele", d: "Aplicado automaticamente." },
    { icon: Gift, t: "Preço de membro em produtos", d: "Linha premium até -30%." },
  ];
  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <PageHeader title="Benefícios" subtitle="Tudo que vem com o RD Black." />
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.t} className="rounded-2xl border border-border bg-surface p-6">
            <i.icon className="w-5 h-5 text-gold" />
            <div className="mt-4 font-medium">{i.t}</div>
            <div className="text-sm text-muted-foreground mt-1">{i.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
