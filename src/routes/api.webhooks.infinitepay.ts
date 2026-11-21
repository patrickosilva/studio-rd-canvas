import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/api/webhooks/infinitepay",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;

        try {
          payload = await request.json();
        } catch {
          return Response.json(
            {
              sucesso: false,
              mensagem: "JSON inválido.",
            },
            {
              status: 400,
            },
          );
        }

        const {
          processarWebhookAssinaturaInfinitePay,
        } = await import(
          "@/lib/api/assinatura-pagamento.server"
        );

        const resultado =
          await processarWebhookAssinaturaInfinitePay(
            payload,
          );

        return Response.json(
          resultado.body,
          {
            status: resultado.status,
          },
        );
      },
    },
  },
});