import { createServerFn } from "@tanstack/react-start";

async function getPrisma() {
  const { prisma } = await import("../prisma.server");

  return prisma;
}

async function exigirDonoClientes() {
  const { obterUsuarioAtual } = await import("../session.server");

  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

export const adminListarClientesResumo = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDonoClientes();

  const prisma = await getPrisma();

  const agora = new Date();

  const clientes = await prisma.usuario.findMany({
    where: {
      papel: "CLIENTE",
    },
    orderBy: {
      criadoEm: "desc",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      criadoEm: true,
      agendamentos: {
        orderBy: {
          inicio: "desc",
        },
        select: {
          id: true,
          inicio: true,
          status: true,
          valorPagoCentavos: true,
          servico: {
            select: {
              nome: true,
              precoCentavos: true,
            },
          },
        },
      },
      assinaturas: {
        orderBy: {
          criadoEm: "desc",
        },
        select: {
          id: true,
          status: true,
          vigenciaFim: true,
          saldoCortes: true,
          plano: {
            select: {
              nome: true,
            },
          },
        },
      },
    },
  });

  return clientes.map((cliente) => {
    const agendamentosConcluidos = cliente.agendamentos.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    );

    const totalGastoCentavos = agendamentosConcluidos.reduce(
      (total, agendamento) =>
        total +
        (agendamento.valorPagoCentavos ??
          agendamento.servico.precoCentavos),
      0,
    );

    const assinaturaAtiva = cliente.assinaturas.find(
      (assinatura) =>
        assinatura.status === "ATIVA" &&
        assinatura.vigenciaFim >= agora,
    );

    const ultimoAgendamento = cliente.agendamentos[0] ?? null;

    return {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      criadoEm: cliente.criadoEm,
      totalAgendamentos: cliente.agendamentos.length,
      totalConcluidos: agendamentosConcluidos.length,
      totalGastoCentavos,
      ultimoAgendamento,
      assinaturaAtiva: assinaturaAtiva
        ? {
            id: assinaturaAtiva.id,
            status: assinaturaAtiva.status,
            vigenciaFim: assinaturaAtiva.vigenciaFim,
            saldoCortes: assinaturaAtiva.saldoCortes,
            planoNome: assinaturaAtiva.plano.nome,
          }
        : null,
    };
  });
});