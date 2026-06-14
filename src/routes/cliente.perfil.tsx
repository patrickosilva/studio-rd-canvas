import {
  createFileRoute,
  getRouteApi,
} from "@tanstack/react-router";
import { Info, UserRound } from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/cliente/perfil")({
  component: PerfilPage,
});

const rootRoute = getRouteApi("__root__");

function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) {
    return "Não informado";
  }

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3",
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3",
    );
  }

  return telefone;
}

type CampoPerfilProps = {
  id: string;
  label: string;
  value: string;
  type?: "text" | "email" | "tel";
};

function CampoPerfil({
  id,
  label,
  value,
  type = "text",
}: CampoPerfilProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </Label>

      <Input
        id={id}
        type={type}
        value={value}
        readOnly
        className="bg-surface-elevated"
      />
    </div>
  );
}

function PerfilPage() {
  const { usuario } = rootRoute.useRouteContext();

  return (
    <div className="max-w-3xl p-8 lg:p-12">
      <PageHeader
        title="Perfil"
        subtitle="Confira as informações vinculadas à sua conta."
      />

      <section className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold-soft">
            <UserRound className="h-6 w-6 text-gold" />
          </div>

          <div>
            <h2 className="font-medium">
              {usuario?.nome ?? "Cliente"}
            </h2>

            <p className="text-sm text-muted-foreground">
              Conta de cliente Studio RD
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <CampoPerfil
            id="nome"
            label="Nome"
            value={usuario?.nome ?? ""}
          />

          <CampoPerfil
            id="email"
            label="E-mail"
            type="email"
            value={usuario?.email ?? ""}
          />

          <CampoPerfil
            id="telefone"
            label="Telefone"
            type="tel"
            value={formatarTelefone(usuario?.telefone)}
          />

          <div className="space-y-2">
            <Label
              htmlFor="dataNascimento"
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Data de nascimento
            </Label>

            <Input
              id="dataNascimento"
              value="Ainda não cadastrada"
              readOnly
              className="bg-surface-elevated text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

          <p className="text-sm text-muted-foreground">
            A visualização já está conectada à sua conta. A edição dos
            dados será habilitada quando criarmos a função segura de
            atualização do perfil.
          </p>
        </div>

        <Button
          type="button"
          disabled
          className="mt-6"
        >
          Edição em breve
        </Button>
      </section>
    </div>
  );
}