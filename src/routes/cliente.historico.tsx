import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  Clock,
  CreditCard,
  Loader2,
  Scissors,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { listarMeuHistoricoAtendimentos } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/cliente/historico")({
  component: HistoricoPage,
});

const LIMITE_POR_PAGINA = 20;
const TIMEZONE_PADRAO = "America/Sao_Paulo";

type FormaPagamento =
  | "PIX"
  | "DINHEIRO"
  | "CARTAO_DEBITO"
  | "CARTAO_CREDITO"
  | "ASSINATURA"
  | "CORTESIA"
  | "OUTRO"
  | null;

type Atendimento = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  formaPagamento: FormaPagamento;
  valorPagoCentavos: number | null;
  pagoEm: string | Date | null;
  servico: {
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  };
  profissional: { nome: string };
};

type RespostaHistorico = {
  itens: Atendimento[];
  total: number;
  proximoOffset: number | null;
};

function formatarMoeda(valorCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

function formatarDataHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_PADRAO,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function calcularDuracaoMinutos(inicio: string | Date, fim: string | Date): number {
  const diferenca = new Date(fim).getTime() - new Date(inicio).getTime();
  return Math.max(1, Math.round(diferenca / 60_000));
}

function formatarFormaPagamento(formaPagamento: FormaPagamento): string {
  const mapa: Record<Exclude<FormaPagamento, null>, string> = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    ASSINATURA: "Assinatura RD Black",
    CORTESIA: "Cortesia",
    OUTRO: "Outro",
  };
  return formaPagamento ? mapa[formaPagamento] : "Não informado";
}

function HistoricoPage() {
  const carregarHistorico = useServerFn(listarMeuHistoricoAtendimentos);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [total, setTotal] = useState(0);
  const [proximoOffset, setProximoOffset] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarPrimeiraPagina() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = (await carregarHistorico({
        data: { offset: 0, limite: LIMITE_POR_PAGINA },
      })) as RespostaHistorico;
      setAtendimentos(resposta.itens);
      setTotal(resposta.total);
      setProximoOffset(resposta.proximoOffset);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar seu histórico.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarMais() {
    if (proximoOffset === null || carregandoMais) return;
    setCarregandoMais(true);
    setErro("");
    try {
      const resposta = (await carregarHistorico({
        data: { offset: proximoOffset, limite: LIMITE_POR_PAGINA },
      })) as RespostaHistorico;
      setAtendimentos((atuais) => [...atuais, ...resposta.itens]);
      setTotal(resposta.total);
      setProximoOffset(resposta.proximoOffset);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar mais atendimentos.");
    } finally {
      setCarregandoMais(false);
    }
  }

  useEffect(() => {
    void carregarPrimeiraPagina();
  }, []);

  const valorCarregado = useMemo(
    () => atendimentos.reduce(
      (totalCentavos, atendimento) => totalCentavos +
        (atendimento.valorPagoCentavos ?? atendimento.servico.precoCentavos),
      0,
    ),
    [atendimentos],
  );

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Histórico de atendimentos"
        subtitle="Veja seus cortes já concluídos no Studio RD Black."
      />

      {erro && (
        <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Atendimentos realizados</span>
          <div className="mt-3 text-3xl font-display">{total}</div>
          <p className="mt-1 text-xs text-muted-foreground">cortes concluídos registrados</p>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Exibidos agora</span>
          <div className="mt-3 text-3xl font-display">{atendimentos.length}</div>
          <p className="mt-1 text-xs text-muted-foreground">carregados nesta tela</p>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Valor dos exibidos</span>
          <div className="mt-3 text-3xl font-display">{formatarMoeda(valorCarregado)}</div>
          <p className="mt-1 text-xs text-muted-foreground">soma apenas dos registros carregados</p>
        </section>
      </div>

      {carregando ? (
        <section className="flex min-h-56 items-center justify-center rounded-2xl border border-border bg-surface p-8">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando histórico...
          </p>
        </section>
      ) : atendimentos.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
          <Scissors className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-5 text-xl font-display">Nenhum atendimento concluído</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Depois que um atendimento for finalizado pela equipe, ele aparecerá aqui.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">Seus atendimentos</h2>
          </div>

          <div className="divide-y divide-border">
            {atendimentos.map((atendimento) => {
              const valor = atendimento.valorPagoCentavos ?? atendimento.servico.precoCentavos;
              return (
                <article key={atendimento.id} className="px-6 py-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-display">{atendimento.servico.nome}</h3>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">Concluído</span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                        <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 shrink-0 text-gold" />{formatarDataHora(atendimento.inicio)}</p>
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-gold" />{calcularDuracaoMinutos(atendimento.inicio, atendimento.fim)} min</p>
                        <p className="flex items-center gap-2"><UserRound className="h-4 w-4 shrink-0 text-gold" />{atendimento.profissional.nome}</p>
                        <p className="flex items-center gap-2"><CreditCard className="h-4 w-4 shrink-0 text-gold" />{formatarFormaPagamento(atendimento.formaPagamento)}</p>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-xl border border-border bg-background/40 px-4 py-3 lg:text-right">
                      <p className="text-xs text-muted-foreground">{atendimento.valorPagoCentavos !== null ? "Valor pago" : "Valor do serviço"}</p>
                      <p className="mt-1 text-lg font-semibold">{formatarMoeda(valor)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {proximoOffset !== null && (
            <div className="flex justify-center border-t border-border p-5">
              <Button type="button" variant="outline" disabled={carregandoMais} onClick={() => void carregarMais()}>
                {carregandoMais ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Carregando...</>
                ) : "Carregar mais"}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}