import { createHmac } from "node:crypto";

import { getRequestHeader } from "@tanstack/react-start/server";

import { prisma } from "./prisma.server";

const QUINZE_MINUTOS_MS = 15 * 60 * 1000;
const UMA_HORA_MS = 60 * 60 * 1000;
const NOVENTA_DIAS_MS = 90 * 24 * 60 * 60 * 1000;
const INTERVALO_LIMPEZA_MS = 6 * 60 * 60 * 1000;

let ultimaLimpezaEm = 0;
let avisoSegredoDevEmitido = false;

export type AcaoProtegida =
  | "LOGIN_SENHA"
  | "CADASTRO"
  | "LOGIN_GOOGLE"
  | "VINCULAR_GOOGLE"
  | "RESET_SENHA";

type PoliticaRateLimit = {
  janelaMs: number;
  limiteIp: number;
  limiteIdentificador?: number;
};

const POLITICAS: Record<AcaoProtegida, PoliticaRateLimit> = {
  LOGIN_SENHA: {
    janelaMs: QUINZE_MINUTOS_MS,
    limiteIp: 30,
    limiteIdentificador: 8,
  },

  CADASTRO: {
    janelaMs: UMA_HORA_MS,
    limiteIp: 12,
    limiteIdentificador: 4,
  },

  LOGIN_GOOGLE: {
    janelaMs: QUINZE_MINUTOS_MS,
    limiteIp: 30,
  },

  VINCULAR_GOOGLE: {
    janelaMs: QUINZE_MINUTOS_MS,
    limiteIp: 15,
  },

  RESET_SENHA: {
    janelaMs: UMA_HORA_MS,
    limiteIp: 10,
    limiteIdentificador: 4,
  },
};

function segredoHash(): string {
  const configurado = process.env.SECURITY_HASH_SECRET?.trim();

  if (configurado) {
    return configurado;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SECURITY_HASH_SECRET é obrigatório em produção.",
    );
  }

  if (!avisoSegredoDevEmitido) {
    avisoSegredoDevEmitido = true;
    console.warn(
      "[Security] SECURITY_HASH_SECRET ausente. Usando chave exclusiva de desenvolvimento. Configure uma chave real antes do deploy.",
    );
  }

  return "studio-rd-development-only-security-key";
}

function hashPrivado(valor: string): string {
  return createHmac("sha256", segredoHash())
    .update(valor)
    .digest("hex");
}

function normalizarIdentificador(valor: string): string {
  return valor.trim().toLowerCase();
}

function obterIpOrigem(): string {
  const cf = getRequestHeader("cf-connecting-ip")?.trim();

  if (cf) {
    return cf;
  }

  const realIp = getRequestHeader("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  const forwardedFor = getRequestHeader("x-forwarded-for");

  if (forwardedFor) {
    const primeiro = forwardedFor
      .split(",")[0]
      ?.trim();

    if (primeiro) {
      return primeiro;
    }
  }

  /*
   * Não persistimos "unknown". Ele é transformado por HMAC junto
   * com a ação, então nem mesmo esta string aparece como dado bruto
   * no banco.
   */
  return "unknown";
}

function chaveIp(acao: AcaoProtegida): string {
  return hashPrivado(
    `ip|${acao}|${obterIpOrigem()}`,
  );
}

function chaveIdentificador(
  acao: AcaoProtegida,
  identificador: string,
): string {
  return hashPrivado(
    `id|${acao}|${obterIpOrigem()}|${normalizarIdentificador(
      identificador,
    )}`,
  );
}

async function contarEventos(
  tipo: string,
  chaveHash: string,
  desde: Date,
): Promise<number> {
  return prisma.eventoSeguranca.count({
    where: {
      tipo,
      chaveHash,
      criadoEm: {
        gte: desde,
      },
    },
  });
}

async function registrarInterno({
  tipo,
  chaveHash,
  sucesso,
  rota,
}: {
  tipo: string;
  chaveHash?: string | null;
  sucesso?: boolean | null;
  rota?: string | null;
}) {
  await prisma.eventoSeguranca.create({
    data: {
      tipo,
      chaveHash: chaveHash ?? null,
      sucesso: sucesso ?? null,
      rota: rota ?? null,
    },
  });
}

async function limparEventosAntigosSeNecessario() {
  const agora = Date.now();

  if (
    agora - ultimaLimpezaEm <
    INTERVALO_LIMPEZA_MS
  ) {
    return;
  }

  ultimaLimpezaEm = agora;

  const limite = new Date(
    agora - NOVENTA_DIAS_MS,
  );

  try {
    await prisma.eventoSeguranca.deleteMany({
      where: {
        criadoEm: {
          lt: limite,
        },
      },
    });
  } catch (error) {
    console.error(
      "[Security] Falha ao limpar eventos antigos.",
      error,
    );
  }
}

export async function verificarRateLimit({
  acao,
  identificador,
  rota,
}: {
  acao: AcaoProtegida;
  identificador?: string;
  rota: string;
}): Promise<
  | { permitido: true }
  | { permitido: false; tentarNovamenteEmSegundos: number }
> {
  void limparEventosAntigosSeNecessario();

  const politica = POLITICAS[acao];
  const agora = new Date();
  const desde = new Date(
    agora.getTime() - politica.janelaMs,
  );

  const ipHash = chaveIp(acao);
  const tipoIp = `RATE_${acao}_IP`;

  const totalIp = await contarEventos(
    tipoIp,
    ipHash,
    desde,
  );

  let bloqueado =
    totalIp >= politica.limiteIp;

  let identificadorHash: string | null = null;
  let tipoIdentificador: string | null = null;

  if (
    !bloqueado &&
    identificador &&
    politica.limiteIdentificador
  ) {
    identificadorHash = chaveIdentificador(
      acao,
      identificador,
    );

    tipoIdentificador = `RATE_${acao}_IDENTIFICADOR`;

    const totalIdentificador =
      await contarEventos(
        tipoIdentificador,
        identificadorHash,
        desde,
      );

    bloqueado =
      totalIdentificador >=
      politica.limiteIdentificador;
  }

  if (bloqueado) {
    await registrarInterno({
      tipo: `BLOQUEIO_${acao}`,
      chaveHash: ipHash,
      sucesso: false,
      rota,
    });

    console.warn(
      `[Security] Rate limit acionado: ${acao} em ${rota}.`,
    );

    return {
      permitido: false,
      tentarNovamenteEmSegundos: Math.ceil(
        politica.janelaMs / 1000,
      ),
    };
  }

  await registrarInterno({
    tipo: tipoIp,
    chaveHash: ipHash,
    rota,
  });

  if (identificadorHash && tipoIdentificador) {
    await registrarInterno({
      tipo: tipoIdentificador,
      chaveHash: identificadorHash,
      rota,
    });
  }

  return {
    permitido: true,
  };
}

export async function registrarEventoSeguranca({
  tipo,
  sucesso,
  rota,
  identificador,
}: {
  tipo: string;
  sucesso?: boolean;
  rota: string;
  identificador?: string;
}): Promise<void> {
  try {
    await registrarInterno({
      tipo,
      sucesso,
      rota,
      chaveHash: identificador
        ? hashPrivado(
            `evento|${tipo}|${normalizarIdentificador(
              identificador,
            )}`,
          )
        : chaveIp("LOGIN_SENHA"),
    });
  } catch (error) {
    /*
     * Log de segurança não pode derrubar login/cadastro.
     * O erro continua no log do servidor para investigação.
     */
    console.error(
      `[Security] Falha ao registrar evento ${tipo}.`,
      error,
    );
  }
}