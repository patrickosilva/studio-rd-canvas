import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma.server-DGhEAvkH.mjs";
import { b as getRequestHeader, s as setResponseHeader } from "./server-BeKYjhVv.mjs";
import "../_libs/dotenv.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/prisma__adapter-pg.mjs";
import "../_libs/prisma__driver-adapter-utils.mjs";
import "../_libs/prisma__debug.mjs";
import "../_libs/pg.mjs";
import "events";
import "util/types";
import "dns";
import "net";
import "tls";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "util";
import "crypto";
import "../_libs/pg-connection-string.mjs";
import "fs";
import "../_libs/pg-protocol.mjs";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "path";
import "stream";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "../_libs/isbot.mjs";
import "os";
const SETE_DIAS_EM_SEGUNDOS = 7 * 24 * 60 * 60;
const TRINTA_DIAS_EM_SEGUNDOS = 30 * 24 * 60 * 60;
const SESSION_COOKIE_NAME = "__Host-studio-rd-session";
function gerarTokenSessao() {
  return randomBytes(32).toString("base64url");
}
function gerarHashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function obterDuracaoSessao(manterConectado) {
  return manterConectado ? TRINTA_DIAS_EM_SEGUNDOS : SETE_DIAS_EM_SEGUNDOS;
}
function definirCookieSessao(token, duracaoEmSegundos) {
  const partesCookie = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${duracaoEmSegundos}`
  ];
  {
    partesCookie.push("Secure");
  }
  setResponseHeader("Set-Cookie", partesCookie.join("; "));
}
function limparCookieSessao() {
  const partesCookie = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0"
  ];
  {
    partesCookie.push("Secure");
  }
  setResponseHeader("Set-Cookie", partesCookie.join("; "));
}
function lerTokenCookie() {
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
async function criarSessao(usuarioId, manterConectado = false) {
  const token = gerarTokenSessao();
  const tokenHash = gerarHashToken(token);
  const duracaoEmSegundos = obterDuracaoSessao(manterConectado);
  const expiraEm = new Date(Date.now() + duracaoEmSegundos * 1e3);
  await prisma.sessao.create({
    data: {
      tokenHash,
      usuarioId,
      expiraEm
    }
  });
  definirCookieSessao(token, duracaoEmSegundos);
  return {
    expiraEm
  };
}
async function obterSessaoAtual() {
  const token = lerTokenCookie();
  if (!token) {
    return null;
  }
  const tokenHash = gerarHashToken(token);
  const sessao = await prisma.sessao.findUnique({
    where: {
      tokenHash
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
          ativo: true
        }
      }
    }
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
        tokenHash
      }
    });
    limparCookieSessao();
    return null;
  }
  return sessao;
}
async function obterUsuarioAtual() {
  const sessao = await obterSessaoAtual();
  return sessao?.usuario ?? null;
}
async function encerrarSessaoAtual() {
  const token = lerTokenCookie();
  if (token) {
    const tokenHash = gerarHashToken(token);
    await prisma.sessao.deleteMany({
      where: {
        tokenHash
      }
    });
  }
  limparCookieSessao();
}
export {
  criarSessao,
  encerrarSessaoAtual,
  obterSessaoAtual,
  obterUsuarioAtual
};
