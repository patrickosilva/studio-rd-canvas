import { createHash, randomBytes } from "node:crypto";

import {
  getRequestHeader,
  setResponseHeader,
} from "@tanstack/react-start/server";

import { prisma } from "./prisma.server";

const SETE_DIAS_EM_SEGUNDOS = 7 * 24 * 60 * 60;
const TRINTA_DIAS_EM_SEGUNDOS = 30 * 24 * 60 * 60;

/*
 * Evita uma escrita no banco em toda navegação.
 *
 * A sessão persistente tem 30 dias de validade e é renovada quando houver
 * atividade depois deste intervalo. Assim, na prática, a expiração acontece
 * após aproximadamente 30 dias de inatividade, sem custo de escrita por clique.
 */
const INTERVALO_RENOVACAO_ATIVIDADE_MS = 6 * 60 * 60 * 1000;

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

function obterDuracaoServidor(manterConectado: boolean): number {
  return manterConectado
    ? TRINTA_DIAS_EM_SEGUNDOS
    : SETE_DIAS_EM_SEGUNDOS;
}

/*
 * O cookie contém SOMENTE um token aleatório.
 *
 * Não gravamos nome, e-mail, telefone, papel, senha ou qualquer outro
 * dado pessoal no navegador.
 *
 * - HttpOnly: JavaScript da página não consegue ler o token.
 * - SameSite=Lax: reduz risco de CSRF sem quebrar navegação normal.
 * - Secure em produção: só trafega por HTTPS.
 * - __Host- em produção: impede Domain e exige Path=/ + Secure.
 * - Max-Age somente quando "Manter conectado" estiver marcado.
 *
 * Sem Max-Age o cookie é de sessão e o navegador tende a removê-lo quando
 * a sessão do navegador é encerrada.
 */
function definirCookieSessao(
  token: string,
  persistente: boolean,
): void {
  const partesCookie = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Priority=High",
  ];

  if (persistente) {
    partesCookie.push(
      `Max-Age=${TRINTA_DIAS_EM_SEGUNDOS}`,
    );
  }

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
    "Priority=High",
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
  const agora = new Date();

  const duracaoServidor =
    obterDuracaoServidor(manterConectado);

  const expiraEm = new Date(
    agora.getTime() + duracaoServidor * 1000,
  );

  await prisma.sessao.create({
    data: {
      tokenHash,
      usuarioId,
      expiraEm,
      userAgent: getRequestHeader("user-agent")?.slice(0, 300) || null,
      persistente: manterConectado,
      ultimaAtividadeEm: agora,
    },
  });

  definirCookieSessao(token, manterConectado);

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
      tokenHash: true,
      expiraEm: true,
      persistente: true,
      ultimaAtividadeEm: true,
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

  const agora = new Date();
  const sessaoExpirada =
    sessao.expiraEm.getTime() <= agora.getTime();

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

  /*
   * Sessões com "Manter conectado" usam expiração deslizante:
   * atividade recente renova a validade para mais 30 dias.
   *
   * A gravação é limitada a uma vez a cada 6 horas por sessão para
   * evitar writes desnecessários no banco.
   */
  if (sessao.persistente) {
    const tempoDesdeUltimaAtividade =
      agora.getTime() -
      sessao.ultimaAtividadeEm.getTime();

    if (
      tempoDesdeUltimaAtividade >=
      INTERVALO_RENOVACAO_ATIVIDADE_MS
    ) {
      const novaExpiracao = new Date(
        agora.getTime() +
          TRINTA_DIAS_EM_SEGUNDOS * 1000,
      );

      await prisma.sessao.update({
        where: {
          id: sessao.id,
        },
        data: {
          ultimaAtividadeEm: agora,
          expiraEm: novaExpiracao,
        },
      });

      /*
       * Renova também a validade do cookie no navegador.
       * O token permanece o mesmo; somente sua validade é estendida.
       */
      definirCookieSessao(token, true);
    }
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