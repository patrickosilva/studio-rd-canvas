export type CredenciaisInfinitePay = {
  apiKey: string;
};

export type CriarCheckoutInfinitePayInput = {
  apiKey: string;
  handle: string;
  orderNsu: string;
  descricao: string;
  valorCentavos: number;
  redirectUrl: string;
  webhookUrl: string;
  validUntil: Date;
  cliente?: {
    nome: string;
    email: string;
    telefone: string | null;
  };
};

export type ConfirmarPagamentoInfinitePayInput = {
  apiKey: string;
  handle: string;
  orderNsu: string;
  transactionNsu: string;
  slug: string;
};

export type ResultadoPaymentCheckInfinitePay = {
  success: boolean;
  paid: boolean;
  amount: number | null;
  paidAmount: number | null;
  installments: number | null;
  captureMethod: string | null;
};

const API_BASE = "https://api.checkout.infinitepay.io";

function mensagemErroInfinitePay(
  status: number,
  corpo: string,
): string {
  const detalhe = corpo.trim().slice(0, 700);

  return detalhe
    ? `InfinitePay respondeu ${status}: ${detalhe}`
    : `InfinitePay respondeu ${status}.`;
}

function normalizarTelefone(
  telefone: string | null | undefined,
): string | undefined {
  if (!telefone) {
    return undefined;
  }

  const digitos = telefone.replace(/\D/g, "");

  if (digitos.length === 10 || digitos.length === 11) {
    return `+55${digitos}`;
  }

  if (digitos.length >= 12 && digitos.length <= 15) {
    return `+${digitos}`;
  }

  return undefined;
}

function extrairUrlCheckout(valor: unknown): string | null {
  if (typeof valor === "string") {
    return /^https?:\/\//i.test(valor) ? valor : null;
  }

  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return null;
  }

  const objeto = valor as Record<string, unknown>;

  const candidatos = [
    objeto.url,
    objeto.checkout_url,
    objeto.checkoutUrl,
    objeto.link,
  ];

  for (const candidato of candidatos) {
    if (
      typeof candidato === "string" &&
      /^https?:\/\//i.test(candidato)
    ) {
      return candidato;
    }
  }

  if (
    objeto.data &&
    typeof objeto.data === "object" &&
    !Array.isArray(objeto.data)
  ) {
    return extrairUrlCheckout(objeto.data);
  }

  return null;
}

async function parseJsonSeguro(
  response: Response,
): Promise<unknown> {
  const texto = await response.text();

  if (!texto.trim()) {
    return {};
  }

  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

export async function testarConfiguracaoInfinitePay({
  apiKey,
  handle,
}: {
  apiKey: string;
  handle: string;
}): Promise<void> {
  const validUntil = new Date(
    Date.now() + 10 * 60 * 1000,
  );

  await criarCheckoutInfinitePay({
    apiKey,
    handle,
    orderNsu: `studio-rd-validacao-${Date.now()}`,
    descricao: "Validacao de integracao Studio RD",
    valorCentavos: 100,
    redirectUrl: "https://example.com/studio-rd-validacao",
    webhookUrl: "https://example.com/studio-rd-webhook",
    validUntil,
  });
}

export async function criarCheckoutInfinitePay(
  input: CriarCheckoutInfinitePayInput,
): Promise<{ checkoutUrl: string; resposta: unknown }> {
  const customer = input.cliente
    ? {
        name: input.cliente.nome,
        email: input.cliente.email,
        phone_number: normalizarTelefone(
          input.cliente.telefone,
        ),
      }
    : undefined;

  if (customer && !customer.phone_number) {
    delete customer.phone_number;
  }

  const response = await fetch(`${API_BASE}/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": input.apiKey,
    },
    body: JSON.stringify({
      handle: input.handle,
      order_nsu: input.orderNsu,
      redirect_url: input.redirectUrl,
      webhook: {
        url: input.webhookUrl,
        events: ["paid"],
      },
      items: [
        {
          quantity: 1,
          price: input.valorCentavos,
          description: input.descricao,
        },
      ],
      ...(customer ? { customer } : {}),
      options: {
        single_payment: true,
        valid_until: input.validUntil.toISOString(),
        payment_methods_enabled: [
          "credit_card",
          "pix",
        ],
      },
    }),
  });

  const corpo = await parseJsonSeguro(response);

  if (!response.ok) {
    throw new Error(
      mensagemErroInfinitePay(
        response.status,
        typeof corpo === "string"
          ? corpo
          : JSON.stringify(corpo),
      ),
    );
  }

  const checkoutUrl = extrairUrlCheckout(corpo);

  if (!checkoutUrl) {
    throw new Error(
      `InfinitePay criou a cobrança, mas não retornou uma URL de checkout reconhecida: ${JSON.stringify(
        corpo,
      ).slice(0, 700)}`,
    );
  }

  return {
    checkoutUrl,
    resposta: corpo,
  };
}

export async function confirmarPagamentoInfinitePay(
  input: ConfirmarPagamentoInfinitePayInput,
): Promise<ResultadoPaymentCheckInfinitePay> {
  const response = await fetch(
    `${API_BASE}/payment_check`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": input.apiKey,
      },
      body: JSON.stringify({
        handle: input.handle,
        order_nsu: input.orderNsu,
        transaction_nsu: input.transactionNsu,
        slug: input.slug,
      }),
    },
  );

  const corpo = await parseJsonSeguro(response);

  if (!response.ok) {
    throw new Error(
      mensagemErroInfinitePay(
        response.status,
        typeof corpo === "string"
          ? corpo
          : JSON.stringify(corpo),
      ),
    );
  }

  if (
    !corpo ||
    typeof corpo !== "object" ||
    Array.isArray(corpo)
  ) {
    throw new Error(
      "Resposta inválida do payment_check da InfinitePay.",
    );
  }

  const objeto = corpo as Record<string, unknown>;

  return {
    success: objeto.success === true,
    paid: objeto.paid === true,
    amount:
      typeof objeto.amount === "number"
        ? objeto.amount
        : null,
    paidAmount:
      typeof objeto.paid_amount === "number"
        ? objeto.paid_amount
        : null,
    installments:
      typeof objeto.installments === "number"
        ? objeto.installments
        : null,
    captureMethod:
      typeof objeto.capture_method === "string"
        ? objeto.capture_method
        : null,
  };
}