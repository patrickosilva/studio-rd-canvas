import { createFileRoute } from "@tanstack/react-router";
import { MinhaContaPage } from "@/components/conta/MinhaContaPage";

export const Route = createFileRoute("/cliente/perfil")({
  component: MinhaContaPage,
});