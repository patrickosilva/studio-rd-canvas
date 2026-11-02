import { createHash, randomBytes } from "node:crypto";

import { getRequestHeader } from "@tanstack/react-start/server";

const TRINTA_MINUTOS_MS = 30 * 60 * 1000;

export function gerarTokenRedefinicaoSenha(): {
  token: string;
  tokenHash: string;
  expiraEm: Date;
} {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashTokenRedefinicaoSenha(token);

  return {
    token,
    tokenHash,
    expiraEm: new Date(Date.now() + TRINTA_MINUTOS_MS),
  };
}

export function hashTokenRedefinicaoSenha(
  token: string,
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function obterBaseUrl(): string {
  const configurada = process.env.APP_URL?.trim();

  if (configurada) {
    return configurada.replace(/\/+$/, "");
  }

  const host =
    getRequestHeader("x-forwarded-host")?.trim() ||
    getRequestHeader("host")?.trim();

  const protocolo =
    getRequestHeader("x-forwarded-proto")?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https"
      : "http");

  if (host) {
    return `${protocolo}://${host}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error(
    "APP_URL não configurada e não foi possível determinar a URL pública.",
  );
}

export async function enviarEmailRedefinicaoSenha({
  email,
  token,
}: {
  email: string;
  token: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY e RESEND_FROM_EMAIL/EMAIL_FROM são obrigatórios em produção.",
      );
    }

    console.warn(
      "[PasswordReset] Resend não configurado. E-mail de redefinição não enviado.",
    );
    return;
  }

  const url =
    `${obterBaseUrl()}/redefinir-senha?token=` +
    encodeURIComponent(token);

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Redefinição de senha — Studio RD Black",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
            <h2>Redefinição de senha</h2>
            <p>
              Recebemos uma solicitação para redefinir a senha da sua conta no
              Studio RD Black.
            </p>
            <p>
              <a
                href="${url}"
                style="display:inline-block;padding:12px 18px;background:#e5b641;color:#111;text-decoration:none;border-radius:8px;font-weight:700"
              >
                Redefinir minha senha
              </a>
            </p>
            <p>
              Este link é válido por 30 minutos e só pode ser usado uma vez.
            </p>
            <p>
              Se você não solicitou a redefinição, ignore este e-mail.
            </p>
          </div>
        `,
      }),
    },
  );

  if (!response.ok) {
    const detalhe = await response
      .text()
      .catch(() => "");

    throw new Error(
      `Falha ao enviar e-mail de redefinição (${response.status}): ${detalhe.slice(0, 300)}`,
    );
  }
}
