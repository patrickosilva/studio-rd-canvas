import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { gerarHashSenha } from "../auth.server";
import { prisma } from "../prisma.server";

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome é muito grande."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),

  telefone: z
    .string()
    .trim()
    .max(20, "Telefone inválido.")
    .optional()
    .or(z.literal("")),

  senha: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha é muito grande."),
});

export const cadastrarCliente = createServerFn({
  method: "POST",
})
  .validator(cadastroSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    const telefoneNormalizado =
      data.telefone?.replace(/\D/g, "") || null;

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          ...(telefoneNormalizado
            ? [{ telefone: telefoneNormalizado }]
            : []),
        ],
      },
    });

    if (usuarioExistente) {
      return {
        sucesso: false,
        mensagem:
          usuarioExistente.email === email
            ? "Já existe uma conta com esse e-mail."
            : "Já existe uma conta com esse telefone.",
      };
    }

    const senhaHash = await gerarHashSenha(data.senha);

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome.trim(),
        email,
        telefone: telefoneNormalizado,
        senhaHash,

        // O Prisma usa automaticamente o padrão CLIENTE
        // definido no schema.prisma.
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        papel: true,
        criadoEm: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Cadastro realizado com sucesso.",
      usuario,
    };
  });