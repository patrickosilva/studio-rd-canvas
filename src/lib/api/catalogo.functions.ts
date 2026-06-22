import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

async function exigirDono() {
  const usuario = await obterUsuarioAtual();

  if (!usuario || usuario.papel !== "DONO") {
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

export const listarServicos = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.servico.findMany({
    orderBy: {
      nome: "asc",
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      duracaoMinutos: true,
      precoCentavos: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  });
});

export const listarServicosAtivos = createServerFn({
  method: "GET",
}).handler(async () => {
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
      descricao: true,
      duracaoMinutos: true,
      precoCentavos: true,
    },
  });
});

export const cadastrarServico = createServerFn({
  method: "POST",
})
  .validator(servicoSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const nome = data.nome.trim();

    const servicoExistente = await prisma.servico.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (servicoExistente) {
      return {
        sucesso: false,
        mensagem: "Já existe um serviço com esse nome.",
      };
    }

    const servico = await prisma.servico.create({
      data: {
        nome,
        descricao: data.descricao?.trim() || null,
        duracaoMinutos: data.duracaoMinutos,
        precoCentavos: data.precoCentavos,
        ativo: data.ativo,
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        duracaoMinutos: true,
        precoCentavos: true,
        ativo: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Serviço cadastrado com sucesso.",
      servico,
    };
  });

export const listarProfissionais = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.profissional.findMany({
    orderBy: {
      nome: "asc",
    },
    select: {
      id: true,
      usuarioId: true,
      nome: true,
      telefone: true,
      descricao: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          papel: true,
        },
      },
    },
  });
});

export const listarProfissionaisAtivos = createServerFn({
  method: "GET",
}).handler(async () => {
  return prisma.profissional.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      nome: "asc",
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
    },
  });
});

export const cadastrarProfissional = createServerFn({
  method: "POST",
})
  .validator(profissionalSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const usuarioId = data.usuarioId?.trim() || null;
    const telefoneNormalizado =
      data.telefone?.replace(/\D/g, "") || null;

    if (usuarioId) {
      const usuario = await prisma.usuario.findUnique({
        where: {
          id: usuarioId,
        },
        select: {
          id: true,
          papel: true,
        },
      });

      if (!usuario) {
        return {
          sucesso: false,
          mensagem: "Usuário vinculado não encontrado.",
        };
      }

      if (
        usuario.papel !== "FUNCIONARIO" &&
        usuario.papel !== "DONO"
      ) {
        return {
          sucesso: false,
          mensagem:
            "O profissional só pode ser vinculado a um funcionário ou administrador.",
        };
      }
    }

    const profissional = await prisma.profissional.create({
      data: {
        usuarioId,
        nome: data.nome.trim(),
        telefone: telefoneNormalizado,
        descricao: data.descricao?.trim() || null,
        ativo: data.ativo,
      },
      select: {
        id: true,
        usuarioId: true,
        nome: true,
        telefone: true,
        descricao: true,
        ativo: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Profissional cadastrado com sucesso.",
      profissional,
    };
  });