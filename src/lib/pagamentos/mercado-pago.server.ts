import type {
  EstadoConfiguracaoProvider,
  PaymentProvider,
} from "./provider.types";

export type ConfiguracaoMercadoPago = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  webhookSecret: string;
};

function lerEnvObrigatoria(nome: string): string {
  return process.env[nome]?.trim() ?? "";
}

export function obterConfiguracaoMercadoPago():
  | ConfiguracaoMercadoPago
  | null {
  const clientId = lerEnvObrigatoria("MERCADO_PAGO_CLIENT_ID");
  const clientSecret = lerEnvObrigatoria(
    "MERCADO_PAGO_CLIENT_SECRET",
  );
  const redirectUri = lerEnvObrigatoria(
    "MERCADO_PAGO_REDIRECT_URI",
  );
  const webhookSecret = lerEnvObrigatoria(
    "MERCADO_PAGO_WEBHOOK_SECRET",
  );

  if (!clientId || !clientSecret || !redirectUri || !webhookSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    webhookSecret,
  };
}

export const mercadoPagoProvider: PaymentProvider = {
  nome: "MERCADO_PAGO",

  configurado() {
    return obterConfiguracaoMercadoPago() !== null;
  },
};

export function obterEstadoMercadoPago(): EstadoConfiguracaoProvider {
  return {
    nome: mercadoPagoProvider.nome,
    configurado: mercadoPagoProvider.configurado(),
  };
}
