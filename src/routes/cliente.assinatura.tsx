import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  CheckCircle2,
  Crown,
  History,
  Scissors,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { listarMinhaAssinaturaAtiva } from "@/lib/api/assinatura.functions";

export const Route = createFileRoute("/cliente/assinatura")({
  component: ClienteAssinaturaPage,
});

type MinhaAssinatura = {
  id: string;
  status: "ATIVA" | "PAUSADA" | "CANCELADA" | "EXPIRADA";
  vigenciaInicio: string | Date;
  vigenciaFim: string | Date;
  saldoCortes: number;
  observacao: string | null;

  plano: {
    id: string;
    nome: string;
    descricao: string | null;
    precoCentavos: number;
    cortesPorCiclo: number;
    duracaoDias: number;
  };

  usos: {
    id: string;
    quantidadeCortes: number;
    criadoEm: string | Date;
    agendamento: {
      id: string;
      inicio: string | Date;
      status: string;
      servico: {
        nome: string;
      };
    };
  }[];
};

function formatarDinheiro(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function formatarData(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor));
}

function formatarDataHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function ClienteAssinaturaPage() {
  const buscarMinhaAssinatura = useServerFn(
    listarMinhaAssinaturaAtiva,
  );

  const [assinatura, setAssinatura] =
    useState<MinhaAssinatura | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await buscarMinhaAssinatura();

      setAssinatura(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar sua assinatura.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Minha assinatura"
        subtitle="Acompanhe seu plano, saldo de cortes e validade da assinatura."
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      {carregando ? (
        <section className="rounded-2xl border border-border bg-surface p-8">
          <p className="text-sm text-muted-foreground">
            Carregando assinatura...
          </p>
        </section>
      ) : !assinatura ? (
        <section className="rounded-2xl border border-border bg-surface p-8">
          <div className="flex max-w-2xl flex-col items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">
              <Crown className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-display">
                Você ainda não possui uma assinatura ativa
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Quando a barbearia ativar uma assinatura para sua conta, você
                verá aqui o plano, a validade e o saldo de cortes disponíveis.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Plano
                </span>

                <Crown className="h-4 w-4 text-gold" />
              </div>

              <div className="mt-3 text-xl font-display">
                {assinatura.plano.nome}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                assinatura ativa
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Saldo
                </span>

                <Scissors className="h-4 w-4 text-gold" />
              </div>

              <div className="mt-3 text-3xl font-display">
                {assinatura.saldoCortes}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                cortes disponíveis
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Validade
                </span>

                <CalendarDays className="h-4 w-4 text-gold" />
              </div>

              <div className="mt-3 text-lg font-display">
                {formatarData(assinatura.vigenciaFim)}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                fim da vigência
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Valor
                </span>

                <CheckCircle2 className="h-4 w-4 text-gold" />
              </div>

              <div className="mt-3 text-lg font-display">
                {formatarDinheiro(assinatura.plano.precoCentavos)}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                por ciclo de {assinatura.plano.duracaoDias} dias
              </p>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-6 flex items-center gap-3">
                <Crown className="h-5 w-5 text-gold" />

                <div>
                  <h2 className="text-sm font-medium">
                    Detalhes do plano
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Informações da sua assinatura ativa.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Nome
                  </p>

                  <p className="mt-2 font-medium">
                    {assinatura.plano.nome}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Benefício
                  </p>

                  <p className="mt-2 font-medium">
                    {assinatura.plano.cortesPorCiclo} cortes a cada{" "}
                    {assinatura.plano.duracaoDias} dias
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Vigência
                  </p>

                  <p className="mt-2 font-medium">
                    {formatarData(assinatura.vigenciaInicio)} até{" "}
                    {formatarData(assinatura.vigenciaFim)}
                  </p>
                </div>

                {assinatura.plano.descricao && (
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Descrição
                    </p>

                    <p className="mt-2 leading-6 text-muted-foreground">
                      {assinatura.plano.descricao}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-sm font-medium">
                    Histórico de uso
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Cortes já utilizados nesta assinatura.
                  </p>
                </div>

                <History className="h-4 w-4 text-gold" />
              </div>

              {assinatura.usos.length === 0 ? (
                <div className="px-6 py-10">
                  <p className="text-sm text-muted-foreground">
                    Nenhum corte foi usado pela assinatura ainda.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {assinatura.usos.map((uso) => (
                    <article key={uso.id} className="px-6 py-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">
                            {uso.agendamento.servico.nome}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Atendimento em{" "}
                            {formatarDataHora(uso.agendamento.inicio)}
                          </p>
                        </div>

                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          {uso.quantidadeCortes} corte utilizado
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}