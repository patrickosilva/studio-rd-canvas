import { createFileRoute } from "@tanstack/react-router";

import { MinhaContaPage } from "@/components/conta/MinhaContaPage";
import { PerfilProfissionalCard } from "@/components/conta/PerfilProfissionalCard";

export const Route = createFileRoute("/funcionario/conta")({
  component: FuncionarioContaPage,
});

function FuncionarioContaPage() {
  return (
    <>
      <MinhaContaPage />

      <div className="max-w-4xl px-8 pb-12 lg:px-12">
        <PerfilProfissionalCard />
      </div>
    </>
  );
}