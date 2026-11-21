import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const criarCheckoutSchema = z.object({
  planoId: z
    .string()
    .trim()
    .min(1, "Plano inválido."),
});

const confirmarSchema = z.object({
  orderNsu: z.string().trim().min(1).max(200),
  transactionNsu: z.string().trim().min(1).max(300),
  slug: z.string().trim().min(1).max(300),
  receiptUrl: z
    .string()
    .trim()
    .max(3000)
    .optional()
    .or(z.literal("")),
});

export const clienteCriarCheckoutAssinatura =
  createServerFn({
    method: "POST",
  })
    .validator(criarCheckoutSchema)
    .handler(async ({ data }) => {
      const { criarCheckoutAssinaturaServer } =
        await import(
          "./assinatura-pagamento.server"
        );

      return criarCheckoutAssinaturaServer(
        data.planoId,
      );
    });

export const confirmarRetornoPagamentoAssinatura =
  createServerFn({
    method: "POST",
  })
    .validator(confirmarSchema)
    .handler(async ({ data }) => {
      const { confirmarRetornoPagamentoServer } =
        await import(
          "./assinatura-pagamento.server"
        );

      return confirmarRetornoPagamentoServer({
        orderNsu: data.orderNsu,
        transactionNsu:
          data.transactionNsu,
        slug: data.slug,
        receiptUrl:
          data.receiptUrl || null,
      });
    });