import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import { confirmarRetornoPagamentoAssinatura } from "@/lib/api/assinatura-pagamento.functions";

type SearchPagamento = {
  order_nsu: string;
  transaction_nsu: string;
  slug: string;
  receipt_url: string;
};

export const Route = createFileRoute(
  "/pagamento-assinatura/retorno",
)({
  validateSearch: (
    search: Record<string, unknown>,
  ): SearchPagamento => ({
    order_nsu:
      typeof search.order_nsu === "string"
        ? search.order_nsu
        : "",
    transaction_nsu:
      typeof search.transaction_nsu === "string"
        ? search.transaction_nsu
        : "",
    slug:
      typeof search.slug === "string"
        ? search.slug
        : "",
    receipt_url:
      typeof search.receipt_url === "string"
        ? search.receipt_url
        : "",
  }),
  component: RetornoPagamentoAssinaturaPage,
});

function RetornoPagamentoAssinaturaPage() {
  const search = Route.useSearch();

  const confirmar = useServerFn(
    confirmarRetornoPagamentoAssinatura,
  );

  const [estado, setEstado] = useState<
    "PROCESSANDO" | "SUCESSO" | "ERRO"
  >("PROCESSANDO");

  const [mensagem, setMensagem] =
    useState("Confirmando pagamento...");

  useEffect(() => {
    void (async () => {
      if (
        !search.order_nsu ||
        !search.transaction_nsu ||
        !search.slug
      ) {
        setEstado("ERRO");
        setMensagem(
          "O retorno da InfinitePay não trouxe todos os identificadores necessários.",
        );
        return;
      }

      try {
        const resultado = await confirmar({
          data: {
            orderNsu: search.order_nsu,
            transactionNsu:
              search.transaction_nsu,
            slug: search.slug,
            receiptUrl:
              search.receipt_url,
          },
        });

        if (
          !resultado.sucesso ||
          !resultado.pago
        ) {
          setEstado("ERRO");
          setMensagem(resultado.mensagem);
          return;
        }

        setEstado("SUCESSO");
        setMensagem(resultado.mensagem);
      } catch (error) {
        console.error(error);
        setEstado("ERRO");
        setMensagem(
          "Não foi possível confirmar o pagamento.",
        );
      }
    })();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-xl border border-border bg-surface p-7 text-center">
        {estado === "PROCESSANDO" && (
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" />
        )}

        {estado === "SUCESSO" && (
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        )}

        {estado === "ERRO" && (
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
        )}

        <h1 className="mt-5 text-2xl font-display">
          {estado === "PROCESSANDO"
            ? "Validando pagamento"
            : estado === "SUCESSO"
              ? "Pagamento confirmado"
              : "Pagamento não confirmado"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {mensagem}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {estado === "SUCESSO" && (
            <Link
              to="/cliente/agendamentos"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Agendar meu próximo corte
            </Link>
          )}
          <Link
            to="/cliente/assinatura"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Ver minha assinatura
          </Link>

          {search.receipt_url && (
            <a
              href={search.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gold hover:underline"
            >
              Abrir comprovante
            </a>
          )}
        </div>
      </section>
    </main>
  );
}