import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/cliente/perfil")({ component: Page });

function Page() {
  const Field = ({ label, value, type="text" }: { label:string; value:string; type?:string }) => (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input defaultValue={value} type={type} className="mt-2 w-full h-11 px-4 rounded-lg bg-surface-elevated border border-border focus:outline-none focus:border-gold/50 transition" />
    </label>
  );
  return (
    <div className="p-8 lg:p-12 max-w-3xl">
      <PageHeader title="Perfil" subtitle="Suas informações." />
      <div className="rounded-2xl border border-border bg-surface p-8 space-y-5">
        <Field label="Nome" value="Rafael Dias" />
        <Field label="E-mail" value="rafael@studiord.com" type="email" />
        <Field label="Telefone" value="(11) 99999-0000" type="tel" />
        <Field label="Data de Nascimento" value="1992-03-14" type="date" />
        <button className="h-11 px-6 rounded-full bg-gold text-gold-foreground font-medium">Salvar alterações</button>
      </div>
    </div>
  );
}
