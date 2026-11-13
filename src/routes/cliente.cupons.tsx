import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  Clock3,
  Copy,
  LockKeyhole,
  Sparkles,
  TicketPercent,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { listarCuponsVisiveisCliente } from "@/lib/api/cupons.functions";

export const Route = createFileRoute("/cliente/cupons")({
  component: ClienteCuponsPage,
});

type CupomCliente = {
  id: string;
  codigo: string;
  descricao: string | null;
  campanha: string | null;
  tipo: "PERCENTUAL" | "VALOR_FIXO";
  percentualDesconto: number | null;
  valorDescontoCentavos: number | null;
  limiteDescontoCentavos: number | null;
  valorMinimoCentavos: number | null;
  inicioEm: string | Date | null;
  fimEm: string | Date | null;
  aplicaTodosServicos: boolean;
  servicos: {
    id: string;
    nome: string;
  }[];
  combinavelComAssinatura: boolean;
  destaque: boolean;
  elegivel: boolean;
  motivo: string | null;
  status: "DISPONIVEL" | "EM_BREVE" | "INDISPONIVEL";
};

function formatarDinheiro(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function formatarData(
  valor: string | Date | null,
): string {
  if (!valor) {
    return "sem data limite";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}

function descricaoDesconto(
  cupom: CupomCliente,
): string {
  if (
    cupom.tipo === "PERCENTUAL" &&
    cupom.percentualDesconto
  ) {
    const teto = cupom.limiteDescontoCentavos
      ? `, até ${formatarDinheiro(
          cupom.limiteDescontoCentavos,
        )}`
      : "";

    return `${cupom.percentualDesconto}% de desconto${teto}`;
  }

  if (
    cupom.tipo === "VALOR_FIXO" &&
    cupom.valorDescontoCentavos
  ) {
    return `${formatarDinheiro(
      cupom.valorDescontoCentavos,
    )} de desconto`;
  }

  return "Desconto especial";
}

function ClienteCuponsPage() {
  const listarCupons = useServerFn(
    listarCuponsVisiveisCliente,
  );

  const [cupons, setCupons] = useState<CupomCliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState("");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await listarCupons();
        setCupons(resposta);
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar os cupons.");
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, []);

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);

      window.setTimeout(() => {
        setCopiado("");
      }, 1800);
    } catch {
      setCopiado("");
    }
  }

  return (
    <div className="max-w-6xl p-4 sm:p-8 lg:p-12">
      <PageHeader
        title="Cupons"
        subtitle="Veja campanhas do Studio RD e quais cupons já estão disponíveis para você."
      />

      {erro && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted-foreground">
          Carregando cupons...
        </div>
      ) : cupons.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center">
          <TicketPercent className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl">
            Nenhuma campanha disponível
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Quando o Studio RD publicar novos cupons, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cupons.map((cupom) => {
            const disponivel =
              cupom.status === "DISPONIVEL" &&
              cupom.elegivel;

            return (
              <article
                key={cupom.id}
                className={`relative overflow-hidden rounded-3xl border bg-surface p-5 ${
                  cupom.destaque
                    ? "border-gold/60 shadow-lg"
                    : "border-border"
                }`}
              >
                {cupom.destaque && (
                  <div className="absolute right-4 top-4">
                    <Sparkles className="h-5 w-5 text-gold" />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pr-8">
                  {cupom.campanha && (
                    <span className="rounded-full border border-gold/30 bg-gold-soft px-2.5 py-1 text-xs text-gold">
                      {cupom.campanha}
                    </span>
                  )}

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      disponivel
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : cupom.status === "EM_BREVE"
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {disponivel
                      ? "Disponível"
                      : cupom.status === "EM_BREVE"
                        ? "Em breve"
                        : "Bloqueado"}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-display">
                  {descricaoDesconto(cupom)}
                </h2>

                {cupom.descricao && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {cupom.descricao}
                  </p>
                )}

                <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Código
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <strong className="min-w-0 flex-1 truncate font-mono text-lg text-gold">
                      {cupom.codigo}
                    </strong>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!disponivel}
                      onClick={() =>
                        void copiarCodigo(cupom.codigo)
                      }
                    >
                      {copiado === cupom.codigo ? (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {copiado === cupom.codigo
                        ? "Copiado"
                        : "Copiar"}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {cupom.inicioEm && (
                    <p className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      Início: {formatarData(cupom.inicioEm)}
                    </p>
                  )}

                  <p>
                    Validade: {formatarData(cupom.fimEm)}
                  </p>

                  <p>
                    Serviços:{" "}
                    {cupom.aplicaTodosServicos
                      ? "todos os serviços"
                      : cupom.servicos
                          .map((servico) => servico.nome)
                          .join(", ")}
                  </p>

                  {cupom.valorMinimoCentavos !== null && (
                    <p>
                      Valor mínimo:{" "}
                      {formatarDinheiro(
                        cupom.valorMinimoCentavos,
                      )}
                    </p>
                  )}

                  <p>
                    {cupom.combinavelComAssinatura
                      ? "Pode ser combinado com assinatura."
                      : "Não acumula automaticamente com assinatura."}
                  </p>
                </div>

                {!disponivel && cupom.motivo && (
                  <div className="mt-4 flex gap-3 rounded-xl border border-border bg-background/50 p-3 text-sm text-muted-foreground">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{cupom.motivo}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}