import { prisma } from "./prisma.server";

type CupomDb = {
  cupom: typeof prisma.cupom;
  agendamento: typeof prisma.agendamento;
  assinaturaCliente: typeof prisma.assinaturaCliente;
  usoCupom: typeof prisma.usoCupom;
};

function normalizarCodigo(valor: string): string {
  return valor.trim().toUpperCase().replace(/\s+/g, "");
}

function calcularDesconto({
  precoOriginalCentavos,
  tipo,
  percentualDesconto,
  valorDescontoCentavos,
  limiteDescontoCentavos,
}: {
  precoOriginalCentavos: number;
  tipo: "PERCENTUAL" | "VALOR_FIXO";
  percentualDesconto: number | null;
  valorDescontoCentavos: number | null;
  limiteDescontoCentavos: number | null;
}) {
  let descontoCentavos = 0;

  if (tipo === "PERCENTUAL") {
    descontoCentavos = Math.round(
      precoOriginalCentavos *
        ((percentualDesconto ?? 0) / 100),
    );

    if (limiteDescontoCentavos !== null) {
      descontoCentavos = Math.min(
        descontoCentavos,
        limiteDescontoCentavos,
      );
    }
  } else {
    descontoCentavos =
      valorDescontoCentavos ?? 0;
  }

  descontoCentavos = Math.max(
    0,
    Math.min(descontoCentavos, precoOriginalCentavos),
  );

  return {
    descontoCentavos,
    valorFinalCentavos:
      precoOriginalCentavos - descontoCentavos,
  };
}

export async function avaliarCupomParaAgendamento({
  clienteId,
  servicoId,
  precoOriginalCentavos,
  codigo,
  db = prisma,
}: {
  clienteId: string;
  servicoId: string;
  precoOriginalCentavos: number;
  codigo: string;
  db?: CupomDb;
}) {
  const codigoNormalizado = normalizarCodigo(codigo);

  if (!codigoNormalizado) {
    return {
      sucesso: false as const,
      mensagem: "Informe um cupom.",
    };
  }

  const agora = new Date();

  const cupom = await db.cupom.findUnique({
    where: {
      codigo: codigoNormalizado,
    },
    include: {
      servicos: {
        select: {
          servicoId: true,
        },
      },
    },
  });

  if (!cupom || !cupom.ativo) {
    return {
      sucesso: false as const,
      mensagem: "Cupom inválido ou inativo.",
    };
  }

  if (
    cupom.inicioEm &&
    cupom.inicioEm.getTime() > agora.getTime()
  ) {
    return {
      sucesso: false as const,
      mensagem: "Este cupom ainda não está disponível.",
    };
  }

  if (
    cupom.fimEm &&
    cupom.fimEm.getTime() < agora.getTime()
  ) {
    return {
      sucesso: false as const,
      mensagem: "Este cupom expirou.",
    };
  }

  if (
    !cupom.aplicaTodosServicos &&
    !cupom.servicos.some(
      (relacao) => relacao.servicoId === servicoId,
    )
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "Este cupom não é válido para o serviço selecionado.",
    };
  }

  if (
    cupom.valorMinimoCentavos !== null &&
    precoOriginalCentavos < cupom.valorMinimoCentavos
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "O serviço não atinge o valor mínimo deste cupom.",
    };
  }

  const [totalUsos, usosCliente] = await Promise.all([
    db.usoCupom.count({
      where: {
        cupomId: cupom.id,
      },
    }),
    db.usoCupom.count({
      where: {
        cupomId: cupom.id,
        clienteId,
      },
    }),
  ]);

  if (
    cupom.limiteUsos !== null &&
    totalUsos >= cupom.limiteUsos
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "O limite total de usos deste cupom foi atingido.",
    };
  }

  if (
    cupom.limitePorCliente !== null &&
    usosCliente >= cupom.limitePorCliente
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "Você já utilizou o limite permitido deste cupom.",
    };
  }

  const precisaHistorico =
    cupom.publico !== "TODOS" &&
    cupom.publico !== "ASSINANTE_ATIVO";

  const [agendamentosConcluidos, ultimoConcluido, assinaturaAtiva] =
    await Promise.all([
      precisaHistorico
        ? db.agendamento.count({
            where: {
              clienteId,
              status: "CONCLUIDO",
            },
          })
        : Promise.resolve(0),

      cupom.publico === "SEM_ATENDIMENTO_HA_X_DIAS"
        ? db.agendamento.findFirst({
            where: {
              clienteId,
              status: "CONCLUIDO",
            },
            orderBy: {
              inicio: "desc",
            },
            select: {
              inicio: true,
            },
          })
        : Promise.resolve(null),

      cupom.publico === "ASSINANTE_ATIVO"
        ? db.assinaturaCliente.findFirst({
            where: {
              clienteId,
              status: "ATIVA",
              vigenciaInicio: {
                lte: agora,
              },
              vigenciaFim: {
                gte: agora,
              },
            },
            select: {
              id: true,
            },
          })
        : Promise.resolve(null),
    ]);

  if (
    cupom.publico === "PRIMEIRO_ATENDIMENTO" &&
    agendamentosConcluidos > 0
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "Este cupom é exclusivo para o primeiro atendimento.",
    };
  }

  if (
    cupom.publico === "ATE_X_ATENDIMENTOS" &&
    agendamentosConcluidos >
      (cupom.quantidadeAtendimentos ?? 0)
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "Você ultrapassou a quantidade de atendimentos permitida para este cupom.",
    };
  }

  if (
    cupom.publico === "MINIMO_X_ATENDIMENTOS" &&
    agendamentosConcluidos <
      (cupom.quantidadeAtendimentos ?? 0)
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "Você ainda não atingiu a quantidade de atendimentos exigida por este cupom.",
    };
  }

  if (cupom.publico === "SEM_ATENDIMENTO_HA_X_DIAS") {
    if (!ultimoConcluido) {
      return {
        sucesso: false as const,
        mensagem:
          "Este cupom é exclusivo para clientes que já fizeram atendimento no Studio RD.",
      };
    }

    const diasSemAtendimento = Math.floor(
      (agora.getTime() -
        new Date(ultimoConcluido.inicio).getTime()) /
        (24 * 60 * 60 * 1000),
    );

    if (
      diasSemAtendimento <
      (cupom.diasSemAtendimento ?? 0)
    ) {
      return {
        sucesso: false as const,
        mensagem:
          "Você ainda não atingiu o período sem atendimento exigido por este cupom.",
      };
    }
  }

  if (
    cupom.publico === "ASSINANTE_ATIVO" &&
    !assinaturaAtiva
  ) {
    return {
      sucesso: false as const,
      mensagem:
        "Este cupom é exclusivo para assinantes ativos.",
    };
  }

  const calculo = calcularDesconto({
    precoOriginalCentavos,
    tipo: cupom.tipo,
    percentualDesconto: cupom.percentualDesconto,
    valorDescontoCentavos:
      cupom.valorDescontoCentavos,
    limiteDescontoCentavos:
      cupom.limiteDescontoCentavos,
  });

  if (calculo.descontoCentavos <= 0) {
    return {
      sucesso: false as const,
      mensagem:
        "Este cupom não gera desconto para o serviço selecionado.",
    };
  }

  return {
    sucesso: true as const,
    cupomId: cupom.id,
    codigo: cupom.codigo,
    descontoCentavos: calculo.descontoCentavos,
    precoOriginalCentavos,
    valorFinalCentavos:
      calculo.valorFinalCentavos,
    combinavelComAssinatura:
      cupom.combinavelComAssinatura,
  };
}

export async function recalcularCupomReservado({
  cupomId,
  servicoId,
  precoOriginalCentavos,
  db = prisma,
}: {
  cupomId: string;
  servicoId: string;
  precoOriginalCentavos: number;
  db?: CupomDb;
}) {
  const cupom = await db.cupom.findUnique({
    where: {
      id: cupomId,
    },
    include: {
      servicos: {
        select: {
          servicoId: true,
        },
      },
    },
  });

  if (!cupom) {
    return {
      mantem: false as const,
      motivo: "Cupom não encontrado.",
    };
  }

  if (
    !cupom.aplicaTodosServicos &&
    !cupom.servicos.some(
      (relacao) => relacao.servicoId === servicoId,
    )
  ) {
    return {
      mantem: false as const,
      motivo:
        "O cupom não é válido para o novo serviço.",
    };
  }

  if (
    cupom.valorMinimoCentavos !== null &&
    precoOriginalCentavos < cupom.valorMinimoCentavos
  ) {
    return {
      mantem: false as const,
      motivo:
        "O novo serviço não atinge o valor mínimo do cupom.",
    };
  }

  const calculo = calcularDesconto({
    precoOriginalCentavos,
    tipo: cupom.tipo,
    percentualDesconto: cupom.percentualDesconto,
    valorDescontoCentavos:
      cupom.valorDescontoCentavos,
    limiteDescontoCentavos:
      cupom.limiteDescontoCentavos,
  });

  if (calculo.descontoCentavos <= 0) {
    return {
      mantem: false as const,
      motivo:
        "O cupom não gera desconto para o novo serviço.",
    };
  }

  return {
    mantem: true as const,
    codigo: cupom.codigo,
    descontoCentavos: calculo.descontoCentavos,
    precoOriginalCentavos,
    valorFinalCentavos:
      calculo.valorFinalCentavos,
  };
}
