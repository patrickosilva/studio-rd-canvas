import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function getPrisma() {
  const { prisma } = await import("../prisma.server");

  return prisma;
}

async function exigirDonoCatalogo() {
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

const servicoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome do serviço é obrigatório.")
    .max(80, "O nome do serviço é muito grande."),

  descricao: z
    .string()
    .trim()
    .max(500, "A descrição é muito grande.")
    .optional()
    .or(z.literal("")),

  duracaoMinutos: z
    .number()
    .int("A duração precisa ser um número inteiro.")
    .min(10, "A duração mínima é de 10 minutos.")
    .max(480, "A duração máxima é de 480 minutos."),

  precoCentavos: z
    .number()
    .int("O preço precisa estar em centavos.")
    .min(0, "O preço não pode ser negativo."),

  ativo: z.boolean().default(true),
});

const profissionalSchema = z.object({
  usuarioId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  nome: z
    .string()
    .trim()
    .min(2, "O nome do profissional é obrigatório.")
    .max(100, "O nome é muito grande."),

  telefone: z
    .string()
    .trim()
    .max(20, "Telefone inválido.")
    .optional()
    .or(z.literal("")),

  descricao: z
    .string()
    .trim()
    .max(500, "A descrição é muito grande.")
    .optional()
    .or(z.literal("")),

  ativo: z.boolean().default(true),
});

const desativarItemCatalogoSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Item inválido."),
});

export const listarServicos = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDonoCatalogo();

  const prisma = await getPrisma();

  return prisma.servico.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
});

export const listarServicosAtivos = createServerFn({
  method: "GET",
}).handler(async () => {
  const prisma = await getPrisma();

  return prisma.servico.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      nome: "asc",
    },
  });
});

export const cadastrarServico = createServerFn({
  method: "POST",
})
  .validator(servicoSchema)
  .handler(async ({ data }) => {
    await exigirDonoCatalogo();

    const prisma = await getPrisma();

    const servicoExistente = await prisma.servico.findFirst({
      where: {
        nome: {
          equals: data.nome,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        nome: true,
        ativo: true,
      },
    });

    if (servicoExistente?.ativo) {
      return {
        sucesso: false,
        mensagem: "Já existe um serviço ativo com esse nome.",
      };
    }

    if (servicoExistente && !servicoExistente.ativo) {
      await prisma.servico.update({
        where: {
          id: servicoExistente.id,
        },
        data: {
          nome: data.nome,
          descricao: data.descricao?.trim() || null,
          duracaoMinutos: data.duracaoMinutos,
          precoCentavos: data.precoCentavos,
          ativo: true,
        },
      });

      return {
        sucesso: true,
        mensagem: `Serviço "${data.nome}" foi reativado com sucesso.`,
      };
    }

    await prisma.servico.create({
      data: {
        nome: data.nome,
        descricao: data.descricao?.trim() || null,
        duracaoMinutos: data.duracaoMinutos,
        precoCentavos: data.precoCentavos,
        ativo: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Serviço cadastrado com sucesso.",
    };
  });

export const listarProfissionais = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDonoCatalogo();

  const prisma = await getPrisma();

  return prisma.profissional.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
});

export const listarProfissionaisAtivos = createServerFn({
  method: "GET",
}).handler(async () => {
  const prisma = await getPrisma();

  return prisma.profissional.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      nome: "asc",
    },
  });
});

export const cadastrarProfissional = createServerFn({
  method: "POST",
})
  .validator(profissionalSchema)
  .handler(async ({ data }) => {
    await exigirDonoCatalogo();

    const prisma = await getPrisma();

    const profissionalExistente =
      await prisma.profissional.findFirst({
        where: {
          nome: {
            equals: data.nome,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          nome: true,
          ativo: true,
        },
      });

    if (profissionalExistente?.ativo) {
      return {
        sucesso: false,
        mensagem:
          "Já existe um profissional ativo com esse nome.",
      };
    }

    if (profissionalExistente && !profissionalExistente.ativo) {
      await prisma.profissional.update({
        where: {
          id: profissionalExistente.id,
        },
        data: {
          usuarioId: data.usuarioId?.trim() || null,
          nome: data.nome,
          telefone: data.telefone?.trim() || null,
          descricao: data.descricao?.trim() || null,
          ativo: true,
        },
      });

      return {
        sucesso: true,
        mensagem: `Profissional "${data.nome}" foi reativado com sucesso.`,
      };
    }

    await prisma.profissional.create({
      data: {
        usuarioId: data.usuarioId?.trim() || null,
        nome: data.nome,
        telefone: data.telefone?.trim() || null,
        descricao: data.descricao?.trim() || null,
        ativo: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Profissional cadastrado com sucesso.",
    };
  });

export const adminDesativarServico = createServerFn({
  method: "POST",
})
  .validator(desativarItemCatalogoSchema)
  .handler(async ({ data }) => {
    await exigirDonoCatalogo();

    const prisma = await getPrisma();

    const servico = await prisma.servico.findUnique({
      where: {
        id: data.id,
      },
      select: {
        id: true,
        nome: true,
        ativo: true,
      },
    });

    if (!servico) {
      return {
        sucesso: false,
        mensagem: "Serviço não encontrado.",
      };
    }

    if (!servico.ativo) {
      return {
        sucesso: false,
        mensagem: "Esse serviço já está desativado.",
      };
    }

    const agendamentoFuturo = await prisma.agendamento.findFirst({
      where: {
        servicoId: servico.id,
        status: {
          in: ["SOLICITADO", "CONFIRMADO"],
        },
        inicio: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (agendamentoFuturo) {
      return {
        sucesso: false,
        mensagem:
          "Não é possível excluir este serviço porque existem agendamentos futuros solicitados ou confirmados.",
      };
    }

    await prisma.servico.update({
      where: {
        id: servico.id,
      },
      data: {
        ativo: false,
      },
    });

    return {
      sucesso: true,
      mensagem: `Serviço "${servico.nome}" desativado com sucesso.`,
    };
  });

export const adminDesativarProfissional = createServerFn({
  method: "POST",
})
  .validator(desativarItemCatalogoSchema)
  .handler(async ({ data }) => {
    await exigirDonoCatalogo();

    const prisma = await getPrisma();

    const profissional = await prisma.profissional.findUnique({
      where: {
        id: data.id,
      },
      select: {
        id: true,
        nome: true,
        ativo: true,
      },
    });

    if (!profissional) {
      return {
        sucesso: false,
        mensagem: "Funcionário/profissional não encontrado.",
      };
    }

    if (!profissional.ativo) {
      return {
        sucesso: false,
        mensagem: "Esse profissional já está desativado.",
      };
    }

    const agendamentoFuturo = await prisma.agendamento.findFirst({
      where: {
        profissionalId: profissional.id,
        status: {
          in: ["SOLICITADO", "CONFIRMADO"],
        },
        inicio: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (agendamentoFuturo) {
      return {
        sucesso: false,
        mensagem:
          "Não é possível excluir este profissional porque existem agendamentos futuros solicitados ou confirmados.",
      };
    }

    await prisma.profissional.update({
      where: {
        id: profissional.id,
      },
      data: {
        ativo: false,
      },
    });

    return {
      sucesso: true,
      mensagem: `Profissional "${profissional.nome}" desativado com sucesso.`,
    };
  });