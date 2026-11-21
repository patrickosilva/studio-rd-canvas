import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  CreditCard,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { adminResumoEquipe } from "@/lib/api/equipe.functions";

export const Route = createFileRoute("/admin/equipe")({
  component: AdminEquipePage,
});

type Periodo = "HOJE" | "SEMANA";

type ResumoEquipe = Awaited<
  ReturnType<typeof adminResumoEquipe>
>;

function formatarMoeda(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

function formatarDataHora(valor: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function traduzirPagamento(valor: string | null) {
  const mapa: Record<string, string> = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartao de debito",
    CARTAO_CREDITO: "Cartao de credito",
    ASSINATURA: "Assinatura",
    CORTESIA: "Cortesia",
    OUTRO: "Outro",
  };

  return valor ? mapa[valor] ?? valor : "Nao informado";
}

function AdminEquipePage() {
  const buscarResumo = useServerFn(adminResumoEquipe);

  const [periodo, setPeriodo] =
    useState<Periodo>("HOJE");
  const [resumo, setResumo] =
    useState<ResumoEquipe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abertoId, setAbertoId] = useState("");

  async function carregar(periodoAtual: Periodo) {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await buscarResumo({
        data: {
          periodo: periodoAtual,
        },
      });

      setResumo(resposta);
    } catch (error) {
      console.error(error);
      setErro(
        "Nao foi possivel carregar o monitoramento da equipe.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar(periodo);
  }, [periodo]);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Equipe"
        subtitle="Acompanhe atendimentos e valores recebidos por profissional."
      />

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setPeriodo("HOJE")}
          className={`h-10 rounded-md border px-4 text-sm ${
            periodo === "HOJE"
              ? "border-gold bg-gold-soft text-gold"
              : "border-border bg-surface text-muted-foreground"
          }`}
        >
          Hoje
        </button>

        <button
          type="button"
          onClick={() => setPeriodo("SEMANA")}
          className={`h-10 rounded-md border px-4 text-sm ${
            periodo === "SEMANA"
              ? "border-gold bg-gold-soft text-gold"
              : "border-border bg-surface text-muted-foreground"
          }`}
        >
          Semana
        </button>
      </div>

      {erro && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Faturamento
            <Banknote className="h-4 w-4 text-gold" />
          </div>

          <p className="mt-3 text-3xl font-display">
            {carregando || !resumo
              ? "..."
              : formatarMoeda(
                  resumo.faturamentoTotalCentavos,
                )}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Clientes atendidos
            <UserCheck className="h-4 w-4 text-gold" />
          </div>

          <p className="mt-3 text-3xl font-display">
            {carregando || !resumo
              ? "..."
              : resumo.clientesAtendidos}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            Ticket medio
            <CreditCard className="h-4 w-4 text-gold" />
          </div>

          <p className="mt-3 text-3xl font-display">
            {carregando || !resumo
              ? "..."
              : formatarMoeda(
                  resumo.ticketMedioCentavos,
                )}
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <UsersRound className="h-4 w-4 text-gold" />
            Producao por profissional
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Clique em um profissional para conferir cada atendimento e a forma de pagamento registrada.
          </p>
        </div>

        {carregando ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            Carregando equipe...
          </div>
        ) : !resumo || resumo.equipe.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            Nenhum profissional ativo encontrado.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {resumo.equipe.map((item, indice) => {
              const aberto =
                abertoId === item.profissional.id;

              return (
                <article
                  key={item.profissional.id}
                  className="px-6 py-5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAbertoId(
                        aberto
                          ? ""
                          : item.profissional.id,
                      )
                    }
                    className="flex w-full items-center gap-4 text-left"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold-soft text-sm font-semibold text-gold">
                      {indice + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {item.profissional.nome}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.clientesAtendidos} cliente(s) atendido(s)
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {formatarMoeda(
                          item.faturamentoCentavos,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        recebido
                      </p>
                    </div>

                    {aberto ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {aberto && (
                    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-background/40">
                      {item.detalhes.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted-foreground">
                          Nenhum atendimento concluido nesse periodo.
                        </p>
                      ) : (
                        <div className="divide-y divide-border">
                          {item.detalhes.map(
                            (atendimento) => (
                              <div
                                key={atendimento.id}
                                className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_auto]"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    {
                                      atendimento
                                        .cliente.nome
                                    }
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                      atendimento.servicoNome
                                    }{" "}
                                    •{" "}
                                    {formatarDataHora(
                                      atendimento.inicio,
                                    )}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Pagamento
                                  </p>
                                  <p className="mt-1 text-sm">
                                    {traduzirPagamento(
                                      atendimento.formaPagamento,
                                    )}
                                  </p>
                                </div>

                                <div className="md:text-right">
                                  <p className="text-sm font-semibold">
                                    {formatarMoeda(
                                      atendimento.valorRecebidoCentavos,
                                    )}
                                  </p>

                                  {atendimento.formaPagamento ===
                                    "ASSINATURA" && (
                                    <p className="mt-1 text-xs text-gold">
                                      Servico:{" "}
                                      {formatarMoeda(
                                        atendimento.valorServicoCentavos,
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}