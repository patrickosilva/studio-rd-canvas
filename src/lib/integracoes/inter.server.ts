import https from "node:https";
import { randomBytes } from "node:crypto";

export type AmbienteInter = "PRODUCAO" | "SANDBOX";

export type CredenciaisInter = {
  clientId: string;
  clientSecret: string;
  certificadoPem: string;
  chavePrivadaPem: string;
};

export type TokenInter = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
};

export type CobrancaPixInter = {
  txid: string;
  status: string;
  pixCopiaECola: string | null;
  location: string | null;
  valorOriginal: string | null;
  expiracaoSegundos: number | null;
  revisao: number | null;
};

const BASES: Record<AmbienteInter, string> = {
  PRODUCAO: "https://cdpj.partners.bancointer.com.br",
  SANDBOX: "https://cdpj-sandbox.partners.uatinter.co",
};

const tokenCache = new Map<
  string,
  { token: TokenInter; expiraEmMs: number }
>();

function requestMtls({
  method,
  url,
  certificadoPem,
  chavePrivadaPem,
  headers = {},
  body,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  certificadoPem: string;
  chavePrivadaPem: string;
  headers?: Record<string, string>;
  body?: string;
}): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const destino = new URL(url);

    const request = https.request(
      {
        protocol: destino.protocol,
        hostname: destino.hostname,
        port: destino.port || 443,
        path: destino.pathname + destino.search,
        method,
        cert: certificadoPem,
        key: chavePrivadaPem,
        minVersion: "TLSv1.2",
        timeout: 20_000,
        headers: {
          accept: "application/json",
          ...(body
            ? {
                "content-length": String(Buffer.byteLength(body)),
              }
            : {}),
          ...headers,
        },
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk));
        });

        response.on("end", () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(
        new Error("Tempo limite ao conectar com o Banco Inter."),
      );
    });

    request.on("error", reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

function mensagemSegura(statusCode: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;

    const mensagem =
      typeof parsed.error_description === "string"
        ? parsed.error_description
        : typeof parsed.detail === "string"
          ? parsed.detail
          : typeof parsed.message === "string"
            ? parsed.message
            : typeof parsed.error === "string"
              ? parsed.error
              : "";

    if (mensagem) {
      return (
        "Banco Inter respondeu HTTP " +
        statusCode +
        ": " +
        mensagem.slice(0, 300)
      );
    }
  } catch {
    // Corpo bruto nao e devolvido para a interface.
  }

  return "Banco Inter respondeu HTTP " + statusCode + ".";
}

function parseJson(
  statusCode: number,
  body: string,
): Record<string, unknown> {
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new Error(
      "Banco Inter retornou resposta invalida (HTTP " +
        statusCode +
        ").",
    );
  }
}

export async function obterTokenInter({
  ambiente,
  credenciais,
  scope,
}: {
  ambiente: AmbienteInter;
  credenciais: CredenciaisInter;
  scope: string;
}): Promise<TokenInter> {
  const cacheKey = [ambiente, credenciais.clientId, scope].join(":");
  const cache = tokenCache.get(cacheKey);

  if (cache && cache.expiraEmMs > Date.now()) {
    return cache.token;
  }

  const corpo = new URLSearchParams({
    client_id: credenciais.clientId,
    client_secret: credenciais.clientSecret,
    grant_type: "client_credentials",
    scope,
  }).toString();

  const resposta = await requestMtls({
    method: "POST",
    url: BASES[ambiente] + "/oauth/v2/token",
    certificadoPem: credenciais.certificadoPem,
    chavePrivadaPem: credenciais.chavePrivadaPem,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: corpo,
  });

  if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
    throw new Error(mensagemSegura(resposta.statusCode, resposta.body));
  }

  const parsed = parseJson(resposta.statusCode, resposta.body);

  const accessToken =
    typeof parsed.access_token === "string" ? parsed.access_token : "";

  if (!accessToken) {
    throw new Error("O Banco Inter nao retornou access_token.");
  }

  const expiresIn =
    typeof parsed.expires_in === "number"
      ? parsed.expires_in
      : Number(parsed.expires_in ?? 3600);

  const token: TokenInter = {
    accessToken,
    tokenType:
      typeof parsed.token_type === "string" ? parsed.token_type : "Bearer",
    expiresIn,
    scope: typeof parsed.scope === "string" ? parsed.scope : scope,
  };

  tokenCache.set(cacheKey, {
    token,
    expiraEmMs: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
  });

  return token;
}

export async function testarAutenticacaoInter({
  ambiente,
  credenciais,
}: {
  ambiente: AmbienteInter;
  credenciais: CredenciaisInter;
}): Promise<TokenInter> {
  return obterTokenInter({
    ambiente,
    credenciais,
    scope: "cob.write cob.read",
  });
}

function gerarTxid(): string {
  return randomBytes(16).toString("hex");
}

function normalizarCobranca(
  parsed: Record<string, unknown>,
  txidFallback: string,
): CobrancaPixInter {
  const valor =
    parsed.valor &&
    typeof parsed.valor === "object" &&
    !Array.isArray(parsed.valor)
      ? (parsed.valor as Record<string, unknown>)
      : {};

  const calendario =
    parsed.calendario &&
    typeof parsed.calendario === "object" &&
    !Array.isArray(parsed.calendario)
      ? (parsed.calendario as Record<string, unknown>)
      : {};

  const loc =
    parsed.loc &&
    typeof parsed.loc === "object" &&
    !Array.isArray(parsed.loc)
      ? (parsed.loc as Record<string, unknown>)
      : {};

  return {
    txid: typeof parsed.txid === "string" ? parsed.txid : txidFallback,
    status: typeof parsed.status === "string" ? parsed.status : "ATIVA",
    pixCopiaECola:
      typeof parsed.pixCopiaECola === "string" ? parsed.pixCopiaECola : null,
    location:
      typeof loc.location === "string"
        ? loc.location
        : typeof parsed.location === "string"
          ? parsed.location
          : null,
    valorOriginal:
      typeof valor.original === "string" ? valor.original : null,
    expiracaoSegundos:
      typeof calendario.expiracao === "number" ? calendario.expiracao : null,
    revisao: typeof parsed.revisao === "number" ? parsed.revisao : null,
  };
}

export async function criarCobrancaPixTesteInter({
  ambiente,
  credenciais,
  chavePix,
  valorCentavos,
  descricao,
}: {
  ambiente: AmbienteInter;
  credenciais: CredenciaisInter;
  chavePix: string;
  valorCentavos: number;
  descricao: string;
}): Promise<CobrancaPixInter> {
  if (ambiente !== "SANDBOX") {
    throw new Error("A cobranca de teste esta bloqueada fora do Sandbox.");
  }

  const token = await obterTokenInter({
    ambiente,
    credenciais,
    scope: "cob.write cob.read",
  });

  const txid = gerarTxid();
  const payload = JSON.stringify({
    calendario: {
      expiracao: 3600,
    },
    valor: {
      original: (valorCentavos / 100).toFixed(2),
    },
    chave: chavePix,
    solicitacaoPagador: descricao.trim() || "Teste Studio RD",
  });

  const resposta = await requestMtls({
    method: "PUT",
    url: BASES[ambiente] + "/pix/v2/cob/" + encodeURIComponent(txid),
    certificadoPem: credenciais.certificadoPem,
    chavePrivadaPem: credenciais.chavePrivadaPem,
    headers: {
      authorization: "Bearer " + token.accessToken,
      "content-type": "application/json",
    },
    body: payload,
  });

  if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
    throw new Error(mensagemSegura(resposta.statusCode, resposta.body));
  }

  return normalizarCobranca(
    parseJson(resposta.statusCode, resposta.body),
    txid,
  );
}

export async function consultarCobrancaPixInter({
  ambiente,
  credenciais,
  txid,
}: {
  ambiente: AmbienteInter;
  credenciais: CredenciaisInter;
  txid: string;
}): Promise<CobrancaPixInter> {
  const token = await obterTokenInter({
    ambiente,
    credenciais,
    scope: "cob.read",
  });

  const resposta = await requestMtls({
    method: "GET",
    url: BASES[ambiente] + "/pix/v2/cob/" + encodeURIComponent(txid),
    certificadoPem: credenciais.certificadoPem,
    chavePrivadaPem: credenciais.chavePrivadaPem,
    headers: {
      authorization: "Bearer " + token.accessToken,
    },
  });

  if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
    throw new Error(mensagemSegura(resposta.statusCode, resposta.body));
  }

  return normalizarCobranca(
    parseJson(resposta.statusCode, resposta.body),
    txid,
  );
}
