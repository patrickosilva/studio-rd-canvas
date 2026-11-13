import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function getPrisma() {
  const { prisma } = await import("../prisma.server");

  return prisma;
}

async function obterUsuarioAtualCupom() {
  const { obterUsuarioAtual } = await import("../session.server");

  return obterUsuarioAtual();
}

async function exigirDonoCupons() {
  const usuario = await obterUsuarioAtualCupom();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

async function exigirClienteCupons() {
  const usuario = await obterUsuarioAtualCupom();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (usuario.papel !== "CLIENTE") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

const publicosCupom = [
  "TODOS",
  "PRIMEIRO_ATENDIMENTO",
  "ATE_X_ATENDIMENTOS",
  "MINIMO_X_ATENDIMENTOS",
  "SEM_ATENDIMENTO_HA_X_DIAS",
  "ASSINANTE_ATIVO",
] as const;

const cupomBaseSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(3, "O código precisa ter pelo menos 3 caracteres.")
    .max(30, "O código é muito grande."),

  descricao: z
    .string()
    .trim()
    .max(300, "A descrição é muito grande.")
    .optional()
    .or(z.literal("")),

  campanha: z
    .string()
    .trim()
    .max(80, "O nome da campanha é muito grande.")
    .optional()
    .or(z.literal("")),

  tipo: z.enum(["PERCENTUAL", "VALOR_FIXO"]),

  percentualDesconto: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional(),

  valorDescontoCentavos: z
    .number()
    .int()
    .min(1)
    .optional(),

  limiteDescontoCentavos: z
    .number()
    .int()
    .min(1)
    .optional(),

  valorMinimoCentavos: z
    .number()
    .int()
    .min(0)
    .optional(),

  inicioEm: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  inicioImediato: z.boolean().default(false),

  fimEm: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  limiteUsos: z
    .number()
    .int()
    .min(1)
    .optional(),

  limitePorCliente: z
    .number()
    .int()
    .min(1)
    .optional(),

  publico: z.enum(publicosCupom),

  quantidadeAtendimentos: z
    .number()
    .int()
    .min(0)
    .optional(),

  diasSemAtendimento: z
    .number()
    .int()
    .min(1)
    .optional(),

  aplicaTodosServicos: z.boolean(),

  servicoIds: z
    .array(z.string().trim().min(1))
    .max(100),

  visivelParaClientes: z.boolean(),
  destaque: z.boolean(),
  combinavelComAssinatura: z.boolean(),
  ativo: z.boolean(),
});

const atualizarCupomSchema = cupomBaseSchema.extend({
  cupomId: z.string().trim().min(1, "Cupom inválido."),
});

const alterarStatusCupomSchema = z.object({
  cupomId: z.string().trim().min(1, "Cupom inválido."),
  ativo: z.boolean(),
});

function normalizarCodigo(valor: string): string {
  return valor
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function converterDataOpcional(
  valor: string | undefined,
): Date | null {
  if (!valor?.trim()) {
    return null;
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

function validarConfiguracaoCupom(
  data: z.infer<typeof cupomBaseSchema>,
): string | null {
  const codigo = normalizarCodigo(data.codigo);

  if (!/^[A-Z0-9_-]+$/.test(codigo)) {
    return "Use apenas letras, números, hífen ou sublinhado no código.";
  }

  if (
    data.tipo === "PERCENTUAL" &&
    !data.percentualDesconto
  ) {
    return "Informe o percentual de desconto.";
  }

  if (
    data.tipo === "VALOR_FIXO" &&
    !data.valorDescontoCentavos
  ) {
    return "Informe o valor do desconto.";
  }

  if (
    !data.aplicaTodosServicos &&
    data.servicoIds.length === 0
  ) {
    return "Selecione ao menos um serviço para este cupom.";
  }

  if (
    data.limiteUsos &&
    data.limitePorCliente &&
    data.limitePorCliente > data.limiteUsos
  ) {
    return "O limite por cliente não pode ser maior que o limite total.";
  }

  if (
    (data.publico === "ATE_X_ATENDIMENTOS" ||
      data.publico === "MINIMO_X_ATENDIMENTOS") &&
    data.quantidadeAtendimentos === undefined
  ) {
    return "Informe a quantidade de atendimentos da regra.";
  }

  if (
    data.publico === "SEM_ATENDIMENTO_HA_X_DIAS" &&
    !data.diasSemAtendimento
  ) {
    return "Informe quantos dias o cliente precisa estar sem atendimento.";
  }

  const inicioEm = data.inicioImediato
    ? new Date()
    : converterDataOpcional(data.inicioEm);

  const fimEm = converterDataOpcional(data.fimEm);

  if (
    !data.inicioImediato &&
    data.inicioEm &&
    !inicioEm
  ) {
    return "Data inicial inválida.";
  }

  if (data.fimEm && !fimEm) {
    return "Data final inválida.";
  }

  if (
    inicioEm &&
    fimEm &&
    fimEm.getTime() <= inicioEm.getTime()
  ) {
    return "A data final precisa ser posterior à data inicial.";
  }

  return null;
}

async function validarServicos(
  servicoIds: string[],
): Promise<boolean> {
  if (servicoIds.length === 0) {
    return true;
  }

  const prisma = await getPrisma();
  const idsUnicos = [...new Set(servicoIds)];

  const total = await prisma.servico.count({
    where: {
      id: {
        in: idsUnicos,
      },
      ativo: true,
    },
  });

  return total === idsUnicos.length;
}

function montarDadosCupom(
  data: z.infer<typeof cupomBaseSchema>,
) {
  return {
    codigo: normalizarCodigo(data.codigo),
    descricao: data.descricao?.trim() || null,
    campanha: data.campanha?.trim() || null,
    tipo: data.tipo,
    percentualDesconto:
      data.tipo === "PERCENTUAL"
        ? data.percentualDesconto ?? null
        : null,
    valorDescontoCentavos:
      data.tipo === "VALOR_FIXO"
        ? data.valorDescontoCentavos ?? null
        : null,
    limiteDescontoCentavos:
      data.tipo === "PERCENTUAL"
        ? data.limiteDescontoCentavos ?? null
        : null,
    valorMinimoCentavos:
      data.valorMinimoCentavos ?? null,
    inicioEm: data.inicioImediato
      ? new Date()
      : converterDataOpcional(data.inicioEm),
    fimEm: converterDataOpcional(data.fimEm),
    limiteUsos: data.limiteUsos ?? null,
    limitePorCliente: data.limitePorCliente ?? null,
    publico: data.publico,
    quantidadeAtendimentos:
      data.publico === "ATE_X_ATENDIMENTOS" ||
      data.publico === "MINIMO_X_ATENDIMENTOS"
        ? data.quantidadeAtendimentos ?? null
        : null,
    diasSemAtendimento:
      data.publico === "SEM_ATENDIMENTO_HA_X_DIAS"
        ? data.diasSemAtendimento ?? null
        : null,
    aplicaTodosServicos: data.aplicaTodosServicos,
    visivelParaClientes: data.visivelParaClientes,
    destaque:
      data.visivelParaClientes && data.destaque,
    combinavelComAssinatura:
      data.combinavelComAssinatura,
    ativo: data.ativo,
  };
}

export const adminListarCupons = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDonoCupons();

  const prisma = await getPrisma();

  return prisma.cupom.findMany({
    orderBy: [
      {
        ativo: "desc",
      },
      {
        destaque: "desc",
      },
      {
        criadoEm: "desc",
      },
    ],
    include: {
      servicos: {
        include: {
          servico: {
            select: {
              id: true,
              nome: true,
              ativo: true,
            },
          },
        },
      },
      _count: {
        select: {
          usos: true,
        },
      },
    },
  });
});

export const adminListarServicosParaCupom =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    await exigirDonoCupons();

    const prisma = await getPrisma();

    return prisma.servico.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
      select: {
        id: true,
        nome: true,
        precoCentavos: true,
      },
    });
  });

export const adminCriarCupom = createServerFn({
  method: "POST",
})
  .validator(cupomBaseSchema)
  .handler(async ({ data }) => {
    await exigirDonoCupons();

    const erro = validarConfiguracaoCupom(data);

    if (erro) {
      return {
        sucesso: false,
        mensagem: erro,
      };
    }

    if (
      !data.aplicaTodosServicos &&
      !(await validarServicos(data.servicoIds))
    ) {
      return {
        sucesso: false,
        mensagem:
          "Um ou mais serviços selecionados não existem ou estão inativos.",
      };
    }

    const prisma = await getPrisma();
    const codigo = normalizarCodigo(data.codigo);

    const existente = await prisma.cupom.findUnique({
      where: {
        codigo,
      },
      select: {
        id: true,
      },
    });

    if (existente) {
      return {
        sucesso: false,
        mensagem: "Já existe um cupom com esse código.",
      };
    }

    await prisma.cupom.create({
      data: {
        ...montarDadosCupom(data),

        servicos: data.aplicaTodosServicos
          ? undefined
          : {
              create: [...new Set(data.servicoIds)].map(
                (servicoId) => ({
                  servicoId,
                }),
              ),
            },
      },
    });

    return {
      sucesso: true,
      mensagem: `Cupom "${codigo}" criado com sucesso.`,
    };
  });

export const adminAtualizarCupom = createServerFn({
  method: "POST",
})
  .validator(atualizarCupomSchema)
  .handler(async ({ data }) => {
    await exigirDonoCupons();

    const erro = validarConfiguracaoCupom(data);

    if (erro) {
      return {
        sucesso: false,
        mensagem: erro,
      };
    }

    if (
      !data.aplicaTodosServicos &&
      !(await validarServicos(data.servicoIds))
    ) {
      return {
        sucesso: false,
        mensagem:
          "Um ou mais serviços selecionados não existem ou estão inativos.",
      };
    }

    const prisma = await getPrisma();
    const codigo = normalizarCodigo(data.codigo);

    const [cupom, codigoEmUso] = await Promise.all([
      prisma.cupom.findUnique({
        where: {
          id: data.cupomId,
        },
        select: {
          id: true,
        },
      }),

      prisma.cupom.findFirst({
        where: {
          codigo,
          id: {
            not: data.cupomId,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!cupom) {
      return {
        sucesso: false,
        mensagem: "Cupom não encontrado.",
      };
    }

    if (codigoEmUso) {
      return {
        sucesso: false,
        mensagem: "Já existe outro cupom com esse código.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.cupom.update({
        where: {
          id: data.cupomId,
        },
        data: montarDadosCupom(data),
      });

      await tx.cupomServico.deleteMany({
        where: {
          cupomId: data.cupomId,
        },
      });

      if (!data.aplicaTodosServicos) {
        await tx.cupomServico.createMany({
          data: [...new Set(data.servicoIds)].map(
            (servicoId) => ({
              cupomId: data.cupomId,
              servicoId,
            }),
          ),
        });
      }
    });

    return {
      sucesso: true,
      mensagem: `Cupom "${codigo}" atualizado com sucesso.`,
    };
  });

export const adminAlterarStatusCupom = createServerFn({
  method: "POST",
})
  .validator(alterarStatusCupomSchema)
  .handler(async ({ data }) => {
    await exigirDonoCupons();

    const prisma = await getPrisma();

    const cupom = await prisma.cupom.findUnique({
      where: {
        id: data.cupomId,
      },
      select: {
        id: true,
        codigo: true,
      },
    });

    if (!cupom) {
      return {
        sucesso: false,
        mensagem: "Cupom não encontrado.",
      };
    }

    await prisma.cupom.update({
      where: {
        id: cupom.id,
      },
      data: {
        ativo: data.ativo,
      },
    });

    return {
      sucesso: true,
      mensagem: data.ativo
        ? `Cupom "${cupom.codigo}" ativado.`
        : `Cupom "${cupom.codigo}" desativado.`,
    };
  });

function diasEntre(
  inicio: Date,
  fim: Date,
): number {
  return Math.floor(
    (fim.getTime() - inicio.getTime()) /
      (24 * 60 * 60 * 1000),
  );
}

export const listarCuponsVisiveisCliente =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    const usuario = await exigirClienteCupons();
    const prisma = await getPrisma();
    const agora = new Date();

    const [perfil, cupons] = await Promise.all([
      prisma.usuario.findUnique({
        where: {
          id: usuario.id,
        },
        select: {
          agendamentos: {
            where: {
              status: "CONCLUIDO",
            },
            orderBy: {
              inicio: "desc",
            },
            select: {
              id: true,
              inicio: true,
            },
          },
          assinaturas: {
            where: {
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
            take: 1,
          },
        },
      }),

      prisma.cupom.findMany({
        where: {
          ativo: true,
          visivelParaClientes: true,
          OR: [
            {
              fimEm: null,
            },
            {
              fimEm: {
                gte: agora,
              },
            },
          ],
        },
        orderBy: [
          {
            destaque: "desc",
          },
          {
            inicioEm: "asc",
          },
          {
            criadoEm: "desc",
          },
        ],
        include: {
          servicos: {
            include: {
              servico: {
                select: {
                  id: true,
                  nome: true,
                  ativo: true,
                },
              },
            },
          },
          usos: {
            where: {
              clienteId: usuario.id,
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              usos: true,
            },
          },
        },
      }),
    ]);

    const totalConcluidos =
      perfil?.agendamentos.length ?? 0;

    const ultimoConcluido =
      perfil?.agendamentos[0]?.inicio ?? null;

    const temAssinaturaAtiva =
      (perfil?.assinaturas.length ?? 0) > 0;

    return cupons.map((cupom) => {
      let elegivel = true;
      let motivo: string | null = null;
      let status:
        | "DISPONIVEL"
        | "EM_BREVE"
        | "INDISPONIVEL" = "DISPONIVEL";

      if (
        cupom.inicioEm &&
        cupom.inicioEm.getTime() > agora.getTime()
      ) {
        elegivel = false;
        status = "EM_BREVE";
        motivo = "Esta campanha ainda não começou.";
      }

      if (
        elegivel &&
        cupom.limiteUsos !== null &&
        cupom._count.usos >= cupom.limiteUsos
      ) {
        elegivel = false;
        status = "INDISPONIVEL";
        motivo = "O limite total deste cupom já foi atingido.";
      }

      if (
        elegivel &&
        cupom.limitePorCliente !== null &&
        cupom.usos.length >= cupom.limitePorCliente
      ) {
        elegivel = false;
        status = "INDISPONIVEL";
        motivo = "Você já utilizou o limite permitido deste cupom.";
      }

      if (elegivel) {
        switch (cupom.publico) {
          case "TODOS":
            break;

          case "PRIMEIRO_ATENDIMENTO":
            if (totalConcluidos !== 0) {
              elegivel = false;
              motivo =
                "Exclusivo para clientes antes do primeiro atendimento.";
            }
            break;

          case "ATE_X_ATENDIMENTOS":
            if (
              cupom.quantidadeAtendimentos === null ||
              totalConcluidos > cupom.quantidadeAtendimentos
            ) {
              elegivel = false;
              motivo = `Disponível para clientes com até ${
                cupom.quantidadeAtendimentos ?? 0
              } atendimento(s) concluído(s).`;
            }
            break;

          case "MINIMO_X_ATENDIMENTOS":
            if (
              cupom.quantidadeAtendimentos === null ||
              totalConcluidos < cupom.quantidadeAtendimentos
            ) {
              elegivel = false;
              motivo = `Libera após ${
                cupom.quantidadeAtendimentos ?? 0
              } atendimento(s) concluído(s).`;
            }
            break;

          case "SEM_ATENDIMENTO_HA_X_DIAS": {
            const diasNecessarios =
              cupom.diasSemAtendimento ?? 0;

            if (!ultimoConcluido) {
              elegivel = false;
              motivo =
                "Exclusivo para clientes que já fizeram atendimento no Studio RD.";
              break;
            }

            const diasSemAtendimento = diasEntre(
              new Date(ultimoConcluido),
              agora,
            );

            if (diasSemAtendimento < diasNecessarios) {
              elegivel = false;
              motivo = `Libera após ${diasNecessarios} dias sem atendimento.`;
            }
            break;
          }

          case "ASSINANTE_ATIVO":
            if (!temAssinaturaAtiva) {
              elegivel = false;
              motivo =
                "Exclusivo para clientes com assinatura ativa.";
            }
            break;
        }
      }

      if (!elegivel && status === "DISPONIVEL") {
        status = "INDISPONIVEL";
      }

      return {
        id: cupom.id,
        codigo: cupom.codigo,
        descricao: cupom.descricao,
        campanha: cupom.campanha,
        tipo: cupom.tipo,
        percentualDesconto: cupom.percentualDesconto,
        valorDescontoCentavos:
          cupom.valorDescontoCentavos,
        limiteDescontoCentavos:
          cupom.limiteDescontoCentavos,
        valorMinimoCentavos:
          cupom.valorMinimoCentavos,
        inicioEm: cupom.inicioEm,
        fimEm: cupom.fimEm,
        aplicaTodosServicos:
          cupom.aplicaTodosServicos,
        servicos: cupom.servicos.map(
          (relacao) => ({
            id: relacao.servico.id,
            nome: relacao.servico.nome,
          }),
        ),
        combinavelComAssinatura:
          cupom.combinavelComAssinatura,
        destaque: cupom.destaque,
        elegivel,
        motivo,
        status,
      };
    });
  });

const validarCupomAgendamentoSchema = z.object({
  codigo: z.string().trim().min(1).max(30),
  servicoId: z.string().trim().min(1),
});

const validarCupomOperacionalSchema =
  validarCupomAgendamentoSchema.extend({
    clienteId: z.string().trim().min(1),
  });

async function exigirOperacionalCupons() {
  const usuario = await obterUsuarioAtualCupom();

  if (
    !usuario ||
    !["FUNCIONARIO", "DONO"].includes(usuario.papel)
  ) {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

export const validarMeuCupomParaAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(validarCupomAgendamentoSchema)
    .handler(async ({ data }) => {
      const usuario = await exigirClienteCupons();
      const prisma = await getPrisma();

      const servico = await prisma.servico.findFirst({
        where: {
          id: data.servicoId,
          ativo: true,
        },
        select: {
          id: true,
          precoCentavos: true,
        },
      });

      if (!servico) {
        return {
          sucesso: false as const,
          mensagem: "Serviço não encontrado.",
        };
      }

      const { avaliarCupomParaAgendamento } =
        await import("../cupom.server");

      return avaliarCupomParaAgendamento({
        clienteId: usuario.id,
        servicoId: servico.id,
        precoOriginalCentavos:
          servico.precoCentavos,
        codigo: data.codigo,
      });
    });

export const operacionalValidarCupomParaCliente =
  createServerFn({
    method: "POST",
  })
    .validator(validarCupomOperacionalSchema)
    .handler(async ({ data }) => {
      await exigirOperacionalCupons();
      const prisma = await getPrisma();

      const [cliente, servico] = await Promise.all([
        prisma.usuario.findFirst({
          where: {
            id: data.clienteId,
            papel: "CLIENTE",
            ativo: true,
          },
          select: {
            id: true,
          },
        }),
        prisma.servico.findFirst({
          where: {
            id: data.servicoId,
            ativo: true,
          },
          select: {
            id: true,
            precoCentavos: true,
          },
        }),
      ]);

      if (!cliente || !servico) {
        return {
          sucesso: false as const,
          mensagem:
            "Cliente ou serviço não encontrado.",
        };
      }

      const { avaliarCupomParaAgendamento } =
        await import("../cupom.server");

      return avaliarCupomParaAgendamento({
        clienteId: cliente.id,
        servicoId: servico.id,
        precoOriginalCentavos:
          servico.precoCentavos,
        codigo: data.codigo,
      });
    });
