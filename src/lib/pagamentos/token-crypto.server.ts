import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITMO = "aes-256-gcm";
const VERSAO = "v1";

function obterChave(): Buffer {
  const valor = process.env.PAYMENT_TOKEN_ENCRYPTION_KEY?.trim();

  if (!valor) {
    throw new Error(
      "PAYMENT_TOKEN_ENCRYPTION_KEY nao configurada.",
    );
  }

  const chave = Buffer.from(valor, "base64");

  if (chave.length !== 32) {
    throw new Error(
      "PAYMENT_TOKEN_ENCRYPTION_KEY precisa conter 32 bytes em Base64.",
    );
  }

  return chave;
}

export function criptografarToken(valor: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITMO, obterChave(), iv);

  const conteudo = Buffer.concat([
    cipher.update(valor, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    VERSAO,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    conteudo.toString("base64url"),
  ].join(".");
}

export function descriptografarToken(valor: string): string {
  const [versao, ivRaw, authTagRaw, conteudoRaw] = valor.split(".");

  if (versao !== VERSAO || !ivRaw || !authTagRaw || !conteudoRaw) {
    throw new Error("Token criptografado invalido.");
  }

  const decipher = createDecipheriv(
    ALGORITMO,
    obterChave(),
    Buffer.from(ivRaw, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(authTagRaw, "base64url"));

  const conteudo = Buffer.concat([
    decipher.update(Buffer.from(conteudoRaw, "base64url")),
    decipher.final(),
  ]);

  return conteudo.toString("utf8");
}
