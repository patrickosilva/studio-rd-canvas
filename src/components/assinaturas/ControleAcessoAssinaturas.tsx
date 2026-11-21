import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Check,
  Clock3,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  adminDecidirSolicitacaoAssinatura,
  adminListarSolicitacoesAssinatura,
} from "@/lib/api/assinatura-acesso.functions";

type StatusSolicitacao =
  | "PENDENTE"
  | "APROVADA"
  | "RECUSADA"
  | "CANCELADA"
  | "UTILIZADA";

type Solicitacao = {
  id: string;
  status: StatusSolicitacao;
  solicitadoEm: string | Date;
  decididoEm: string | Date | null;
  observacaoDecisao: string | null;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
  };
};

function statusLabel(status: StatusSolicitacao) {
  if (status === "PENDENTE") {
    return "Aguardando";
  }

  if (status === "APROVADA") {
    return "Catálogo liberado";
  }

  if (status === "RECUSADA") {
    return "Recusada";
  }

  if (status === "CANCELADA") {
    return "Revogada";
  }

  return "Histórico";
}

function formatarData(valor: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

export function ControleAcessoAssinaturas() {
  const listar = useServerFn(
    adminListarSolicitacoesAssinatura,
  );
  const decidir = useServerFn(
    adminDecidirSolicitacaoAssinatura,
  );

  const [solicitacoes, setSolicitacoes] =
    useState<Solicitacao[]>([]);
  const [aba, setAba] = useState<
    "PENDENTES" | "HISTORICO"
  >("PENDENTES");
  const [carregando, setCarregando] =
    useState(true);
  const [processando, setProcessando] =
    useState("");
  const [mensagem, setMensagem] =
    useState("");

  async function carregar() {
    setCarregando(true);

    try {
      setSolicitacoes(await listar());
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const pendentes = useMemo(
    () =>
      solicitacoes.filter(
        (item) => item.status === "PENDENTE",
      ),
    [solicitacoes],
  );

  const historico = useMemo(
    () =>
      solicitacoes.filter(
        (item) => item.status !== "PENDENTE",
      ),
    [solicitacoes],
  );

  const exibidas =
    aba === "PENDENTES"
      ? pendentes
      : historico;

  async function decidirSolicitacao(
    id: string,
    decisao:
      | "APROVAR"
      | "RECUSAR",
  ) {
    setProcessando(id);
    setMensagem("");

    try {
      const resposta = await decidir({
        data: {
          solicitacaoId: id,
          decisao,
        },
      });

      setMensagem(resposta.mensagem);

      if (resposta.sucesso) {
        await carregar();
      }
    } finally {
      setProcessando("");
    }
  }

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-medium">
            Solicitações de acesso Premium
          </h2>
        </div>

        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
          O cliente não vê os planos antes da aprovação. Aprovar libera somente o catálogo RD Black; não cria assinatura e não registra pagamento.
        </p>

        <div
          role="tablist"
          aria-label="Solicitações Premium"
          className="mt-5 flex gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={aba === "PENDENTES"}
            onClick={() => setAba("PENDENTES")}
            className={`h-9 rounded-md border px-3 text-sm ${
              aba === "PENDENTES"
                ? "border-gold bg-gold-soft text-gold"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            Solicitações ({pendentes.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={aba === "HISTORICO"}
            onClick={() => setAba("HISTORICO")}
            className={`h-9 rounded-md border px-3 text-sm ${
              aba === "HISTORICO"
                ? "border-gold bg-gold-soft text-gold"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            Histórico
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="border-b border-border px-6 py-3 text-sm text-gold">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">
          Carregando solicitações...
        </div>
      ) : exibidas.length === 0 ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">
          {aba === "PENDENTES"
            ? "Nenhuma solicitação aguardando análise."
            : "Nenhum histórico de acesso Premium ainda."}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {exibidas.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">
                    {item.cliente.nome}
                  </h3>

                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    {statusLabel(item.status)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {item.cliente.email}
                  {item.cliente.telefone
                    ? ` · ${item.cliente.telefone}`
                    : ""}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitado em{" "}
                  {formatarData(item.solicitadoEm)}
                </p>
              </div>

              {item.status === "PENDENTE" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={
                      processando === item.id
                    }
                    onClick={() =>
                      void decidirSolicitacao(
                        item.id,
                        "APROVAR",
                      )
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Liberar catálogo
                  </button>

                  <button
                    type="button"
                    disabled={
                      processando === item.id
                    }
                    onClick={() =>
                      void decidirSolicitacao(
                        item.id,
                        "RECUSAR",
                      )
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              ) : item.status === "APROVADA" ? (
                <div className="flex items-center gap-2 text-xs text-gold">
                  <ShieldCheck className="h-4 w-4" />
                  Catálogo liberado
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Encerrada
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}