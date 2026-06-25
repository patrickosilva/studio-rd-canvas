import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Scissors,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listarProfissionaisAtivos,
  listarServicosAtivos,
} from "@/lib/api/catalogo.functions";
import {
  listarMeusAgendamentos,
  solicitarAgendamento,
} from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/cliente/agendamentos")({
  beforeLoad: ({ context, location }) => {
    const { usuario } = context;

    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    if (usuario.papel === "FUNCIONARIO") {
      throw redirect({
        to: "/funcionario/solicitacoes",
      });
    }

    if (usuario.papel === "DONO") {
      throw redirect({
        to: "/admin/agenda",
      });
    }

    if (usuario.papel !== "CLIENTE") {
      throw redirect({
        to: "/",
      });
    }
  },

  component: AgendamentosPage,
});

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracaoMinutos: number;
  precoCentavos: number;
};

type Profissional = {
  id: string;
  nome: string;
  descricao: string | null;
};

type Agendamento = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  observacaoCliente: string | null;
  motivoRecusa: string | null;
  servico: {
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  };
  profissional: {
    nome: string;
  };
};

const funcionamentoPorDia: Record<
  number,
  {
    abre: string;
    fecha: string;
  }
> = {
  // 0 = domingo
  // 1 = segunda
  2: {
    abre: "09:30",
    fecha: "19:30",
  },
  3: {
    abre: "09:30",
    fecha: "19:30",
  },
  4: {
    abre: "09:00",
    fecha: "19:30",
  },
  5: {
    abre: "08:00",
    fecha: "21:00",
  },
  6: {
    abre: "08:30",
    fecha: "19:00",
  },
};

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
}

function formatarDataInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(dataInput: string): Date {
  const [ano, mes, dia] = dataInput
    .split("-")
    .map(Number);

  return new Date(ano, mes - 1, dia);
}

function obterNomeDia(dataInput: string): string {
  const data = criarDataLocal(dataInput);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(data);
}

function obterProximosDiasFuncionamento(
  quantidadeDias = 21,
): string[] {
  const dias: string[] = [];
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  for (let indice = 0; indice < quantidadeDias; indice += 1) {
    const data = new Date(hoje);

    data.setDate(hoje.getDate() + indice);

    const diaSemana = data.getDay();

    if (funcionamentoPorDia[diaSemana]) {
      dias.push(formatarDataInput(data));
    }
  }

  return dias;
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

function gerarHorariosDisponiveis(
  dataInput: string,
  duracaoMinutos: number,
): string[] {
  const data = criarDataLocal(dataInput);
  const regra = funcionamentoPorDia[data.getDay()];

  if (!regra) {
    return [];
  }

  const abertura = converterHoraParaMinutos(regra.abre);
  const fechamento = converterHoraParaMinutos(regra.fecha);
  const horarios: string[] = [];

  /*
   * Grade inicial de 30 em 30 minutos.
   * Depois podemos trocar isso por disponibilidade real por funcionário.
   */
  for (
    let horario = abertura;
    horario + duracaoMinutos <= fechamento;
    horario += 30
  ) {
    horarios.push(formatarMinutosComoHora(horario));
  }

  return horarios;
}

function criarInicioIsoLocal(
  dataInput: string,
  horario: string,
): string {
  return `${dataInput}T${horario}`;
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function traduzirStatus(status: string): string {
  const mapa: Record<string, string> = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado por você",
    CANCELADO_FUNCIONARIO: "Cancelado pela equipe",
    CONCLUIDO: "Concluído",
    FALTOU: "Não compareceu",
  };

  return mapa[status] ?? status;
}

function AgendamentosPage() {
  const carregarServicos = useServerFn(listarServicosAtivos);
  const carregarProfissionais = useServerFn(listarProfissionaisAtivos);
  const carregarMeusAgendamentos = useServerFn(
    listarMeusAgendamentos,
  );
  const enviarSolicitacao = useServerFn(solicitarAgendamento);

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>(
    [],
  );
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(
    [],
  );

  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const proximosDias = useMemo(
    () => obterProximosDiasFuncionamento(),
    [],
  );

  const servicoSelecionado = servicos.find(
    (servico) => servico.id === servicoId,
  );

  const horariosDisponiveis = useMemo(() => {
    if (!dataSelecionada || !servicoSelecionado) {
      return [];
    }

    return gerarHorariosDisponiveis(
      dataSelecionada,
      servicoSelecionado.duracaoMinutos,
    );
  }, [dataSelecionada, servicoSelecionado]);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [
        servicosResposta,
        profissionaisResposta,
        agendamentosResposta,
      ] = await Promise.all([
        carregarServicos(),
        carregarProfissionais(),
        carregarMeusAgendamentos(),
      ]);

      setServicos(servicosResposta);
      setProfissionais(profissionaisResposta);
      setAgendamentos(agendamentosResposta);

      if (!servicoId && servicosResposta[0]) {
        setServicoId(servicosResposta[0].id);
      }

      if (!profissionalId && profissionaisResposta[0]) {
        setProfissionalId(profissionaisResposta[0].id);
      }

      if (!dataSelecionada && proximosDias[0]) {
        setDataSelecionada(proximosDias[0]);
      }
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar seus agendamentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  useEffect(() => {
    if (
      horariosDisponiveis.length > 0 &&
      !horariosDisponiveis.includes(horarioSelecionado)
    ) {
      setHorarioSelecionado(horariosDisponiveis[0]);
    }
  }, [horariosDisponiveis, horarioSelecionado]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!servicoId || !profissionalId || !dataSelecionada || !horarioSelecionado) {
      setErro("Escolha serviço, profissional, dia e horário.");
      return;
    }

    setEnviando(true);

    try {
      const resultado = await enviarSolicitacao({
        data: {
          servicoId,
          profissionalId,
          inicio: criarInicioIsoLocal(
            dataSelecionada,
            horarioSelecionado,
          ),
          observacaoCliente: observacao,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      setObservacao("");

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível enviar a solicitação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Agendamentos"
        subtitle="Solicite um horário e acompanhe o status dos seus pedidos."
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft">
              <Calendar className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-lg">
                Solicitar horário
              </h2>

              <p className="text-sm text-muted-foreground">
                Escolha o serviço, profissional, dia e horário.
              </p>
            </div>
          </div>

          {carregando ? (
            <p className="text-sm text-muted-foreground">
              Carregando opções...
            </p>
          ) : servicos.length === 0 || profissionais.length === 0 ? (
            <div className="rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground">
              Ainda é necessário cadastrar ao menos um serviço e um
              profissional ativo nas configurações do admin.
            </div>
          ) : (
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="servico">
                    Serviço
                  </Label>

                  <select
                    id="servico"
                    value={servicoId}
                    onChange={(event) => {
                      setServicoId(event.target.value);
                      setHorarioSelecionado("");
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {servicos.map((servico) => (
                      <option
                        key={servico.id}
                        value={servico.id}
                      >
                        {servico.nome} · {servico.duracaoMinutos} min ·{" "}
                        {formatarMoeda(servico.precoCentavos)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissional">
                    Profissional
                  </Label>

                  <select
                    id="profissional"
                    value={profissionalId}
                    onChange={(event) =>
                      setProfissionalId(event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {profissionais.map((profissional) => (
                      <option
                        key={profissional.id}
                        value={profissional.id}
                      >
                        {profissional.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>
                  Dia
                </Label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {proximosDias.map((dia) => {
                    const ativo = dia === dataSelecionada;

                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => {
                          setDataSelecionada(dia);
                          setHorarioSelecionado("");
                        }}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          ativo
                            ? "border-gold bg-gold-soft text-gold"
                            : "border-border bg-background/40 hover:bg-surface-elevated"
                        }`}
                      >
                        <span className="block font-medium capitalize">
                          {obterNomeDia(dia)}
                        </span>

                        <span className="mt-1 block text-xs text-muted-foreground">
                          {funcionamentoPorDia[criarDataLocal(dia).getDay()].abre}
                          {" às "}
                          {funcionamentoPorDia[criarDataLocal(dia).getDay()].fecha}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>
                  Horário
                </Label>

                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {horariosDisponiveis.map((horario) => {
                    const ativo = horario === horarioSelecionado;

                    return (
                      <button
                        key={horario}
                        type="button"
                        onClick={() => setHorarioSelecionado(horario)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          ativo
                            ? "border-gold bg-gold-soft text-gold"
                            : "border-border bg-background/40 hover:bg-surface-elevated"
                        }`}
                      >
                        {horario}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">
                  Observação para a equipe
                </Label>

                <Input
                  id="observacao"
                  value={observacao}
                  onChange={(event) =>
                    setObservacao(event.target.value)
                  }
                  placeholder="Ex: preferência de corte, atraso previsto, detalhe importante..."
                />
              </div>

              <Button
                type="submit"
                disabled={enviando}
                className="w-full"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {enviando
                  ? "Enviando solicitação..."
                  : "Enviar solicitação"}
              </Button>
            </form>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft">
              <Clock className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-lg">
                Meus pedidos
              </h2>

              <p className="text-sm text-muted-foreground">
                Acompanhe solicitações e confirmações.
              </p>
            </div>
          </div>

          {carregando ? (
            <p className="text-sm text-muted-foreground">
              Carregando pedidos...
            </p>
          ) : agendamentos.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-border bg-background/40 p-6 text-center">
              <Scissors className="h-8 w-8 text-muted-foreground" />

              <h3 className="mt-4 font-medium">
                Nenhum agendamento solicitado
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Quando você enviar uma solicitação, ela aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentos.map((agendamento) => (
                <article
                  key={agendamento.id}
                  className="rounded-xl border border-border bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium">
                        {agendamento.servico.nome}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatarDataHora(agendamento.inicio)}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <UserRound className="h-4 w-4" />
                        {agendamento.profissional.nome}
                      </p>
                    </div>

                    <span className="rounded-full bg-gold-soft px-3 py-1 text-xs text-gold">
                      {traduzirStatus(agendamento.status)}
                    </span>
                  </div>

                  {agendamento.observacaoCliente && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Observação: {agendamento.observacaoCliente}
                    </p>
                  )}

                  {agendamento.motivoRecusa && (
                    <p className="mt-3 text-sm text-destructive">
                      Motivo da recusa: {agendamento.motivoRecusa}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}