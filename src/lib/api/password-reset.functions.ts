import { hash } from "bcryptjs";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  encerrarTodasSessoesDoUsuario,
} from "../session.server";
import {
  gerarTokenRedefinicaoSenha,
  hashTokenRedefinicaoSenha,
  enviarEmailRedefinicaoSenha,
} from "../password-reset.server";
import { prisma } from "../prisma.server";
import {
  registrarEventoSeguranca,
  verificarRateLimit,
} from "../security.server";

const solicitarSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254),
});

const redefinirSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(20, "Link de redefinição inválido.")
      .max(500),
    senha: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(72, "A senha é muito grande."),
    confirmarSenha: z
      .string()
      .min(8)
      .max(72),
  })
  .refine(
    (data) => data.senha === data.confirmarSenha,
    {
      message: "As senhas não coincidem.",
      path: ["confirmarSenha"],
    },
  );

const MENSAGEM_NEUTRA =
  "Se existir uma conta com esse e-mail, enviaremos um link para redefinir a senha.";

export const solicitarRedefinicaoSenha = createServerFn({
  method: "POST",
})
  .validator(solicitarSchema)
  .handler(async ({ data }) => {
    const email = data.email
      .trim()
      .toLowerCase();

    const limite = await verificarRateLimit({
      acao: "RESET_SENHA",
      identificador: email,
      rota: "/esqueci-senha",
    });

    if (!limite.permitido) {
      return {
        sucesso: true,
        mensagem: MENSAGEM_NEUTRA,
      };
    }

    await registrarEventoSeguranca({
      tipo: "RESET_SENHA_SOLICITADO",
      rota: "/esqueci-senha",
      identificador: email,
    });

    const usuario =
      await prisma.usuario.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          ativo: true,
        },
      });

    if (!usuario?.ativo) {
      return {
        sucesso: true,
        mensagem: MENSAGEM_NEUTRA,
      };
    }

    const {
      token,
      tokenHash,
      expiraEm,
    } = gerarTokenRedefinicaoSenha();

    await prisma.$transaction([
      prisma.tokenRedefinicaoSenha.updateMany({
        where: {
          usuarioId: usuario.id,
          usado: false,
        },
        data: {
          usado: true,
        },
      }),

      prisma.tokenRedefinicaoSenha.create({
        data: {
          usuarioId: usuario.id,
          tokenHash,
          expiraEm,
        },
      }),

      prisma.tokenRedefinicaoSenha.deleteMany({
        where: {
          expiraEm: {
            lt: new Date(
              Date.now() -
                7 * 24 * 60 * 60 * 1000,
            ),
          },
        },
      }),
    ]);

    try {
      await enviarEmailRedefinicaoSenha({
        email: usuario.email,
        token,
      });
    } catch (error) {
      console.error(
        "[PasswordReset] Falha ao enviar e-mail.",
        error,
      );

      /*
       * Não revelamos ao navegador se a conta existe
       * nem se o provedor de e-mail falhou.
       */
    }

    return {
      sucesso: true,
      mensagem: MENSAGEM_NEUTRA,
    };
  });

export const redefinirSenha = createServerFn({
  method: "POST",
})
  .validator(redefinirSchema)
  .handler(async ({ data }) => {
    const tokenHash =
      hashTokenRedefinicaoSenha(data.token);

    const token =
      await prisma.tokenRedefinicaoSenha.findUnique({
        where: {
          tokenHash,
        },
        select: {
          id: true,
          usuarioId: true,
          usado: true,
          expiraEm: true,
          usuario: {
            select: {
              ativo: true,
            },
          },
        },
      });

    const agora = new Date();

    if (
      !token ||
      token.usado ||
      token.expiraEm <= agora ||
      !token.usuario.ativo
    ) {
      await registrarEventoSeguranca({
        tipo: "RESET_SENHA_TOKEN_INVALIDO",
        sucesso: false,
        rota: "/redefinir-senha",
      });

      return {
        sucesso: false,
        mensagem:
          "Este link é inválido, já foi utilizado ou expirou. Solicite uma nova redefinição.",
      };
    }

    const senhaHash = await hash(
      data.senha,
      12,
    );

    await prisma.$transaction(async (tx) => {
      const atualizado =
        await tx.tokenRedefinicaoSenha.updateMany({
          where: {
            id: token.id,
            usado: false,
            expiraEm: {
              gt: agora,
            },
          },
          data: {
            usado: true,
          },
        });

      if (atualizado.count !== 1) {
        throw new Error(
          "TOKEN_REDEFINICAO_JA_CONSUMIDO",
        );
      }

      await tx.usuario.update({
        where: {
          id: token.usuarioId,
        },
        data: {
          senhaHash,
        },
      });

      await tx.tokenRedefinicaoSenha.updateMany({
        where: {
          usuarioId: token.usuarioId,
          usado: false,
        },
        data: {
          usado: true,
        },
      });

      await tx.sessao.deleteMany({
        where: {
          usuarioId: token.usuarioId,
        },
      });
    });

    await registrarEventoSeguranca({
      tipo: "RESET_SENHA_CONCLUIDO",
      sucesso: true,
      rota: "/redefinir-senha",
    });

    return {
      sucesso: true,
      mensagem:
        "Senha redefinida com sucesso. Você já pode entrar com a nova senha.",
    };
  });
