import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Scissors,
  Trash2,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listarProfissionaisAtivos } from "@/lib/api/catalogo.functions";
import {
  criarBloqueioAgenda,
  listarBloqueiosAgenda,
  removerBloqueioAgenda,
} from "@/lib/api/bloqueio-agenda.functions";

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

type EtapaBloqueio = "inicio" | "fim" | "motivo";

const INTERVALO_BLOQUEIO_MINUTOS = 5;

const funcionamentoPorDia: Record<
  number,
  {
    abre: string;
    fecha: string;
  }
> = {
  2: { abre: "09:30", fecha: "19:30" },
  3: { abre: "09:30", fecha: "19:30" },
  4: { abre: "09:00", fecha: "19:30" },
  5: { abre: "08:00", fecha: "21:00" },
  6: { abre: "08:30", fecha: "19:00" },
};

function formatarDataInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(dataInput: string): Date {
  const [ano, mes, dia] = dataInput.split("-").map(Number);

  return new Date(ano, mes - 1, dia);
}

function obterProximoDiaComFuncionamento(): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (let indice = 0; indice < 14; indice += 1) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + indice);

    if (funcionamentoPorDia[data.getDay()]) {
      return formatarDataInput(data);
    }
  }

  return formatarDataInput(hoje);
}

function converterHoraParaMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);

  return horas * 60 + minutos;
}

function formatarMinutosComoHora(totalMinutos: number): string {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function gerarHorariosInicio(dataInput: string): string[] {
  if (!dataInput) {
    return [];
  }

  const regra = funcionamentoPorDia[criarDataLocal(dataInput).getDay()];

  if (!regra) {
    return [];
  }

  const abertura = converterHoraParaMinutos(regra.abre);
  const fechamento = converterHoraParaMinutos(regra.fecha);
  const horarios: string[] = [];

  for (
    let horario = abertura;
    horario < fechamento;
    horario += INTERVALO_BLOQUEIO_MINUTOS
  ) {
    horarios.push(formatarMinutosComoHora(horario));
  }

  return horarios;
}

function gerarHorariosFim(
  dataInput: string,
  horarioInicio: string,
): string[] {
  if (!dataInput || !horarioInicio) {
    return [];
  }

  const regra = funcionamentoPorDia[criarDataLocal(dataInput).getDay()];

  if (!regra) {
    return [];
  }

  const inicio =
    converterHoraParaMinutos(horarioInicio) +
    INTERVALO_BLOQUEIO_MINUTOS;
  const fechamento = converterHoraParaMinutos(regra.fecha);
  const horarios: string[] = [];

  for (
    let horario = inicio;
    horario <= fechamento;
    horario += INTERVALO_BLOQUEIO_MINUTOS
  ) {
    horarios.push(formatarMinutosComoHora(horario));
  }

  return horarios;
}

function criarDataHoraLocal(
  dataInput: string,
  horario: string,
): string {
  return `${dataInput}T${horario}`;
}

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

function formatarDataSelecionada(dataInput: string): string {
  if (!dataInput) {
    return "Nenhuma data selecionada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(criarDataLocal(dataInput));
}

function IndicadorEtapa({
  numero,
  titulo,
  ativo,
  concluido,
}: {
  numero: string;
  titulo: string;
  ativo: boolean;
  concluido: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 transition ${
        ativo
          ? "border-gold bg-gold-soft text-gold"
          : concluido
            ? "border-gold/30 bg-gold-soft/40 text-foreground"
            : "border-border bg-background/40 text-muted-foreground"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest">
        Etapa {numero}
      </span>
      <p className="mt-1 text-sm font-medium">{titulo}</p>
    </div>
  );
}

export function BloqueiosAgendaPage() {
  const buscarBloqueios = useServerFn(listarBloqueiosAgenda);
  const buscarProfissionais = useServerFn(listarProfissionaisAtivos);
  const criarBloqueio = useServerFn(criarBloqueioAgenda);
  const removerBloqueio = useServerFn(removerBloqueioAgenda);

  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [etapa, setEtapa] = useState<EtapaBloqueio>("inicio");
  const [profissionalId, setProfissionalId] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
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

  function limparFormulario() {
    setEtapa("inicio");
    setProfissionalId("");
    setDataSelecionada("");
    setHorarioInicio("");
    setHorarioFim("");
    setMotivo("");
  }

  function abrirNovoBloqueio() {
    setErro("");
    setMensagem("");
    setEtapa("inicio");
    setProfissionalId("");
    setDataSelecionada(obterProximoDiaComFuncionamento());
    setHorarioInicio("");
    setHorarioFim("");
    setMotivo("");
    setDialogAberto(true);
  }

  function alterarData(valor: string) {
    setDataSelecionada(valor);
    setHorarioInicio("");
    setHorarioFim("");
    setEtapa("inicio");
  }

  async function handleCriarBloqueio() {
    setMensagem("");
    setErro("");

    if (!dataSelecionada || !horarioInicio || !horarioFim) {
      setErro("Escolha a data, o horário de início e o horário de término.");
      return;
    }

    setSalvando(true);

    try {
      const resultado = await criarBloqueio({
        data: {
          profissionalId,
          inicio: criarDataHoraLocal(
            dataSelecionada,
            horarioInicio,
          ),
          fim: criarDataHoraLocal(
            dataSelecionada,
            horarioFim,
          ),
          motivo,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      setDialogAberto(false);
      limparFormulario();

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

  const horariosInicio = useMemo(
    () => gerarHorariosInicio(dataSelecionada),
    [dataSelecionada],
  );

  const horariosFim = useMemo(
    () => gerarHorariosFim(dataSelecionada, horarioInicio),
    [dataSelecionada, horarioInicio],
  );

  const profissionalSelecionado = useMemo(
    () =>
      profissionais.find(
        (profissional) => profissional.id === profissionalId,
      ) ?? null,
    [profissionais, profissionalId],
  );

  const regraDiaSelecionado = dataSelecionada
    ? funcionamentoPorDia[criarDataLocal(dataSelecionada).getDay()]
    : null;

  return (
    <div className="max-w-7xl p-4 sm:p-6 lg:p-12">
      <PageHeader
        title="Bloqueios de agenda"
        subtitle="Bloqueie horários gerais da barbearia ou horários específicos de profissionais."
      />

      {erro && !dialogAberto && (
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

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">
            Organize a agenda sem preencher horários manualmente
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
            Escolha início e término pela mesma grade visual da agenda, em intervalos de 5 minutos.
          </p>
        </div>

        <Button
          type="button"
          onClick={abrirNovoBloqueio}
          className="h-11 shrink-0 rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar bloqueio
        </Button>
      </div>

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

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-medium">Bloqueios ativos</h2>
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
              Quando houver um horário bloqueado, ele aparecerá nesta lista.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {bloqueios.map((bloqueio) => {
              const removendo = removendoId === bloqueio.id;

              return (
                <article
                  key={bloqueio.id}
                  className="px-5 py-5 sm:px-6"
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

      <Dialog
        open={dialogAberto}
        onOpenChange={(aberto) => {
          setDialogAberto(aberto);

          if (!aberto && !salvando) {
            limparFormulario();
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarX2 className="h-5 w-5 text-gold" />
              Adicionar bloqueio
            </DialogTitle>
            <DialogDescription>
              Defina para quem vale o bloqueio e escolha início e fim pela grade de 5 minutos.
            </DialogDescription>
          </DialogHeader>

          {erro && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {erro}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="bloqueio-profissional"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Aplicar a
              </label>

              <select
                id="bloqueio-profissional"
                value={profissionalId}
                onChange={(event) =>
                  setProfissionalId(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
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
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bloqueio-data"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Data
              </label>

              <input
                id="bloqueio-data"
                type="date"
                value={dataSelecionada}
                onChange={(event) =>
                  alterarData(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <IndicadorEtapa
              numero="1"
              titulo="Início"
              ativo={etapa === "inicio"}
              concluido={Boolean(horarioInicio)}
            />
            <IndicadorEtapa
              numero="2"
              titulo="Término"
              ativo={etapa === "fim"}
              concluido={Boolean(horarioFim)}
            />
            <IndicadorEtapa
              numero="3"
              titulo="Motivo"
              ativo={etapa === "motivo"}
              concluido={false}
            />
          </div>

          {!regraDiaSelecionado ? (
            <div className="rounded-2xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-medium text-foreground">
                    A barbearia não possui expediente neste dia.
                  </p>
                  <p className="mt-1">
                    Escolha uma data de terça a sábado para definir o bloqueio operacional.
                  </p>
                </div>
              </div>
            </div>
          ) : etapa === "inicio" ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Que horas o bloqueio começa?
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatarDataSelecionada(dataSelecionada)} · expediente de{" "}
                  {regraDiaSelecionado.abre} às {regraDiaSelecionado.fecha}
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto pr-1">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {horariosInicio.map((horario) => (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => {
                        setHorarioInicio(horario);
                        setHorarioFim("");
                        setEtapa("fim");
                      }}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        horario === horarioInicio
                          ? "border-gold bg-gold-soft text-gold"
                          : "border-border bg-background/40 hover:bg-surface-elevated"
                      }`}
                    >
                      {horario}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : etapa === "fim" ? (
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Que horas o bloqueio termina?
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Início selecionado:{" "}
                    <strong className="text-foreground">
                      {horarioInicio}
                    </strong>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEtapa("inicio")}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Voltar
                </Button>
              </div>

              <div className="max-h-72 overflow-y-auto pr-1">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {horariosFim.map((horario) => (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => {
                        setHorarioFim(horario);
                        setEtapa("motivo");
                      }}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        horario === horarioFim
                          ? "border-gold bg-gold-soft text-gold"
                          : "border-border bg-background/40 hover:bg-surface-elevated"
                      }`}
                    >
                      {horario}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    Qual o motivo do bloqueio?
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    O motivo é opcional e fica registrado para a equipe.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEtapa("fim")}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Voltar
                </Button>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-gold-soft/50 p-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Período
                    </p>
                    <p className="mt-1 font-medium">
                      {horarioInicio} → {horarioFim}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Aplicação
                    </p>
                    <p className="mt-1 font-medium">
                      {profissionalSelecionado
                        ? profissionalSelecionado.nome
                        : "Toda a barbearia"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs capitalize text-muted-foreground">
                  {formatarDataSelecionada(dataSelecionada)}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bloqueio-motivo"
                  className="text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Motivo
                </label>

                <textarea
                  id="bloqueio-motivo"
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  maxLength={300}
                  placeholder="Ex.: almoço, manutenção, folga, evento interno..."
                  className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-gold"
                />

                <p className="text-right text-[11px] text-muted-foreground">
                  {motivo.length}/300
                </p>
              </div>

              <Button
                type="button"
                disabled={salvando || !horarioInicio || !horarioFim}
                onClick={() => void handleCriarBloqueio()}
                className="h-12 w-full rounded-xl text-sm font-semibold"
              >
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando bloqueio...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar bloqueio
                  </>
                )}
              </Button>
            </section>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
