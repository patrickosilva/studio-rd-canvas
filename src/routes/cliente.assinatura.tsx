import {
  useEffect,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  History,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import { CheckoutAssinaturaButton } from "@/components/assinaturas/CheckoutAssinaturaButton";
import { PageHeader } from "@/components/dashboard/Sidebar";
import {
  clienteCatalogoAssinaturas,
  clienteEstadoAcessoAssinaturas,
  clienteSolicitarAcessoAssinatura,
} from "@/lib/api/assinatura-acesso.functions";
import { listarMinhaAssinaturaAtiva } from "@/lib/api/assinatura.functions";

export const Route = createFileRoute(
  "/cliente/assinatura",
)({
  component: ClienteAssinaturaPage,
});

type MinhaAssinatura =
  | {
      id: string;
      status:
        | "ATIVA"
        | "PAUSADA"
        | "CANCELADA"
        | "EXPIRADA";
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
        duracaoMeses: number;
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
    }
  | null;

type PlanoCatalogo = {
  id: string;
  nome: string;
  descricao: string | null;
  precoCentavos: number;
  cortesPorCiclo: number;
  duracaoMeses: number;
};

type EstadoAcesso = {
  podeVerCatalogo: boolean;
  solicitacao: {
    id: string;
    status:
      | "PENDENTE"
      | "APROVADA"
      | "RECUSADA"
      | "CANCELADA"
      | "UTILIZADA";
    solicitadoEm: string | Date;
    decididoEm: string | Date | null;
    observacaoDecisao: string | null;
  } | null;
};

function formatarDinheiro(
  centavos: number,
): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function formatarData(
  valor: string | Date,
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor));
}

function formatarDataHora(
  valor: string | Date,
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function ClienteAssinaturaPage() {
  const buscarAssinatura = useServerFn(
    listarMinhaAssinaturaAtiva,
  );
  const buscarEstado = useServerFn(
    clienteEstadoAcessoAssinaturas,
  );
  const buscarCatalogo = useServerFn(
    clienteCatalogoAssinaturas,
  );
  const solicitar = useServerFn(
    clienteSolicitarAcessoAssinatura,
  );

  const [assinatura, setAssinatura] =
    useState<MinhaAssinatura>(null);
  const [estadoAcesso, setEstadoAcesso] =
    useState<EstadoAcesso | null>(null);
  const [planos, setPlanos] =
    useState<PlanoCatalogo[]>([]);
  const [carregando, setCarregando] =
    useState(true);
  const [processando, setProcessando] =
    useState(false);
  const [mensagem, setMensagem] =
    useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [ativa, acesso] =
        await Promise.all([
          buscarAssinatura(),
          buscarEstado(),
        ]);

      setAssinatura(
        ativa as MinhaAssinatura,
      );
      setEstadoAcesso(
        acesso as EstadoAcesso,
      );

      if (
        !ativa &&
        acesso.podeVerCatalogo
      ) {
        setPlanos(
          (await buscarCatalogo()) as PlanoCatalogo[],
        );
      } else {
        setPlanos([]);
      }
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar o RD Black.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function solicitarAcesso() {
    setProcessando(true);
    setMensagem("");
    setErro("");

    try {
      const resposta =
        await solicitar();

      if (!resposta.sucesso) {
        setErro(resposta.mensagem);
        return;
      }

      setMensagem(resposta.mensagem);
      await carregar();
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível enviar a solicitação.",
      );
    } finally {
      setProcessando(false);
    }
  }

  const status =
    estadoAcesso?.solicitacao?.status ??
    null;

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="RD Black"
        subtitle={
          assinatura
            ? "Acompanhe sua assinatura, saldo e histórico."
            : estadoAcesso?.podeVerCatalogo
              ? "Seu acesso Premium está liberado. Escolha o plano que combina com você."
              : "Solicite acesso ao clube Premium do Studio RD."
        }
      />

      {erro && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-md border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <section className="rounded-xl border border-border bg-surface p-8">
          <p className="text-sm text-muted-foreground">
            Carregando...
          </p>
        </section>
      ) : assinatura ? (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <section className="rounded-xl border border-gold/30 bg-gold-soft p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gold">
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

            <section className="rounded-xl border border-border bg-surface p-5">
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

            <section className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Validade
                </span>
                <CalendarDays className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-3 text-lg font-display">
                {formatarData(
                  assinatura.vigenciaFim,
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Valor
                </span>
                <CheckCircle2 className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-3 text-lg font-display">
                {formatarDinheiro(
                  assinatura.plano.precoCentavos,
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {assinatura.plano.duracaoMeses} mês(es)
              </p>
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-sm font-medium">
                  Histórico de uso
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cortes utilizados nesta assinatura.
                </p>
              </div>
              <History className="h-4 w-4 text-gold" />
            </div>

            {assinatura.usos.length === 0 ? (
              <div className="px-6 py-8 text-sm text-muted-foreground">
                Nenhum corte utilizado ainda.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {assinatura.usos.map((uso) => (
                  <article
                    key={uso.id}
                    className="px-6 py-5"
                  >
                    <p className="font-medium">
                      {
                        uso.agendamento.servico
                          .nome
                      }
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatarDataHora(
                        uso.agendamento.inicio,
                      )}
                      {" · "}
                      {uso.quantidadeCortes} corte(s)
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : estadoAcesso?.podeVerCatalogo ? (
        <section>
          <div className="mb-6 rounded-xl border border-gold/30 bg-gold-soft p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <h2 className="font-medium text-gold">
                  Acesso Premium liberado
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  O Studio RD aprovou seu acesso. Agora você pode conhecer os planos e escolher qual deseja assinar.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display">
              Catálogo RD Black
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Escolher um plano abre o checkout da InfinitePay. A assinatura só fica ativa depois da confirmação do pagamento.
            </p>
          </div>

          {planos.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">
              Nenhum plano disponível no momento.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {planos.map((plano) => (
                <article
                  key={plano.id}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <Crown className="h-5 w-5 text-gold" />

                  <h3 className="mt-4 text-xl font-display">
                    {plano.nome}
                  </h3>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatarDinheiro(
                      plano.precoCentavos,
                    )}
                  </p>

                  <div className="mt-5 space-y-2 text-sm">
                    <p>
                      {plano.cortesPorCiclo} corte(s)
                    </p>
                    <p>
                      {plano.duracaoMeses} mês(es) de vigência
                    </p>
                  </div>

                  {plano.descricao && (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {plano.descricao}
                    </p>
                  )}

                  <CheckoutAssinaturaButton
                    planoId={plano.id}
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      ) : status === "PENDENTE" ? (
        <section className="rounded-xl border border-border bg-surface p-8">
          <Clock3 className="h-8 w-8 text-gold" />
          <h2 className="mt-5 text-2xl font-display">
            Solicitação em análise
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Seu pedido para acessar o RD Black foi enviado ao Studio RD. Quando ele for aprovado, o catálogo de planos será liberado automaticamente aqui.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="p-8 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold">
              <Crown className="h-6 w-6" />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-gold">
              Studio RD Premium
            </p>

            <h2 className="mt-2 max-w-2xl text-3xl font-display">
              Conheça o RD Black
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              O catálogo de assinaturas é reservado aos clientes com acesso Premium liberado pelo Studio RD. Envie seu pedido primeiro; depois da aprovação, os planos e valores aparecem nesta página.
            </p>

            {status === "RECUSADA" && (
              <p className="mt-4 max-w-2xl rounded-md border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                Sua solicitação anterior não foi aprovada. Você pode enviar uma nova solicitação para análise.
              </p>
            )}

            {status === "CANCELADA" && (
              <p className="mt-4 max-w-2xl rounded-md border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                Seu acesso anterior ao catálogo foi encerrado. Você pode solicitar uma nova análise.
              </p>
            )}

            <button
              type="button"
              disabled={processando}
              onClick={() =>
                void solicitarAcesso()
              }
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {processando
                ? "Enviando solicitação..."
                : "Solicitar acesso ao RD Black"}
            </button>

            <p className="mt-3 text-xs text-muted-foreground">
              Solicitar acesso não gera cobrança e não cria uma assinatura.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}