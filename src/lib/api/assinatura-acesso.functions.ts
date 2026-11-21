import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

const decidirSchema = z.object({
  solicitacaoId: z
    .string()
    .trim()
    .min(1, "Solicitação inválida."),
  decisao: z.enum([
    "APROVAR",
    "RECUSAR",
  ]),
});

const configSchema = z.object({
  aprovacaoAutomatica: z.boolean(),
});

async function exigirCliente() {
  const usuario = await obterUsuarioAtual();

  if (!usuario || usuario.papel !== "CLIENTE") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

async function exigirDono() {
  const usuario = await obterUsuarioAtual();

  if (!usuario || usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

async function obterSolicitacaoAberta(
  clienteId: string,
) {
  return prisma.solicitacaoAssinatura.findFirst({
    where: {
      clienteId,
      status: {
        in: ["PENDENTE", "APROVADA"],
      },
    },
    orderBy: [
      {
        decididoEm: "desc",
      },
      {
        solicitadoEm: "desc",
      },
    ],
    select: {
      id: true,
      status: true,
      solicitadoEm: true,
      decididoEm: true,
      observacaoDecisao: true,
    },
  });
}

export const clienteEstadoAcessoAssinaturas =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    const usuario = await exigirCliente();

    const aberta =
      await obterSolicitacaoAberta(usuario.id);

    if (aberta) {
      return {
        podeVerCatalogo:
          aberta.status === "APROVADA",
        solicitacao: aberta,
      };
    }

    const ultima =
      await prisma.solicitacaoAssinatura.findFirst({
        where: {
          clienteId: usuario.id,
        },
        orderBy: {
          solicitadoEm: "desc",
        },
        select: {
          id: true,
          status: true,
          solicitadoEm: true,
          decididoEm: true,
          observacaoDecisao: true,
        },
      });

    return {
      podeVerCatalogo: false,
      solicitacao: ultima,
    };
  });

export const clienteSolicitarAcessoAssinatura =
  createServerFn({
    method: "POST",
  }).handler(async () => {
    const usuario = await exigirCliente();

    const aberta =
      await obterSolicitacaoAberta(usuario.id);

    if (aberta) {
      return {
        sucesso: false,
        mensagem:
          aberta.status === "APROVADA"
            ? "Seu acesso ao catálogo Premium já está liberado."
            : "Sua solicitação já está aguardando análise do Studio RD.",
      };
    }

    const solicitacao =
      await prisma.solicitacaoAssinatura.create({
        data: {
          clienteId: usuario.id,
          planoId: null,
          status: "PENDENTE",
        },
        select: {
          id: true,
          status: true,
          solicitadoEm: true,
        },
      });

    return {
      sucesso: true,
      mensagem:
        "Solicitação enviada. O Studio RD vai analisar seu acesso ao catálogo Premium.",
      solicitacao,
    };
  });

export const clienteCatalogoAssinaturas =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    const usuario = await exigirCliente();

    const acesso =
      await prisma.solicitacaoAssinatura.findFirst({
        where: {
          clienteId: usuario.id,
          status: "APROVADA",
        },
        select: {
          id: true,
        },
      });

    if (!acesso) {
      throw new Error(
        "O catálogo Premium só fica disponível depois da aprovação do Studio RD.",
      );
    }

    return prisma.planoAssinatura.findMany({
      where: {
        ativo: true,
      },
      orderBy: [
        {
          precoCentavos: "asc",
        },
        {
          cortesPorCiclo: "asc",
        },
      ],
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoCentavos: true,
        cortesPorCiclo: true,
        duracaoMeses: true,
      },
    });
  });

export const adminListarSolicitacoesAssinatura =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    await exigirDono();

    return prisma.solicitacaoAssinatura.findMany({
      where: {
        status: {
          in: [
            "PENDENTE",
            "APROVADA",
            "RECUSADA",
            "CANCELADA",
            "UTILIZADA",
          ],
        },
      },
      orderBy: [
        {
          solicitadoEm: "desc",
        },
      ],
      take: 150,
      select: {
        id: true,
        status: true,
        solicitadoEm: true,
        decididoEm: true,
        observacaoDecisao: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    });
  });

export const adminObterConfiguracaoAssinaturas =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    await exigirDono();

    const config =
      await prisma.configuracaoAssinatura.upsert({
        where: {
          chave: "STUDIO_RD",
        },
        update: {
          aprovacaoAutomatica: false,
        },
        create: {
          chave: "STUDIO_RD",
          aprovacaoAutomatica: false,
        },
        select: {
          aprovacaoAutomatica: true,
        },
      });

    return config;
  });

export const adminAtualizarAprovacaoAutomatica =
  createServerFn({
    method: "POST",
  })
    .validator(configSchema)
    .handler(async () => {
      await exigirDono();

      const config =
        await prisma.configuracaoAssinatura.upsert({
          where: {
            chave: "STUDIO_RD",
          },
          update: {
            aprovacaoAutomatica: false,
          },
          create: {
            chave: "STUDIO_RD",
            aprovacaoAutomatica: false,
          },
          select: {
            aprovacaoAutomatica: true,
          },
        });

      return {
        sucesso: true,
        mensagem:
          "A aprovação automática está desativada. O Studio RD decide cada solicitação manualmente.",
        config,
      };
    });

export const adminDecidirSolicitacaoAssinatura =
  createServerFn({
    method: "POST",
  })
    .validator(decidirSchema)
    .handler(async ({ data }) => {
      const dono = await exigirDono();

      const solicitacao =
        await prisma.solicitacaoAssinatura.findUnique({
          where: {
            id: data.solicitacaoId,
          },
          select: {
            id: true,
            status: true,
            cliente: {
              select: {
                nome: true,
              },
            },
          },
        });

      if (!solicitacao) {
        return {
          sucesso: false,
          mensagem:
            "Solicitação não encontrada.",
        };
      }

      if (solicitacao.status !== "PENDENTE") {
        return {
          sucesso: false,
          mensagem:
            "Esta solicitação já foi decidida.",
        };
      }

      const status =
        data.decisao === "APROVAR"
          ? "APROVADA"
          : "RECUSADA";

      await prisma.solicitacaoAssinatura.update({
        where: {
          id: solicitacao.id,
        },
        data: {
          planoId: null,
          status,
          decididoEm: new Date(),
          decididoPorUsuarioId: dono.id,
          observacaoDecisao:
            status === "APROVADA"
              ? "Acesso ao catálogo Premium aprovado pelo Studio RD."
              : "Acesso ao catálogo Premium não aprovado pelo Studio RD.",
        },
      });

      return {
        sucesso: true,
        mensagem:
          status === "APROVADA"
            ? `Catálogo Premium liberado para ${solicitacao.cliente.nome}.`
            : `Solicitação de ${solicitacao.cliente.nome} recusada.`,
      };
    });