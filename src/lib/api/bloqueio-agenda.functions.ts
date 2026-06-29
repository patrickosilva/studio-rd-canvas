import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";

const criarBloqueioAgendaSchema = z.object({
  profissionalId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  inicio: z
    .string()
    .trim()
    .min(1, "Informe o início do bloqueio."),

  fim: z
    .string()
    .trim()
    .min(1, "Informe o fim do bloqueio."),

  motivo: z
    .string()
    .trim()
    .max(300, "O motivo é muito grande.")
    .optional()
    .or(z.literal("")),
});

const removerBloqueioAgendaSchema = z.object({
  bloqueioId: z
    .string()
    .trim()
    .min(1, "Bloqueio inválido."),
});

async function exigirOperacional() {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (
    usuario.papel !== "FUNCIONARIO" &&
    usuario.papel !== "DONO"
  ) {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

export const listarBloqueiosAgenda = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirOperacional();

  return prisma.bloqueioAgenda.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      inicio: "desc",
    },
    select: {
      id: true,
      profissionalId: true,
      inicio: true,
      fim: true,
      motivo: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,

      profissional: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });
});

export const criarBloqueioAgenda = createServerFn({
  method: "POST",
})
  .validator(criarBloqueioAgendaSchema)
  .handler(async ({ data }) => {
    await exigirOperacional();

    const inicio = new Date(data.inicio);
    const fim = new Date(data.fim);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime())
    ) {
      return {
        sucesso: false,
        mensagem: "Data inválida.",
      };
    }

    if (fim <= inicio) {
      return {
        sucesso: false,
        mensagem: "O fim do bloqueio precisa ser depois do início.",
      };
    }

    const profissionalId =
      data.profissionalId?.trim() || null;

    if (profissionalId) {
      const profissional = await prisma.profissional.findFirst({
        where: {
          id: profissionalId,
          ativo: true,
        },
        select: {
          id: true,
        },
      });

      if (!profissional) {
        return {
          sucesso: false,
          mensagem: "Profissional não encontrado ou inativo.",
        };
      }
    }

    const bloqueio = await prisma.bloqueioAgenda.create({
      data: {
        profissionalId,
        inicio,
        fim,
        motivo: data.motivo?.trim() || null,
      },
      select: {
        id: true,
        profissionalId: true,
        inicio: true,
        fim: true,
        motivo: true,
        ativo: true,
        profissional: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return {
      sucesso: true,
      mensagem: "Bloqueio criado com sucesso.",
      bloqueio,
    };
  });

export const removerBloqueioAgenda = createServerFn({
  method: "POST",
})
  .validator(removerBloqueioAgendaSchema)
  .handler(async ({ data }) => {
    await exigirOperacional();

    const bloqueio = await prisma.bloqueioAgenda.findUnique({
      where: {
        id: data.bloqueioId,
      },
      select: {
        id: true,
      },
    });

    if (!bloqueio) {
      return {
        sucesso: false,
        mensagem: "Bloqueio não encontrado.",
      };
    }

    await prisma.bloqueioAgenda.update({
      where: {
        id: bloqueio.id,
      },
      data: {
        ativo: false,
      },
    });

    return {
      sucesso: true,
      mensagem: "Bloqueio removido com sucesso.",
    };
  });