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
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  funcionarioCriarAgendamentoParaCliente,
  funcionarioListarDadosParaAgendarCliente,
} from "@/lib/api/agendamento.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function FuncionarioAgendarClientePage() {
  const carregarDados = useServerFn(
    funcionarioListarDadosParaAgendarCliente,
  );

  const criarAgendamento = useServerFn(
    funcionarioCriarAgendamentoParaCliente,
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
  const [inicio, setInicio] = useState("");
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

  useEffect(() => {
    void buscarDados();
  }, []);

  const clienteSelecionado = useMemo(
    () =>
      clientes.find((cliente) => cliente.id === clienteSelecionadoId) ??
      null,
    [clientes, clienteSelecionadoId]
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

  const formularioCompleto =
    clienteSelecionadoId && servicoId && profissionalId && inicio;

  async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setMensagem("");
  setErro("");

  if (!clienteSelecionadoId) {
    setErro("Digite e selecione um cliente da lista.");
    return;
  }

  setSalvando(true);

  try {
    const resultado = await criarAgendamento({
      data: {
        clienteId: clienteSelecionadoId,
        servicoId,
        profissionalId,
        inicio,
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
    setInicio("");
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
                        setClienteBusca(`${cliente.nome} — ${formatarContatoCliente(cliente)}`);
                      }}
                    />
                  </EtapaFormulario>

                  <EtapaFormulario
                    numero="2"
                    titulo="Escolha o serviço"
                    descricao="O tempo do serviço define o fim automático do horário."
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="servicoId">Serviço</Label>

                      <select
                        id="servicoId"
                        value={servicoId}
                        onChange={(event) =>
                          setServicoId(event.target.value)
                        }
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
                    descricao="O sistema impede conflito de horário para o profissional."
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="profissionalId">
                        Profissional
                      </Label>

                      <select
                        id="profissionalId"
                        value={profissionalId}
                        onChange={(event) =>
                          setProfissionalId(event.target.value)
                        }
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
                    descricao="Escolha um horário futuro disponível."
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="inicio">Data e horário</Label>

                      <Input
                        id="inicio"
                        type="datetime-local"
                        value={inicio}
                        onChange={(event) =>
                          setInicio(event.target.value)
                        }
                        className="h-12 rounded-xl"
                        required
                      />
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
                        Preencha cliente, serviço, profissional e
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
  children: React.ReactNode;
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