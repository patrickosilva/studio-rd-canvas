import { createServerFn } from "@tanstack/react-start";

async function getPrisma() {
  const { prisma } = await import("../prisma.server");

  return prisma;
}

export const listarDadosPublicosStudio = createServerFn({
  method: "GET",
}).handler(async () => {
  const prisma = await getPrisma();

  const [servicos, planos] = await Promise.all([
    prisma.servico.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        precoCentavos: "asc",
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        duracaoMinutos: true,
        precoCentavos: true,
      },
    }),

    prisma.planoAssinatura.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        precoCentavos: "asc",
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoCentavos: true,
        cortesPorCiclo: true,
        duracaoDias: true,
      },
    }),
  ]);

  return {
    servicos,
    planos,
  };
});