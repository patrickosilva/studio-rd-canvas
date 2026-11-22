import {
  createHash,
  randomUUID,
} from "node:crypto";

import { getRequestHeader } from "@tanstack/react-start/server";

import {
  confirmarPagamentoInfinitePay,
  criarCheckoutInfinitePay,
} from "@/lib/integracoes/infinitepay.server";
import { descriptografarSegredo } from "@/lib/integracoes/segredos.server";
import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";

type CredenciaisInfinitePay = {
  apiKey: string;
};

type ConfiguracaoPublicaInfinitePay = {
  infiniteTag?: string;
};

async function exigirCliente() {
  const usuario = await obterUsuarioAtual();

  if (!usuario || usuario.papel !== "CLIENTE") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

function adicionarMesesCalendario(
  data: Date,
  meses: number,
): Date {
  const resultado = new Date(data);
  const diaOriginal = resultado.getDate();

  resultado.setDate(1);
  resultado.setMonth(
    resultado.getMonth() + Math.max(1, meses),
  );

  const ultimoDia = new Date(
    resultado.getFullYear(),
    resultado.getMonth() + 1,
    0,
  ).getDate();

  resultado.setDate(
    Math.min(diaOriginal, ultimoDia),
  );

  return resultado;
}

function obterBasePublica(): string {
  const configurada =
    process.env.APP_URL?.trim() ||
    process.env.PUBLIC_APP_URL?.trim();

  if (configurada) {
    return configurada.replace(/\/$/, "");
  }

  const host =
    getRequestHeader("x-forwarded-host") ||
    getRequestHeader("host");

  if (host) {
    const protocolo =
      getRequestHeader("x-forwarded-proto") ||
      (process.env.NODE_ENV === "production"
        ? "https"
        : "http");

    return `${protocolo}://${host}`;
  }

  return "http://localhost:3000";
}

async function obterInfinitePayConfigurada() {
  const integracao =
    await prisma.integracaoExterna.findUnique({
      where: {
        provedor: "INFINITEPAY",
      },
      select: {
        status: true,
        configuracaoPublica: true,
        segredoCriptografado: true,
      },
    });

  if (
    !integracao ||
    integracao.status !== "CONECTADA" ||
    !integracao.segredoCriptografado
  ) {
    throw new Error(
      "A InfinitePay ainda não está conectada em Admin > Conexões.",
    );
  }

  const publica =
    (integracao.configuracaoPublica ??
      {}) as ConfiguracaoPublicaInfinitePay;

  const handle =
    typeof publica.infiniteTag === "string"
      ? publica.infiniteTag.trim().replace(/^\$/, "")
      : "";

  if (!handle) {
    throw new Error("InfiniteTag não configurada.");
  }

  const credenciais =
    descriptografarSegredo<CredenciaisInfinitePay>(
      integracao.segredoCriptografado,
    );

  if (
    !credenciais.apiKey ||
    !credenciais.apiKey.startsWith("inchk_")
  ) {
    throw new Error(
      "API Key da InfinitePay inválida ou ausente.",
    );
  }

  return {
    handle,
    apiKey: credenciais.apiKey,
  };
}

function formaPagamentoPorCaptureMethod(
  captureMethod: string | null,
): "PIX" | "CARTAO_CREDITO" | "OUTRO" {
  if (captureMethod === "pix") {
    return "PIX";
  }

  if (captureMethod === "credit_card") {
    return "CARTAO_CREDITO";
  }

  return "OUTRO";
}

async function ativarPedidoConfirmado({
  pedidoId,
  transactionNsu,
  slug,
  receiptUrl,
  amount,
  paidAmount,
  installments,
  captureMethod,
}: {
  pedidoId: string;
  transactionNsu: string;
  slug: string;
  receiptUrl?: string | null;
  amount: number;
  paidAmount: number | null;
  installments: number | null;
  captureMethod: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    // O retorno void de pg_advisory_xact_lock não deve ser decodificado
    // como resultado de consulta pelo Prisma/driver PostgreSQL.
    await tx.$executeRawUnsafe(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      pedidoId,
    );

    const pedido =
      await tx.pedidoAssinatura.findUnique({
        where: {
          id: pedidoId,
        },
        select: {
          id: true,
          clienteId: true,
          planoId: true,
          assinaturaId: true,
          status: true,
          valorFinalCentavos: true,
        },
      });

    if (!pedido) {
      throw new Error("Pedido não encontrado.");
    }

    if (
      pedido.status === "PAGO" &&
      pedido.assinaturaId
    ) {
      return {
        assinaturaId: pedido.assinaturaId,
        jaProcessado: true,
      };
    }

    if (amount !== pedido.valorFinalCentavos) {
      throw new Error(
        "O valor confirmado pela InfinitePay não corresponde ao valor do pedido.",
      );
    }

    const plano =
      await tx.planoAssinatura.findUnique({
        where: {
          id: pedido.planoId,
        },
        select: {
          id: true,
          cortesPorCiclo: true,
          duracaoMeses: true,
        },
      });

    if (!plano) {
      throw new Error("Plano do pedido não encontrado.");
    }

    const agora = new Date();

    let assinatura =
      await tx.assinaturaCliente.findFirst({
        where: {
          clienteId: pedido.clienteId,
          status: "ATIVA",
          vigenciaFim: {
            gte: agora,
          },
        },
        orderBy: {
          vigenciaFim: "desc",
        },
        select: {
          id: true,
          vigenciaFim: true,
          saldoCortes: true,
        },
      });

    if (assinatura) {
      const base =
        assinatura.vigenciaFim > agora
          ? assinatura.vigenciaFim
          : agora;

      assinatura =
        await tx.assinaturaCliente.update({
          where: {
            id: assinatura.id,
          },
          data: {
            planoId: plano.id,
            status: "ATIVA",
            vigenciaFim:
              adicionarMesesCalendario(
                base,
                plano.duracaoMeses,
              ),
            saldoCortes: {
              increment: plano.cortesPorCiclo,
            },
            provedorPagamento: "INFINITEPAY",
            renovaAutomaticamente: false,
            proximaCobrancaEm: null,
            cancelarAoFimDoCiclo: false,
            observacao:
              "Assinatura renovada/estendida após pagamento confirmado pela InfinitePay.",
          },
          select: {
            id: true,
            vigenciaFim: true,
            saldoCortes: true,
          },
        });
    } else {
      assinatura =
        await tx.assinaturaCliente.create({
          data: {
            clienteId: pedido.clienteId,
            planoId: plano.id,
            status: "ATIVA",
            inicio: agora,
            vigenciaInicio: agora,
            vigenciaFim:
              adicionarMesesCalendario(
                agora,
                plano.duracaoMeses,
              ),
            saldoCortes: plano.cortesPorCiclo,
            renovaAutomaticamente: false,
            provedorPagamento: "INFINITEPAY",
            proximaCobrancaEm: null,
            cancelarAoFimDoCiclo: false,
            observacao:
              "Assinatura ativada após pagamento confirmado pela InfinitePay.",
          },
          select: {
            id: true,
            vigenciaFim: true,
            saldoCortes: true,
          },
        });
    }

    const pagamentoExistente =
      await tx.pagamentoAssinatura.findUnique({
        where: {
          providerPaymentId: transactionNsu,
        },
        select: {
          id: true,
        },
      });

    if (!pagamentoExistente) {
      await tx.pagamentoAssinatura.create({
        data: {
          assinaturaId: assinatura.id,
          formaPagamento:
            formaPagamentoPorCaptureMethod(
              captureMethod,
            ),
          valorCentavos:
            pedido.valorFinalCentavos,
          pagoEm: agora,
          observacao:
            "Pagamento de assinatura confirmado via InfinitePay /payment_check.",
          provedorPagamento: "INFINITEPAY",
          providerPaymentId: transactionNsu,
          providerStatus: "PAID",
        },
      });
    }

    await tx.pedidoAssinatura.update({
      where: {
        id: pedido.id,
      },
      data: {
        status: "PAGO",
        assinaturaId: assinatura.id,
        transactionNsu,
        invoiceSlug: slug,
        receiptUrl: receiptUrl || null,
        captureMethod,
        paidAmountCentavos: paidAmount,
        installments,
        pagoEm: agora,
      },
    });

    return {
      assinaturaId: assinatura.id,
      jaProcessado: false,
    };
  });
}

export async function processarConfirmacaoInfinitePay({
  orderNsu,
  transactionNsu,
  slug,
  receiptUrl,
}: {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
  receiptUrl?: string | null;
}) {
  const pedido =
    await prisma.pedidoAssinatura.findUnique({
      where: {
        orderNsu,
      },
      select: {
        id: true,
        status: true,
        assinaturaId: true,
        valorFinalCentavos: true,
      },
    });

  if (!pedido) {
    return {
      sucesso: false as const,
      pago: false as const,
      mensagem: "Pedido não encontrado.",
    };
  }

  if (
    pedido.status === "PAGO" &&
    pedido.assinaturaId
  ) {
    return {
      sucesso: true as const,
      pago: true as const,
      mensagem:
        "Pagamento já havia sido confirmado.",
      assinaturaId: pedido.assinaturaId,
    };
  }

  const infinite =
    await obterInfinitePayConfigurada();

  const confirmacao =
    await confirmarPagamentoInfinitePay({
      apiKey: infinite.apiKey,
      handle: infinite.handle,
      orderNsu,
      transactionNsu,
      slug,
    });

  if (
    !confirmacao.success ||
    !confirmacao.paid
  ) {
    return {
      sucesso: false as const,
      pago: false as const,
      mensagem:
        "A InfinitePay ainda não confirmou este pagamento.",
    };
  }

  if (
    confirmacao.amount === null ||
    confirmacao.amount !==
      pedido.valorFinalCentavos
  ) {
    throw new Error(
      "Valor confirmado pela InfinitePay divergente do pedido.",
    );
  }

  const ativacao =
    await ativarPedidoConfirmado({
      pedidoId: pedido.id,
      transactionNsu,
      slug,
      receiptUrl,
      amount: confirmacao.amount,
      paidAmount: confirmacao.paidAmount,
      installments: confirmacao.installments,
      captureMethod:
        confirmacao.captureMethod,
    });

  return {
    sucesso: true as const,
    pago: true as const,
    mensagem:
      "Pagamento confirmado. Sua assinatura está ativa.",
    assinaturaId: ativacao.assinaturaId,
  };
}

export async function criarCheckoutAssinaturaServer(
  planoId: string,
) {
  const usuario = await exigirCliente();

  const acesso =
    await prisma.solicitacaoAssinatura.findFirst({
      where: {
        clienteId: usuario.id,
        status: "APROVADA",
      },
      orderBy: {
        decididoEm: "desc",
      },
      select: {
        id: true,
      },
    });

  if (!acesso) {
    return {
      sucesso: false as const,
      mensagem:
        "Seu acesso ao catálogo Premium ainda não foi aprovado pelo Studio RD.",
    };
  }

  const plano =
    await prisma.planoAssinatura.findFirst({
      where: {
        id: planoId,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        precoCentavos: true,
        cortesPorCiclo: true,
        duracaoMeses: true,
        ativo: true,
      },
    });

  if (!plano) {
    return {
      sucesso: false as const,
      mensagem:
        "Este plano não está mais disponível.",
    };
  }

  if (plano.precoCentavos < 100) {
    return {
      sucesso: false as const,
      mensagem:
        "A InfinitePay exige pagamento mínimo de R$ 1,00.",
    };
  }

  const assinaturaAtiva =
    await prisma.assinaturaCliente.findFirst({
      where: {
        clienteId: usuario.id,
        status: "ATIVA",
        vigenciaFim: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

  if (assinaturaAtiva) {
    return {
      sucesso: false as const,
      mensagem:
        "Você já possui uma assinatura ativa.",
    };
  }

  const agora = new Date();

  const pedidoExistente =
    await prisma.pedidoAssinatura.findFirst({
      where: {
        clienteId: usuario.id,
        planoId: plano.id,
        status: {
          in: [
            "CRIADO",
            "CHECKOUT_CRIADO",
            "FALHOU",
          ],
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
      select: {
        id: true,
        status: true,
        checkoutUrl: true,
        expiraEm: true,
      },
    });

  if (
    pedidoExistente?.status === "CHECKOUT_CRIADO" &&
    pedidoExistente.checkoutUrl &&
    pedidoExistente.expiraEm &&
    pedidoExistente.expiraEm > agora
  ) {
    return {
      sucesso: true as const,
      checkoutUrl:
        pedidoExistente.checkoutUrl,
      reutilizado: true,
    };
  }

  const orderNsu =
    `studio-rd-ass-${randomUUID()}`;

  const valorOriginal = plano.precoCentavos;

  // Snapshot comercial do pedido.
  // O desconto de assinatura continua separado dos cupons de agendamento.
  const descontoCentavos = 0;
  const valorFinal =
    valorOriginal - descontoCentavos;

  const pedido = pedidoExistente
    ? await prisma.pedidoAssinatura.update({
        where: {
          id: pedidoExistente.id,
        },
        data: {
          solicitacaoId: acesso.id,
          status: "CRIADO",
          orderNsu,
          checkoutUrl: null,
          expiraEm: null,
          transactionNsu: null,
          invoiceSlug: null,
          receiptUrl: null,
          captureMethod: null,
          paidAmountCentavos: null,
          installments: null,
          precoOriginalCentavos:
            valorOriginal,
          descontoCentavos,
          valorFinalCentavos:
            valorFinal,
        },
        select: {
          id: true,
          orderNsu: true,
        },
      })
    : await prisma.pedidoAssinatura.create({
        data: {
          clienteId: usuario.id,
          planoId: plano.id,
          solicitacaoId: acesso.id,
          status: "CRIADO",
          precoOriginalCentavos:
            valorOriginal,
          descontoCentavos,
          valorFinalCentavos:
            valorFinal,
          orderNsu,
        },
        select: {
          id: true,
          orderNsu: true,
        },
      });

  const expiraEm = new Date(
    agora.getTime() + 30 * 60 * 1000,
  );

  const base = obterBasePublica();

  try {
    const infinite =
      await obterInfinitePayConfigurada();

    const checkout =
      await criarCheckoutInfinitePay({
        apiKey: infinite.apiKey,
        handle: infinite.handle,
        orderNsu: pedido.orderNsu,
        descricao:
          `Assinatura Studio RD - ${plano.nome}`,
        valorCentavos: valorFinal,
        redirectUrl:
          `${base}/pagamento-assinatura/retorno`,
        webhookUrl:
          `${base}/api/webhooks/infinitepay`,
        validUntil: expiraEm,
        cliente: {
          nome: usuario.nome,
          email: usuario.email,
          telefone:
            usuario.telefone,
        },
      });

    await prisma.pedidoAssinatura.update({
      where: {
        id: pedido.id,
      },
      data: {
        status: "CHECKOUT_CRIADO",
        checkoutUrl:
          checkout.checkoutUrl,
        expiraEm,
      },
    });

    return {
      sucesso: true as const,
      checkoutUrl:
        checkout.checkoutUrl,
      reutilizado: false,
    };
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Falha ao criar checkout InfinitePay.";

    await prisma.pedidoAssinatura.update({
      where: {
        id: pedido.id,
      },
      data: {
        status: "FALHOU",
      },
    });

    return {
      sucesso: false as const,
      mensagem,
    };
  }
}

export async function confirmarRetornoPagamentoServer(data: {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
  receiptUrl?: string | null;
}) {
  try {
    return await processarConfirmacaoInfinitePay({
      orderNsu: data.orderNsu,
      transactionNsu:
        data.transactionNsu,
      slug: data.slug,
      receiptUrl:
        data.receiptUrl || null,
    });
  } catch (error) {
    console.error(
      "Falha ao confirmar retorno InfinitePay:",
      error,
    );

    return {
      sucesso: false as const,
      pago: false as const,
      mensagem:
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o pagamento.",
    };
  }
}

export async function processarWebhookAssinaturaInfinitePay(
  payload: unknown,
): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  const raw = JSON.stringify(payload ?? {});
  const hash = createHash("sha256")
    .update(raw)
    .digest("hex");

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return {
      status: 400,
      body: {
        sucesso: false,
        mensagem: "Payload inválido.",
      },
    };
  }

  const objeto =
    payload as Record<string, unknown>;

  const orderNsu =
    typeof objeto.order_nsu === "string"
      ? objeto.order_nsu
      : "";

  const transactionNsu =
    typeof objeto.transaction_nsu === "string"
      ? objeto.transaction_nsu
      : "";

  const slug =
    typeof objeto.invoice_slug === "string"
      ? objeto.invoice_slug
      : typeof objeto.slug === "string"
        ? objeto.slug
        : "";

  const receiptUrl =
    typeof objeto.receipt_url === "string"
      ? objeto.receipt_url
      : null;

  const providerEventId = createHash("sha256")
    .update(
      `${orderNsu}|${transactionNsu}|${slug}`,
    )
    .digest("hex");

  if (!orderNsu || !transactionNsu || !slug) {
    try {
      await prisma.eventoWebhookPagamento.create({
        data: {
          provedor: "INFINITEPAY",
          providerEventId,
          tipo: "paid",
          providerResourceId:
            transactionNsu || null,
          payloadHash: hash,
          status: "ERRO",
          processadoEm: new Date(),
          erro:
            "Webhook sem order_nsu, transaction_nsu ou invoice_slug.",
        },
      });
    } catch {}

    return {
      status: 400,
      body: {
        sucesso: false,
        mensagem:
          "Campos obrigatórios ausentes.",
      },
    };
  }

  try {
    const resultado =
      await processarConfirmacaoInfinitePay({
        orderNsu,
        transactionNsu,
        slug,
        receiptUrl,
      });

    try {
      await prisma.eventoWebhookPagamento.upsert({
        where: {
          provedor_providerEventId: {
            provedor: "INFINITEPAY",
            providerEventId,
          },
        },
        update: {
          status:
            resultado.pago
              ? "PROCESSADO"
              : "AGUARDANDO",
          processadoEm: new Date(),
          erro:
            resultado.pago
              ? null
              : resultado.mensagem,
        },
        create: {
          provedor: "INFINITEPAY",
          providerEventId,
          tipo: "paid",
          providerResourceId:
            transactionNsu,
          payloadHash: hash,
          status:
            resultado.pago
              ? "PROCESSADO"
              : "AGUARDANDO",
          processadoEm: new Date(),
          erro:
            resultado.pago
              ? null
              : resultado.mensagem,
        },
      });
    } catch (auditError) {
      console.error(
        "Falha ao auditar webhook InfinitePay:",
        auditError,
      );
    }

    return {
      status: resultado.pago ? 200 : 400,
      body: {
        sucesso: resultado.sucesso,
        pago: resultado.pago,
      },
    };
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Falha inesperada.";

    try {
      await prisma.eventoWebhookPagamento.upsert({
        where: {
          provedor_providerEventId: {
            provedor: "INFINITEPAY",
            providerEventId,
          },
        },
        update: {
          status: "ERRO",
          processadoEm: new Date(),
          erro: mensagem.slice(0, 1000),
        },
        create: {
          provedor: "INFINITEPAY",
          providerEventId,
          tipo: "paid",
          providerResourceId:
            transactionNsu,
          payloadHash: hash,
          status: "ERRO",
          processadoEm: new Date(),
          erro: mensagem.slice(0, 1000),
        },
      });
    } catch {}

    return {
      status: 400,
      body: {
        sucesso: false,
        mensagem,
      },
    };
  }
}