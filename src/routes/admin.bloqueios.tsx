import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarX2,
  Clock,
  Plus,
  Scissors,
  Trash2,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { listarProfissionaisAtivos } from "@/lib/api/catalogo.functions";
import {
  criarBloqueioAgenda,
  listarBloqueiosAgenda,
  removerBloqueioAgenda,
} from "@/lib/api/bloqueio-agenda.functions";

export const Route = createFileRoute("/admin/bloqueios")({
  component: AdminBloqueiosPage,
});

type Profissional = {
  id: string;
  nome: string;
};

type BloqueioAgenda = {
  id: string;
  profissionalId: string | null;
  inicio: string | Date;
  fim: string | Date;
  motivo: string | null;
  ativo: boolean;
  criadoEm?: string | Date;
  atualizadoEm?: string | Date;

  profissional: {
    id: string;
    nome: string;
  } | null;
};

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function AdminBloqueiosPage() {
  const buscarBloqueios = useServerFn(listarBloqueiosAgenda);
  const buscarProfissionais = useServerFn(listarProfissionaisAtivos);
  const criarBloqueio = useServerFn(criarBloqueioAgenda);
  const removerBloqueio = useServerFn(removerBloqueioAgenda);

  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>(
    [],
  );

  const [profissionalId, setProfissionalId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [motivo, setMotivo] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [removendoId, setRemovendoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [bloqueiosResposta, profissionaisResposta] =
        await Promise.all([
          buscarBloqueios(),
          buscarProfissionais(),
        ]);

      setBloqueios(bloqueiosResposta);
      setProfissionais(profissionaisResposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar os bloqueios.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  async function handleCriarBloqueio(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      const resultado = await criarBloqueio({
        data: {
          profissionalId,
          inicio,
          fim,
          motivo,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      setProfissionalId("");
      setInicio("");
      setFim("");
      setMotivo("");

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível criar o bloqueio.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverBloqueio(bloqueioId: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja remover este bloqueio?",
    );

    if (!confirmar) {
      return;
    }

    setMensagem("");
    setErro("");
    setRemovendoId(bloqueioId);

    try {
      const resultado = await removerBloqueio({
        data: {
          bloqueioId,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível remover o bloqueio.");
    } finally {
      setRemovendoId("");
    }
  }

  const resumo = useMemo(() => {
    const gerais = bloqueios.filter(
      (bloqueio) => !bloqueio.profissionalId,
    );

    const porProfissional = bloqueios.filter(
      (bloqueio) => bloqueio.profissionalId,
    );

    return {
      total: bloqueios.length,
      gerais: gerais.length,
      porProfissional: porProfissional.length,
    };
  }, [bloqueios]);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Bloqueios de agenda"
        subtitle="Bloqueie horários gerais ou horários específicos de profissionais."
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {mensagem}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Total
            </span>

            <CalendarX2 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.total}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            bloqueios ativos
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Gerais
            </span>

            <Clock className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.gerais}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            bloqueiam toda a barbearia
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Profissionais
            </span>

            <UserRound className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.porProfissional}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            bloqueios individuais
          </p>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <Plus className="h-5 w-5 text-gold" />

            <div>
              <h2 className="text-sm font-medium">
                Novo bloqueio
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Use para folgas, pausas, feriados ou compromissos internos.
              </p>
            </div>
          </div>

          <form
            onSubmit={(event) =>
              void handleCriarBloqueio(event)
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Tipo de bloqueio
              </label>

              <select
                value={profissionalId}
                onChange={(event) =>
                  setProfissionalId(event.target.value)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  Bloqueio geral da barbearia
                </option>

                {profissionais.map((profissional) => (
                  <option
                    key={profissional.id}
                    value={profissional.id}
                  >
                    Somente {profissional.nome}
                  </option>
                ))}
              </select>

              <p className="text-xs text-muted-foreground">
                Bloqueio geral impede qualquer profissional de receber
                agendamento no período.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Início
                </label>

                <input
                  type="datetime-local"
                  value={inicio}
                  onChange={(event) =>
                    setInicio(event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Fim
                </label>

                <input
                  type="datetime-local"
                  value={fim}
                  onChange={(event) => setFim(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Motivo
              </label>

              <textarea
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Ex.: almoço, manutenção, folga, evento interno..."
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={salvando}
              className="w-full"
            >
              <CalendarX2 className="mr-2 h-4 w-4" />
              {salvando ? "Criando..." : "Criar bloqueio"}
            </Button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Bloqueios ativos
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Apenas bloqueios ativos aparecem aqui.
              </p>
            </div>

            <CalendarX2 className="h-4 w-4 text-gold" />
          </div>

          {carregando ? (
            <div className="px-6 py-10">
              <p className="text-sm text-muted-foreground">
                Carregando bloqueios...
              </p>
            </div>
          ) : bloqueios.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
              <CalendarX2 className="h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-display">
                Nenhum bloqueio ativo
              </h3>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Quando houver um horário bloqueado, ele aparecerá
                nesta lista.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bloqueios.map((bloqueio) => {
                const removendo = removendoId === bloqueio.id;

                return (
                  <article
                    key={bloqueio.id}
                    className="px-6 py-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-medium">
                            {bloqueio.profissional
                              ? bloqueio.profissional.nome
                              : "Bloqueio geral"}
                          </h3>

                          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            {bloqueio.profissional
                              ? "Profissional"
                              : "Geral"}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gold" />
                            Início: {formatarDataHora(bloqueio.inicio)}
                          </p>

                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gold" />
                            Fim: {formatarDataHora(bloqueio.fim)}
                          </p>
                        </div>

                        {bloqueio.motivo && (
                          <p className="mt-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                            Motivo: {bloqueio.motivo}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={removendo}
                        onClick={() =>
                          void handleRemoverBloqueio(bloqueio.id)
                        }
                        className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {removendo ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <Scissors className="h-5 w-5 text-gold" />

          <div>
            <h2 className="text-sm font-medium">
              Como o bloqueio funciona
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Bloqueios gerais impedem qualquer agendamento no período.
              Bloqueios por profissional impedem apenas aquele profissional
              de receber agendamentos naquele intervalo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}