import { createHash, randomBytes } from "node:crypto";

import {
  getRequestHeader,
  setResponseHeader,
} from "@tanstack/react-start/server";

import { prisma } from "./prisma.server";

const SETE_DIAS_EM_SEGUNDOS = 7 * 24 * 60 * 60;
const TRINTA_DIAS_EM_SEGUNDOS = 30 * 24 * 60 * 60;

const isProduction = process.env.NODE_ENV === "production";

const SESSION_COOKIE_NAME = isProduction
  ? "__Host-studio-rd-session"
  : "studio-rd-session";

function gerarTokenSessao(): string {
  return randomBytes(32).toString("base64url");
}

function gerarHashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function obterDuracaoSessao(manterConectado: boolean): number {
  return manterConectado
    ? TRINTA_DIAS_EM_SEGUNDOS
    : SETE_DIAS_EM_SEGUNDOS;
}

function definirCookieSessao(token: string, duracaoEmSegundos: number): void {
  const partesCookie = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${duracaoEmSegundos}`,
  ];

  if (isProduction) {
    partesCookie.push("Secure");
  }

  setResponseHeader("Set-Cookie", partesCookie.join("; "));
}

function limparCookieSessao(): void {
  const partesCookie = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ];

  if (isProduction) {
    partesCookie.push("Secure");
  }

  setResponseHeader("Set-Cookie", partesCookie.join("; "));
}

function lerTokenCookie(): string | null {
  const cookieHeader = getRequestHeader("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(/;\s*/);

  for (const cookie of cookies) {
    const indiceSeparador = cookie.indexOf("=");

    if (indiceSeparador === -1) {
      continue;
    }

    const nome = cookie.slice(0, indiceSeparador);
    const valor = cookie.slice(indiceSeparador + 1);

    if (nome === SESSION_COOKIE_NAME) {
      return valor || null;
    }
  }

  return null;
}

export async function criarSessao(
  usuarioId: string,
  manterConectado = false,
): Promise<{ expiraEm: Date }> {
  const token = gerarTokenSessao();
  const tokenHash = gerarHashToken(token);
  const duracaoEmSegundos = obterDuracaoSessao(manterConectado);

  const expiraEm = new Date(Date.now() + duracaoEmSegundos * 1000);

  await prisma.sessao.create({
    data: {
      tokenHash,
      usuarioId,
      expiraEm,
    },
  });

  definirCookieSessao(token, duracaoEmSegundos);

  return {
    expiraEm,
  };
}

export async function obterSessaoAtual() {
  const token = lerTokenCookie();

  if (!token) {
    return null;
  }

  const tokenHash = gerarHashToken(token);

  const sessao = await prisma.sessao.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      expiraEm: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          papel: true,
          ativo: true,
        },
      },
    },
  });

  if (!sessao) {
    limparCookieSessao();
    return null;
  }

  const sessaoExpirada = sessao.expiraEm.getTime() <= Date.now();
  const usuarioInativo = !sessao.usuario.ativo;

  if (sessaoExpirada || usuarioInativo) {
    await prisma.sessao.deleteMany({
      where: {
        tokenHash,
      },
    });

    limparCookieSessao();

    return null;
  }

  return sessao;
}

export async function obterUsuarioAtual() {
  const sessao = await obterSessaoAtual();

  return sessao?.usuario ?? null;
}

export async function encerrarSessaoAtual(): Promise<void> {
  const token = lerTokenCookie();

  if (token) {
    const tokenHash = gerarHashToken(token);

    await prisma.sessao.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  limparCookieSessao();
}

export async function encerrarTodasSessoesDoUsuario(
  usuarioId: string,
): Promise<void> {
  await prisma.sessao.deleteMany({
    where: {
      usuarioId,
    },
  });
}