import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Scissors,
  UserRound,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  funcionarioCriarAgendamentoParaCliente,
  funcionarioListarDadosParaAgendarCliente,
  listarIndisponibilidadesAgenda,
} from "@/lib/api/agendamento.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute(
  "/funcionario/agendar-cliente",
)({
  component: FuncionarioAgendarClientePage,

  head: () => ({
    meta: [
      {
        title: "Agendar cliente · Funcionário · Studio RD",
      },
    ],
  }),
});

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

type Servico = {
  id: string;
  nome: string;
  duracaoMinutos: number;
  precoCentavos: number;
};

type Profissional = {
  id: string;
  nome: string;
};

type IndisponibilidadeAgenda = {
  id: string;
  tipo: "AGENDAMENTO" | "BLOQUEIO";
  inicio: string | Date;
  fim: string | Date;
  motivo: string | null;
};

const INTERVALO_INICIO_MINUTOS = 10;

const funcionamentoPorDia: Record<
  number,
  {
    abre: string;
    fecha: string;
  }
> = {
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

function normalizarTexto(valor: string | null | undefined): string {
  return (valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function apenasNumeros(valor: string | null | undefined): string {
  return (valor ?? "").replace(/\D/g, "");
}

function formatarContatoCliente(cliente: Cliente): string {
  if (cliente.telefone) {
    return cliente.telefone;
  }

  return cliente.email;
}

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

function criarInicioIsoLocal(
  dataInput: string,
  horario: string,
): string {
  return `${dataInput}T${horario}`;
}

function horarioJaPassou(
  dataInput: string,
  horario: string,
): boolean {
  const inicioHorario = new Date(
    criarInicioIsoLocal(dataInput, horario),
  );

  return inicioHorario.getTime() <= Date.now();
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

  for (
    let horario = abertura;
    horario + duracaoMinutos <= fechamento;
    horario += INTERVALO_INICIO_MINUTOS
  ) {
    const horarioFormatado = formatarMinutosComoHora(horario);

    if (!horarioJaPassou(dataInput, horarioFormatado)) {
      horarios.push(horarioFormatado);
    }
  }

  return horarios;
}

function existeConflitoComIndisponibilidade(
  inicioHorario: Date,
  fimHorario: Date,
  indisponibilidades: IndisponibilidadeAgenda[],
): boolean {
  return indisponibilidades.some((indisponibilidade) => {
    const inicioIndisponivel = new Date(indisponibilidade.inicio);
    const fimIndisponivel = new Date(indisponibilidade.fim);

    return (
      inicioIndisponivel < fimHorario &&
      fimIndisponivel > inicioHorario
    );
  });
}

function ClienteAutocomplete({
  clientes,
  clienteBusca,
  clienteSelecionadoId,
  onAlterarBusca,
  onSelecionarCliente,
}: {
  clientes: Cliente[];
  clienteBusca: string;
  clienteSelecionadoId: string;
  onAlterarBusca: (valor: string) => void;
  onSelecionarCliente: (cliente: Cliente) => void;
}) {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const clienteSelecionado = clientes.find(
    (cliente) => cliente.id === clienteSelecionadoId,
  );

  const clientesFiltrados = useMemo(() => {
    const termoTexto = normalizarTexto(clienteBusca.trim());
    const termoNumeros = apenasNumeros(clienteBusca);

    if (!termoTexto && !termoNumeros) {
      return clientes.slice(0, 8);
    }

    return clientes
      .filter((cliente) => {
        const nome = normalizarTexto(cliente.nome);
        const email = normalizarTexto(cliente.email);
        const telefone = apenasNumeros(cliente.telefone);

        return (
          nome.includes(termoTexto) ||
          email.includes(termoTexto) ||
          Boolean(termoNumeros && telefone.includes(termoNumeros))
        );
      })
      .slice(0, 8);
  }, [clientes, clienteBusca]);

  return (
    <div className="relative space-y-2">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        Cliente
      </label>

      <input
        type="text"
        value={clienteBusca}
        onChange={(event) => {
          onAlterarBusca(event.target.value);
          setMostrarSugestoes(true);
        }}
        onFocus={() => setMostrarSugestoes(true)}
        onBlur={() => {
          window.setTimeout(() => setMostrarSugestoes(false), 150);
        }}
        placeholder="Digite nome, telefone ou e-mail do cliente"
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
      />

      {mostrarSugestoes && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-xl">
          {clientesFiltrados.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelecionarCliente(cliente);
                  setMostrarSugestoes(false);
                }}
                className="w-full rounded-lg px-3 py-3 text-left transition hover:bg-surface-elevated"
              >
                <p className="text-sm font-medium">{cliente.nome}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatarContatoCliente(cliente)}
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {clienteSelecionado && (
        <div className="rounded-xl border border-gold/30 bg-gold-soft px-3 py-2 text-sm text-gold">
          Cliente selecionado:{" "}
          <strong>{clienteSelecionado.nome}</strong>
        </div>
      )}

      {!clienteSelecionadoId && clienteBusca && (
        <p className="text-xs text-muted-foreground">
          Selecione um cliente da lista para continuar.
        </p>
      )}
    </div>
  );
}

function FuncionarioAgendarClientePage() {
  const carregarDados = useServerFn(
    funcionarioListarDadosParaAgendarCliente,
  );

  const criarAgendamento = useServerFn(
    funcionarioCriarAgendamentoParaCliente,
  );

  const buscarIndisponibilidades = useServerFn(
    listarIndisponibilidadesAgenda,
  );

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<
    Profissional[]
  >([]);

  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [indisponibilidades, setIndisponibilidades] = useState<
    IndisponibilidadeAgenda[]
  >([]);
  const [observacaoCliente, setObservacaoCliente] =
    useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function buscarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarDados();

      setClientes(resposta.clientes);
      setServicos(resposta.servicos);
      setProfissionais(resposta.profissionais);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os dados do agendamento.");
    } finally {
      setCarregando(false);
    }
  }

  const proximosDias = useMemo(
    () => obterProximosDiasFuncionamento(),
    [],
  );

  const clienteSelecionado = useMemo(
    () =>
      clientes.find((cliente) => cliente.id === clienteSelecionadoId) ??
      null,
    [clientes, clienteSelecionadoId],
  );

  const servicoSelecionado = useMemo(
    () =>
      servicos.find((servico) => servico.id === servicoId) ??
      null,
    [servicos, servicoId],
  );

  const profissionalSelecionado = useMemo(
    () =>
      profissionais.find(
        (profissional) => profissional.id === profissionalId,
      ) ?? null,
    [profissionais, profissionalId],
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

  const horariosFiltrados = useMemo(() => {
    return horariosDisponiveis.filter((horario) => {
      if (!servicoSelecionado || !dataSelecionada) {
        return false;
      }

      const inicioHorario = new Date(
        criarInicioIsoLocal(dataSelecionada, horario),
      );

      const fimHorario = new Date(
        inicioHorario.getTime() +
          servicoSelecionado.duracaoMinutos * 60 * 1000,
      );

      return !existeConflitoComIndisponibilidade(
        inicioHorario,
        fimHorario,
        indisponibilidades,
      );
    });
  }, [
    horariosDisponiveis,
    servicoSelecionado,
    dataSelecionada,
    indisponibilidades,
  ]);

  const formularioCompleto = Boolean(
    clienteSelecionadoId &&
      servicoId &&
      profissionalId &&
      dataSelecionada &&
      horarioSelecionado,
  );

  async function carregarIndisponibilidades(
    profissionalIdSelecionado: string,
    dataSelecionadaValor: string,
  ) {
    if (!profissionalIdSelecionado || !dataSelecionadaValor) {
      setIndisponibilidades([]);
      return;
    }

    try {
      const resultado = await buscarIndisponibilidades({
        data: {
          profissionalId: profissionalIdSelecionado,
          data: dataSelecionadaValor,
        },
      });

      if (!resultado.sucesso) {
        setIndisponibilidades([]);
        return;
      }

      setIndisponibilidades(resultado.intervalos);
    } catch (error) {
      console.error(error);
      setIndisponibilidades([]);
    }
  }

  useEffect(() => {
    void buscarDados();
  }, []);

  useEffect(() => {
    if (!dataSelecionada && proximosDias[0]) {
      setDataSelecionada(proximosDias[0]);
    }
  }, [dataSelecionada, proximosDias]);

  useEffect(() => {
    void carregarIndisponibilidades(
      profissionalId,
      dataSelecionada,
    );
  }, [profissionalId, dataSelecionada]);

  useEffect(() => {
    if (
      horariosFiltrados.length > 0 &&
      !horariosFiltrados.includes(horarioSelecionado)
    ) {
      setHorarioSelecionado(horariosFiltrados[0]);
    }

    if (horariosFiltrados.length === 0) {
      setHorarioSelecionado("");
    }
  }, [horariosFiltrados, horarioSelecionado]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (
      !clienteSelecionadoId ||
      !servicoId ||
      !profissionalId ||
      !dataSelecionada ||
      !horarioSelecionado
    ) {
      setErro("Escolha cliente, serviço, profissional, dia e horário.");
      return;
    }

    setSalvando(true);

    try {
      const resultado = await criarAgendamento({
        data: {
          clienteId: clienteSelecionadoId,
          servicoId,
          profissionalId,
          inicio: criarInicioIsoLocal(
            dataSelecionada,
            horarioSelecionado,
          ),
          observacaoCliente,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      setClienteBusca("");
      setClienteSelecionadoId("");
      setServicoId("");
      setProfissionalId("");
      setHorarioSelecionado("");
      setIndisponibilidades([]);
      setObservacaoCliente("");
    } catch (error) {
      console.error(error);
      setErro("Não foi possível criar o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="space-y-3">
          <Badge className="border-gold/40 bg-gold-soft text-gold">
            Operação da equipe
          </Badge>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Agendar cliente
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Use quando o cliente pedir um horário pelo WhatsApp,
                telefone ou presencialmente. O agendamento já entra
                confirmado.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void buscarDados()}
              disabled={carregando}
              className="h-11 w-full rounded-xl sm:w-auto"
            >
              {carregando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Atualizar
            </Button>
          </div>
        </header>

        {erro && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {mensagem}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <Card className="overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarPlus className="h-5 w-5 text-gold" />
                Novo agendamento
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {carregando ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />

                  <p className="text-sm text-muted-foreground">
                    Carregando clientes, serviços e profissionais...
                  </p>
                </div>
              ) : (
                <form
                  className="space-y-5"
                  onSubmit={(event) => void handleSubmit(event)}
                >
                  <EtapaFormulario
                    numero="1"
                    titulo="Escolha o cliente"
                    descricao="Selecione para quem o horário será marcado."
                  >
                    <ClienteAutocomplete
                      clientes={clientes}
                      clienteBusca={clienteBusca}
                      clienteSelecionadoId={clienteSelecionadoId}
                      onAlterarBusca={(valor) => {
                        setClienteBusca(valor);
                        setClienteSelecionadoId("");
                      }}
                      onSelecionarCliente={(cliente) => {
                        setClienteSelecionadoId(cliente.id);
                        setClienteBusca(
                          `${cliente.nome} — ${formatarContatoCliente(cliente)}`,
                        );
                      }}
                    />
                  </EtapaFormulario>

                  <EtapaFormulario
                    numero="2"
                    titulo="Escolha o serviço"
                    descricao="A duração cadastrada define quanto tempo o agendamento ocupa."
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="servicoId">Serviço</Label>

                      <select
                        id="servicoId"
                        value={servicoId}
                        onChange={(event) => {
                          setServicoId(event.target.value);
                          setHorarioSelecionado("");
                        }}
                        className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                        required
                      >
                        <option value="">Selecione um serviço</option>

                        {servicos.map((servico) => (
                          <option
                            key={servico.id}
                            value={servico.id}
                          >
                            {servico.nome} —{" "}
                            {formatarDinheiro(
                              servico.precoCentavos,
                            )}{" "}
                            — {servico.duracaoMinutos} min
                          </option>
                        ))}
                      </select>
                    </div>
                  </EtapaFormulario>

                  <EtapaFormulario
                    numero="3"
                    titulo="Escolha o profissional"
                    descricao="A disponibilidade é calculada para o profissional selecionado."
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="profissionalId">
                        Profissional
                      </Label>

                      <select
                        id="profissionalId"
                        value={profissionalId}
                        onChange={(event) => {
                          setProfissionalId(event.target.value);
                          setHorarioSelecionado("");
                        }}
                        className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                        required
                      >
                        <option value="">
                          Selecione um profissional
                        </option>

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
                  </EtapaFormulario>

                  <EtapaFormulario
                    numero="4"
                    titulo="Data e horário"
                    descricao="Escolha um dia e um horário em que o serviço caiba inteiro."
                  >
                    <div className="space-y-5">
                      <div>
                        <Label>Dia</Label>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {proximosDias.map((dia) => {
                            const ativo = dia === dataSelecionada;
                            const regra =
                              funcionamentoPorDia[
                                criarDataLocal(dia).getDay()
                              ];

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
                                  {regra.abre} às {regra.fecha}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label>Horário</Label>

                        {horariosFiltrados.length === 0 ? (
                          <div className="mt-3 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                            Nenhum horário disponível para este dia,
                            profissional e serviço.
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                            {horariosFiltrados.map((horario) => {
                              const ativo =
                                horario === horarioSelecionado;

                              return (
                                <button
                                  key={horario}
                                  type="button"
                                  onClick={() =>
                                    setHorarioSelecionado(horario)
                                  }
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
                        )}
                      </div>
                    </div>
                  </EtapaFormulario>

                  <EtapaFormulario
                    numero="5"
                    titulo="Observação"
                    descricao="Campo opcional para registrar origem ou detalhe do pedido."
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="observacaoCliente">
                        Observação opcional
                      </Label>

                      <textarea
                        id="observacaoCliente"
                        value={observacaoCliente}
                        onChange={(event) =>
                          setObservacaoCliente(
                            event.target.value,
                          )
                        }
                        placeholder="Ex: agendamento feito pelo WhatsApp."
                        className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-gold"
                      />
                    </div>
                  </EtapaFormulario>

                  <div className="sticky bottom-3 z-20 rounded-2xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                    <Button
                      type="submit"
                      disabled={salvando || !formularioCompleto}
                      className="h-12 w-full rounded-xl text-sm font-semibold"
                    >
                      {salvando ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando agendamento...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Criar agendamento confirmado
                        </>
                      )}
                    </Button>

                    {!formularioCompleto && (
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Preencha cliente, serviço, profissional, dia e
                        horário para liberar o botão.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <ResumoLinha
                  icon={UserRound}
                  titulo="Cliente"
                  texto={
                    clienteSelecionado
                      ? `${clienteSelecionado.nome} — ${clienteSelecionado.email}`
                      : "Nenhum cliente selecionado."
                  }
                />

                <ResumoLinha
                  icon={Scissors}
                  titulo="Serviço"
                  texto={
                    servicoSelecionado
                      ? `${servicoSelecionado.nome} — ${formatarDinheiro(
                          servicoSelecionado.precoCentavos,
                        )}`
                      : "Nenhum serviço selecionado."
                  }
                />

                <ResumoLinha
                  icon={UserRound}
                  titulo="Profissional"
                  texto={
                    profissionalSelecionado
                      ? profissionalSelecionado.nome
                      : "Nenhum profissional selecionado."
                  }
                />

                <ResumoLinha
                  icon={Clock}
                  titulo="Duração"
                  texto={
                    servicoSelecionado
                      ? `${servicoSelecionado.duracaoMinutos} minutos`
                      : "Selecione um serviço para ver a duração."
                  }
                />

                <ResumoLinha
                  icon={Clock}
                  titulo="Horário"
                  texto={
                    dataSelecionada && horarioSelecionado
                      ? `${obterNomeDia(dataSelecionada)} às ${horarioSelecionado}`
                      : "Nenhum horário selecionado."
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Regra desta tela
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  O agendamento criado pela equipe entra direto como
                  confirmado.
                </p>

                <p>
                  Os horários de início aparecem de 10 em 10 minutos,
                  mas o tempo ocupado respeita a duração real do
                  serviço escolhido.
                </p>

                <p>
                  O sistema bloqueia horário passado, conflito de
                  profissional, conflito do cliente e bloqueios de
                  agenda.
                </p>

                <p>
                  Depois do atendimento, a equipe conclui normalmente
                  na tela de solicitações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function EtapaFormulario({
  numero,
  titulo,
  descricao,
  children,
}: {
  numero: string;
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-4">
      <div className="mb-4 flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-semibold text-gold">
          {numero}
        </span>

        <div>
          <h2 className="text-sm font-semibold">{titulo}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {descricao}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function ResumoLinha({
  icon: Icon,
  titulo,
  texto,
}: {
  icon: typeof UserRound;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

      <div className="min-w-0">
        <p className="font-medium">{titulo}</p>
        <p className="break-words text-muted-foreground">{texto}</p>
      </div>
    </div>
  );
}

function formatarDinheiro(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}
