import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CreditCard,
  Loader2,
} from "lucide-react";

import { clienteCriarCheckoutAssinatura } from "@/lib/api/assinatura-pagamento.functions";

export function CheckoutAssinaturaButton({
  planoId,
}: {
  planoId: string;
}) {
  const criarCheckout = useServerFn(
    clienteCriarCheckoutAssinatura,
  );

  const [processando, setProcessando] =
    useState(false);
  const [erro, setErro] = useState("");

  async function pagar() {
    setProcessando(true);
    setErro("");

    try {
      const resultado =
        await criarCheckout({
          data: {
            planoId,
          },
        });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      window.location.assign(
        resultado.checkoutUrl,
      );
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível abrir o pagamento.",
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={processando}
        onClick={() => void pagar()}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition disabled:opacity-50"
      >
        {processando ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-4 w-4" />
        )}

        {processando
          ? "Abrindo pagamento..."
          : "Pagar com InfinitePay"}
      </button>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Pix ou cartão. A assinatura só é ativada depois da confirmação do pagamento pela InfinitePay.
      </p>

      {erro && (
        <p className="mt-2 text-xs text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}