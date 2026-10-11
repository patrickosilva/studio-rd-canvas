import { createFileRoute } from "@tanstack/react-router";
import { CorrecoesServicoPage } from "@/components/agenda/CorrecoesServicoPage";

export const Route = createFileRoute("/admin/correcoes")({
  component: CorrecoesServicoPage,
});
