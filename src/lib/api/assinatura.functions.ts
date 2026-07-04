import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";
import type { FormaPagamento } from "../../generated/prisma/client";

const formasPagamento = [
  "PIX",
  "DINHEIRO",
  "CARTAO_DEBITO",
  "CARTAO_CREDITO",
  "ASSINATURA",
  "CORTESIA",
  "OUTRO",
] as const;

const criarPlanoAssinaturaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do plano.")
    .max(80, "O nome do plano é muito grande."),

  descricao: z
    .string()
    .trim()
    .max(500, "A descrição é muito grande.")
    .optional()
    .or(z.literal("")),

  precoCentavos: z
    .number()
    .int("O preço precisa estar em centavos.")
    .min(0, "O preço não pode ser negativo."),

  cortesPorCiclo: z
    .number()
    .int("A quantidade de cortes precisa ser inteira.")
    .min(1, "Informe pelo menos 1 corte."),

  duracaoDias: z
    .number()
    .int("A duração precisa ser em dias.")
    .min(1, "A duração precisa ter pelo menos 1 dia.")
    .max(365, "A duração não pode passar de 365 dias."),

  ativo: z.boolean().default(true),
});

const ativarAssinaturaClienteSchema = z.object({
  clienteId: z
    .string()
    .trim()
    .min(1, "Cliente inválido."),

  planoId: z
    .string()
    .trim()
    .min(1, "Plano inválido."),

  vigenciaInicio: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  formaPagamento: z
    .enum(formasPagamento)
    .optional(),

  valorPagoCentavos: z
    .number()
    .int("O valor precisa estar em centavos.")
    .min(0, "O valor não pode ser negativo.")
    .optional(),

  observacao: z
    .string()
    .trim()
    .max(500, "A observação é muito grande.")
    .optional()
    .or(z.literal("")),
});

const cancelarAssinaturaClienteSchema = z.object({
  assinaturaId: z
    .string()
    .trim()
    .min(1, "Assinatura inválida."),

  observacao: z
    .string()
    .trim()
    .max(500, "A observação é muito grande.")
    .optional()
    .or(z.literal("")),
});

async function exigirDono() {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

async function exigirCliente() {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (usuario.papel !== "CLIENTE") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

function adicionarDias(data: Date, dias: number): Date {
  const resultado = new Date(data);

  resultado.setDate(resultado.getDate() + dias);

  return resultado;
}

export const adminListarPlanosAssinatura = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.planoAssinatura.findMany({
    orderBy: {
      criadoEm: "desc",
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      precoCentavos: true,
      cortesPorCiclo: true,
      duracaoDias: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  });
});

export const adminCriarPlanoAssinatura = createServerFn({
  method: "POST",
})
  .validator(criarPlanoAssinaturaSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const planoExistente =
      await prisma.planoAssinatura.findFirst({
        where: {
          nome: {
            equals: data.nome,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

    if (planoExistente) {
      return {
        sucesso: false,
        mensagem: "Já existe um plano com esse nome.",
      };
    }

    const plano = await prisma.planoAssinatura.create({
      data: {
        nome: data.nome,
        descricao: data.descricao?.trim() || null,
        precoCentavos: data.precoCentavos,
        cortesPorCiclo: data.cortesPorCiclo,
        duracaoDias: data.duracaoDias,
        ativo: data.ativo,
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoCentavos: true,
        cortesPorCiclo: true,
        duracaoDias: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Plano de assinatura criado com sucesso.",
      plano,
    };
  });

export const adminListarClientesParaAssinatura = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.usuario.findMany({
    where: {
      papel: "CLIENTE",
      ativo: true,
    },
    orderBy: {
      nome: "asc",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
    },
  });
});

export const adminListarAssinaturas = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.assinaturaCliente.findMany({
    orderBy: {
      criadoEm: "desc",
    },
    select: {
      id: true,
      status: true,
      inicio: true,
      vigenciaInicio: true,
      vigenciaFim: true,
      saldoCortes: true,
      renovaAutomaticamente: true,
      observacao: true,
      criadoEm: true,
      atualizadoEm: true,

      cliente: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },

      plano: {
        select: {
          id: true,
          nome: true,
          precoCentavos: true,
          cortesPorCiclo: true,
          duracaoDias: true,
        },
      },

      usos: {
        select: {
          id: true,
          quantidadeCortes: true,
          criadoEm: true,
          agendamento: {
            select: {
              id: true,
              inicio: true,
              status: true,
              servico: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
        orderBy: {
          criadoEm: "desc",
        },
      },

      pagamentos: {
        select: {
          id: true,
          formaPagamento: true,
          valorCentavos: true,
          pagoEm: true,
          observacao: true,
        },
        orderBy: {
          pagoEm: "desc",
        },
      },
    },
  });
});

export const adminAtivarAssinaturaCliente = createServerFn({
  method: "POST",
})
  .validator(ativarAssinaturaClienteSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const cliente = await prisma.usuario.findFirst({
      where: {
        id: data.clienteId,
        papel: "CLIENTE",
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
      },
    });

    if (!cliente) {
      return {
        sucesso: false,
        mensagem: "Cliente não encontrado ou inativo.",
      };
    }

    const plano = await prisma.planoAssinatura.findFirst({
      where: {
        id: data.planoId,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        precoCentavos: true,
        cortesPorCiclo: true,
        duracaoDias: true,
      },
    });

    if (!plano) {
      return {
        sucesso: false,
        mensagem: "Plano não encontrado ou inativo.",
      };
    }

    const agora = new Date();

    const assinaturaAtiva =
      await prisma.assinaturaCliente.findFirst({
        where: {
          clienteId: cliente.id,
          status: "ATIVA",
          vigenciaFim: {
            gte: agora,
          },
        },
        select: {
          id: true,
        },
      });

    if (assinaturaAtiva) {
      return {
        sucesso: false,
        mensagem:
          "Esse cliente já possui uma assinatura ativa.",
      };
    }

    const vigenciaInicio =
      data.vigenciaInicio?.trim()
        ? new Date(data.vigenciaInicio)
        : agora;

    if (Number.isNaN(vigenciaInicio.getTime())) {
      return {
        sucesso: false,
        mensagem: "Data de início inválida.",
      };
    }

    const vigenciaFim = adicionarDias(
      vigenciaInicio,
      plano.duracaoDias,
    );

    const formaPagamento =
      data.formaPagamento as FormaPagamento | undefined;

    const valorPagoCentavos =
      data.valorPagoCentavos ?? plano.precoCentavos;

    const assinatura =
      await prisma.$transaction(async (tx) => {
        const assinaturaCriada =
          await tx.assinaturaCliente.create({
            data: {
              clienteId: cliente.id,
              planoId: plano.id,
              status: "ATIVA",
              inicio: vigenciaInicio,
              vigenciaInicio,
              vigenciaFim,
              saldoCortes: plano.cortesPorCiclo,
              observacao: data.observacao?.trim() || null,
            },
            select: {
              id: true,
              status: true,
              inicio: true,
              vigenciaInicio: true,
              vigenciaFim: true,
              saldoCortes: true,
              observacao: true,

              cliente: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  telefone: true,
                },
              },

              plano: {
                select: {
                  id: true,
                  nome: true,
                  precoCentavos: true,
                  cortesPorCiclo: true,
                  duracaoDias: true,
                },
              },
            },
          });

        if (formaPagamento) {
          await tx.pagamentoAssinatura.create({
            data: {
              assinaturaId: assinaturaCriada.id,
              formaPagamento,
              valorCentavos: valorPagoCentavos,
              pagoEm: new Date(),
              observacao: "Pagamento registrado na ativação da assinatura.",
            },
          });
        }

        return assinaturaCriada;
      });

    return {
      sucesso: true,
      mensagem: `Assinatura ativada para ${cliente.nome}.`,
      assinatura,
    };
  });

export const adminCancelarAssinaturaCliente = createServerFn({
  method: "POST",
})
  .validator(cancelarAssinaturaClienteSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const assinatura =
      await prisma.assinaturaCliente.findUnique({
        where: {
          id: data.assinaturaId,
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

    if (!assinatura) {
      return {
        sucesso: false,
        mensagem: "Assinatura não encontrada.",
      };
    }

    if (assinatura.status !== "ATIVA") {
      return {
        sucesso: false,
        mensagem:
          "Apenas assinaturas ativas podem ser canceladas.",
      };
    }

    const assinaturaAtualizada =
      await prisma.assinaturaCliente.update({
        where: {
          id: assinatura.id,
        },
        data: {
          status: "CANCELADA",
          observacao:
            data.observacao?.trim() ||
            "Assinatura cancelada pelo administrador.",
        },
        select: {
          id: true,
          status: true,
          observacao: true,
        },
      });

    return {
      sucesso: true,
      mensagem: `Assinatura de ${assinatura.cliente.nome} cancelada.`,
      assinatura: assinaturaAtualizada,
    };
  });

export const listarMinhaAssinaturaAtiva = createServerFn({
  method: "GET",
}).handler(async () => {
  const usuario = await exigirCliente();

  const agora = new Date();

  return prisma.assinaturaCliente.findFirst({
    where: {
      clienteId: usuario.id,
      status: "ATIVA",
      vigenciaInicio: {
        lte: agora,
      },
      vigenciaFim: {
        gte: agora,
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
    select: {
      id: true,
      status: true,
      vigenciaInicio: true,
      vigenciaFim: true,
      saldoCortes: true,
      observacao: true,

      plano: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          precoCentavos: true,
          cortesPorCiclo: true,
          duracaoDias: true,
        },
      },

      usos: {
        select: {
          id: true,
          quantidadeCortes: true,
          criadoEm: true,
          agendamento: {
            select: {
              id: true,
              inicio: true,
              status: true,
              servico: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
        orderBy: {
          criadoEm: "desc",
        },
      },
    },
  });
});
export const adminListarPagamentosAssinatura = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.pagamentoAssinatura.findMany({
    orderBy: {
      pagoEm: "desc",
    },
    select: {
      id: true,
      formaPagamento: true,
      valorCentavos: true,
      pagoEm: true,
      observacao: true,

      assinatura: {
        select: {
          id: true,
          status: true,

          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },

          plano: {
            select: {
              id: true,
              nome: true,
              precoCentavos: true,
            },
          },
        },
      },
    },
  });
});