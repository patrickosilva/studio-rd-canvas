import { createFileRoute } from "@tanstack/react-router";

import { BloqueiosAgendaPage } from "@/components/agenda/BloqueiosAgendaPage";

export const Route = createFileRoute("/funcionario/bloqueios")({
  component: BloqueiosAgendaPage,
});
