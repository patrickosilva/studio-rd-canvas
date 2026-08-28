import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function getPrisma() {
  const { prisma } = await import("../prisma.server");
  return prisma;
}

async function exigirFuncionarioOuDono() {
  const { obterUsuarioAtual } = await import("../session.server");

  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (usuario.papel !== "FUNCIONARIO" && usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

const notificacaoSchema = z.object({
  notificacaoId: z.string().min(1),
});

export const funcionarioListarNotificacoes = createServerFn({
  method: "GET",
}).handler(async () => {
  const prisma = await getPrisma();
  const usuario = await exigirFuncionarioOuDono();

  return prisma.notificacao.findMany({
    where: {
      usuarioId: usuario.id,
    },
    orderBy: {
      criadoEm: "desc",
    },
    take: 20,
    select: {
      id: true,
      titulo: true,
      mensagem: true,
      link: true,
      tipo: true,
      lida: true,
      criadoEm: true,
    },
  });
});

export const funcionarioContarNotificacoesNaoLidas = createServerFn({
  method: "GET",
}).handler(async () => {
  const prisma = await getPrisma();
  const usuario = await exigirFuncionarioOuDono();

  const total = await prisma.notificacao.count({
    where: {
      usuarioId: usuario.id,
      lida: false,
    },
  });

  return {
    total,
  };
});

export const funcionarioMarcarNotificacaoComoLida = createServerFn({
  method: "POST",
})
  .validator(notificacaoSchema)
  .handler(async ({ data }) => {
    const prisma = await getPrisma();
    const usuario = await exigirFuncionarioOuDono();

    await prisma.notificacao.updateMany({
      where: {
        id: data.notificacaoId,
        usuarioId: usuario.id,
      },
      data: {
        lida: true,
      },
    });

    return {
      sucesso: true,
    };
  });

export const funcionarioMarcarTodasNotificacoesComoLidas =
  createServerFn({
    method: "POST",
  }).handler(async () => {
    const prisma = await getPrisma();
    const usuario = await exigirFuncionarioOuDono();

    await prisma.notificacao.updateMany({
      where: {
        usuarioId: usuario.id,
        lida: false,
      },
      data: {
        lida: true,
      },
    });

    return {
      sucesso: true,
    };
  });