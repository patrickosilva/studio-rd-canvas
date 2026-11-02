import { OAuth2Client } from "google-auth-library";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { PapelUsuario } from "../../generated/prisma/client";
import { prisma } from "../prisma.server";
import {
  registrarEventoSeguranca,
  verificarRateLimit,
} from "../security.server";
import { TERMOS_USO_VERSAO } from "../legal.constants";
import { criarSessao, obterUsuarioAtual } from "../session.server";

const credencialSchema = z.object({
  credential: z.string().trim().min(20),
  manterConectado: z.boolean().default(true),
  redirect: z.string().trim().max(300).optional(),
  aceitarTermos: z.boolean().default(false),
});

const vinculoSchema = z.object({
  credential: z.string().trim().min(20),
});

function clientId() {
  const value = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!value) throw new Error("GOOGLE_CLIENT_ID não configurado.");
  return value;
}

async function identidadeGoogle(credential: string) {
  const client = new OAuth2Client(clientId());
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId(),
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("IDENTIDADE_GOOGLE_INVALIDA");
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    nome: payload.name?.trim() || payload.email.split("@")[0],
  };
}

function rotaInicial(papel: PapelUsuario) {
  if (papel === "DONO") return "/admin";
  if (papel === "FUNCIONARIO") return "/funcionario";
  return "/cliente";
}

function redirectSeguro(redirect: string | undefined, papel: PapelUsuario) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return rotaInicial(papel);
  }

  const permitido =
    (papel === "CLIENTE" &&
      (redirect === "/cliente" || redirect.startsWith("/cliente/"))) ||
    (papel === "FUNCIONARIO" &&
      (redirect === "/funcionario" || redirect.startsWith("/funcionario/"))) ||
    (papel === "DONO" &&
      (redirect === "/admin" || redirect.startsWith("/admin/")));

  return permitido ? redirect : rotaInicial(papel);
}

export const obterGoogleClientIdPublico = createServerFn({
  method: "GET",
}).handler(async () => ({ clientId: clientId() }));

export const entrarComGoogle = createServerFn({
  method: "POST",
})
  .validator(credencialSchema)
  .handler(async ({ data }) => {
        const limiteGoogle = await verificarRateLimit({
      acao: "LOGIN_GOOGLE",
      rota: "/login",
    });

    if (!limiteGoogle.permitido) {
      return {
        sucesso: false,
        mensagem:
          "Muitas tentativas foram realizadas. Aguarde um pouco e tente novamente.",
      };
    }
let identidade;

    try {
      identidade = await identidadeGoogle(data.credential);
    } catch (error) {
      console.error("[GoogleAuth] credencial inválida", error);
      return {
        sucesso: false,
        mensagem: "Não foi possível validar sua Conta Google.",
      };
    }

    const conta = await prisma.contaOAuth.findUnique({
      where: {
        provedor_providerUserId: {
          provedor: "GOOGLE",
          providerUserId: identidade.sub,
        },
      },
      select: {
        id: true,
        usuario: {
          select: {
            id: true,
            papel: true,
            ativo: true,
          },
        },
      },
    });

    if (conta) {
      if (!conta.usuario.ativo) {
        return { sucesso: false, mensagem: "Não foi possível entrar." };
      }

      await prisma.contaOAuth.update({
        where: { id: conta.id },
        data: {
          emailNoVinculo: identidade.email,
          ultimoLoginEm: new Date(),
        },
      });

      await criarSessao(conta.usuario.id, data.manterConectado);

      return {
        sucesso: true,
        destino: redirectSeguro(data.redirect, conta.usuario.papel),
      };
    }

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        email: {
          equals: identidade.email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (usuarioExistente) {
      return {
        sucesso: false,
        mensagem:
          "Já existe uma conta Studio RD com este e-mail. Entre com sua senha e conecte o Google no Perfil.",
      };
    }

    if (!data.aceitarTermos) {
      return {
        sucesso: false,
        exigeAceiteTermos: true,
        mensagem:
          "Antes de criar sua conta, leia e aceite os Termos de Uso.",
      };
    }
    const usuario = await prisma.$transaction(async (tx) => {
      const novo = await tx.usuario.create({
        data: {
          nome: identidade.nome,
          email: identidade.email,
          senhaHash: null,
          termosVersaoAceita: TERMOS_USO_VERSAO,
          termosAceitosEm: new Date(),
        },
        select: {
          id: true,
          papel: true,
        },
      });

      await tx.contaOAuth.create({
        data: {
          usuarioId: novo.id,
          provedor: "GOOGLE",
          providerUserId: identidade.sub,
          emailNoVinculo: identidade.email,
          ultimoLoginEm: new Date(),
        },
      });

      return novo;
    });

    await criarSessao(usuario.id, data.manterConectado);

    return {
      sucesso: true,
      destino: redirectSeguro(data.redirect, usuario.papel),
    };
  });

export const obterStatusGoogle = createServerFn({
  method: "GET",
}).handler(async () => {
  const atual = await obterUsuarioAtual();
  if (!atual) return { conectado: false, emailGoogle: null, temSenha: false };

  const usuario = await prisma.usuario.findUnique({
    where: { id: atual.id },
    select: {
      senhaHash: true,
      contasOAuth: {
        where: { provedor: "GOOGLE" },
        take: 1,
        select: { emailNoVinculo: true },
      },
    },
  });

  return {
    conectado: Boolean(usuario?.contasOAuth[0]),
    emailGoogle: usuario?.contasOAuth[0]?.emailNoVinculo ?? null,
    temSenha: Boolean(usuario?.senhaHash),
  };
});

export const conectarContaGoogle = createServerFn({
  method: "POST",
})
  .validator(vinculoSchema)
  .handler(async ({ data }) => {
        const limiteVinculo = await verificarRateLimit({
      acao: "VINCULAR_GOOGLE",
      rota: "/conta/google",
    });

    if (!limiteVinculo.permitido) {
      return {
        sucesso: false,
        mensagem:
          "Muitas tentativas foram realizadas. Aguarde um pouco e tente novamente.",
      };
    }
const atual = await obterUsuarioAtual();

    if (!atual) {
      return { sucesso: false, mensagem: "Sua sessão expirou." };
    }

    let identidade;
    try {
      identidade = await identidadeGoogle(data.credential);
    } catch {
      return { sucesso: false, mensagem: "Conta Google inválida." };
    }

    if (identidade.email !== atual.email.trim().toLowerCase()) {
      return {
        sucesso: false,
        mensagem:
          "Por segurança, conecte uma Conta Google com o mesmo e-mail da sua conta Studio RD.",
      };
    }

    const ligadaAOutro = await prisma.contaOAuth.findUnique({
      where: {
        provedor_providerUserId: {
          provedor: "GOOGLE",
          providerUserId: identidade.sub,
        },
      },
      select: { usuarioId: true },
    });

    if (ligadaAOutro && ligadaAOutro.usuarioId !== atual.id) {
      return {
        sucesso: false,
        mensagem: "Esta Conta Google já está vinculada a outra conta.",
      };
    }

    const existente = await prisma.contaOAuth.findUnique({
      where: {
        usuarioId_provedor: {
          usuarioId: atual.id,
          provedor: "GOOGLE",
        },
      },
      select: { id: true },
    });

    if (existente) {
      await prisma.contaOAuth.update({
        where: { id: existente.id },
        data: {
          providerUserId: identidade.sub,
          emailNoVinculo: identidade.email,
          ultimoLoginEm: new Date(),
        },
      });
    } else {
      await prisma.contaOAuth.create({
        data: {
          usuarioId: atual.id,
          provedor: "GOOGLE",
          providerUserId: identidade.sub,
          emailNoVinculo: identidade.email,
          ultimoLoginEm: new Date(),
        },
      });
    }

    return {
      sucesso: true,
      mensagem: "Conta Google conectada com sucesso.",
    };
  });

export const desconectarContaGoogle = createServerFn({
  method: "POST",
}).handler(async () => {
  const atual = await obterUsuarioAtual();
  if (!atual) return { sucesso: false, mensagem: "Sua sessão expirou." };

  const usuario = await prisma.usuario.findUnique({
    where: { id: atual.id },
    select: { senhaHash: true },
  });

  if (!usuario?.senhaHash) {
    return {
      sucesso: false,
      mensagem:
        "Crie uma senha antes de desconectar o Google para não perder o acesso.",
    };
  }

  await prisma.contaOAuth.deleteMany({
    where: { usuarioId: atual.id, provedor: "GOOGLE" },
  });

  return { sucesso: true, mensagem: "Conta Google desconectada." };
});
