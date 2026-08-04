import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma.server-DGhEAvkH.js";
import { b as getRequestHeader, s as setResponseHeader } from "./server-n3LmVJQm.js";
import "dotenv/config";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
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
