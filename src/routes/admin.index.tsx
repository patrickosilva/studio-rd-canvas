import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  Clock,
  CreditCard,
  DollarSign,
  FileBarChart,
  Lock,
  Plus,
  Receipt,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { adminBuscarResumoDashboard } from "@/lib/api/dashboard.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

type StatusAgendamento =
  | "SOLICITADO"
  | "CONFIRMADO"
  | "RECUSADO"
  | "CANCELADO_CLIENTE"
  | "CANCELADO_FUNCIONARIO"
  | "CONCLUIDO"
  | "FALTOU";

type AgendamentoResumo = {
  id: string;
  inicio: Date | string;
  fim: Date | string;
  status: StatusAgendamento;
  valorPagoCentavos?: number | null;
  cliente: {
    nome: string;
    telefone?: string | null;
  };
  servico: {
    nome: string;
    precoCentavos: number;
  };
  profissional: {
    nome: string;
  };
};

type ResumoDashboard = {
  cards: {
    agendamentosHoje: number;
    solicitacoesPendentes: number;
    receitaHoje: number;
    receitaMes: number;
    receitaPrevistaHoje: number;
    assinaturasAtivas: number;
  };
  agendamentosHoje: AgendamentoResumo[];
  proximosAgendamentos: AgendamentoResumo[];
};

function AdminDashboardPage() {
  const buscarResumo = useServerFn(adminBuscarResumoDashboard);

  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarResumo() {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await buscarResumo();

      setResumo(resultado as ResumoDashboard);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar a visão geral.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarResumo();
  }, []);

  const temAgendaHoje = useMemo(() => {
    return Boolean(resumo?.agendamentosHoje.length);
  }, [resumo]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Painel administrativo
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Visão geral
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Acompanhe rapidamente o movimento do dia, pendências,
            receita, assinaturas e próximos atendimentos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/admin/agenda">
              <CalendarClock className="mr-2 h-4 w-4" />
              Ver agenda
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link to="/admin/relatorios">
              <FileBarChart className="mr-2 h-4 w-4" />
              Relatórios
            </Link>
          </Button>
        </div>
      </section>

      {erro && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">
            {erro}
          </CardContent>
        </Card>
      )}

      {carregando && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Carregando visão geral...
          </CardContent>
        </Card>
      )}

      {!carregando && resumo && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Atendimentos hoje
                </CardTitle>
                <Scissors className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {resumo.cards.agendamentosHoje}
                </div>

                <p className="text-xs text-muted-foreground">
                  Solicitações, confirmações e concluídos de hoje.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Solicitações pendentes
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {resumo.cards.solicitacoesPendentes}
                </div>

                <p className="text-xs text-muted-foreground">
                  Agendamentos aguardando confirmação.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita hoje
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatarDinheiro(resumo.cards.receitaHoje)}
                </div>

                <p className="text-xs text-muted-foreground">
                  Atendimentos pagos e assinaturas recebidas hoje.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita do mês
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatarDinheiro(resumo.cards.receitaMes)}
                </div>

                <p className="text-xs text-muted-foreground">
                  Total realizado no mês atual.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Previsto hoje
                </CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatarDinheiro(resumo.cards.receitaPrevistaHoje)}
                </div>

                <p className="text-xs text-muted-foreground">
                  Valor previsto dos atendimentos ainda não concluídos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assinaturas ativas
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {resumo.cards.assinaturasAtivas}
                </div>

                <p className="text-xs text-muted-foreground">
                  Clientes com plano ativo no momento.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Agenda de hoje</CardTitle>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Movimento operacional do dia.
                    </p>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/agenda">
                      Ver completa
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {!temAgendaHoje && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Nenhum atendimento marcado para hoje.
                  </div>
                )}

                {temAgendaHoje && (
                  <div className="space-y-3">
                    {resumo.agendamentosHoje.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {formatarHorario(agendamento.inicio)} -{" "}
                              {formatarHorario(agendamento.fim)}
                            </p>

                            <Badge
                              variant={obterVariantStatus(
                                agendamento.status,
                              )}
                            >
                              {formatarStatus(agendamento.status)}
                            </Badge>
                          </div>

                          <p className="mt-1 text-sm">
                            {agendamento.cliente.nome} ·{" "}
                            {agendamento.servico.nome}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Profissional:{" "}
                            {agendamento.profissional.nome}
                          </p>
                        </div>

                        <div className="text-sm font-medium">
                          {formatarDinheiro(
                            agendamento.valorPagoCentavos ??
                              agendamento.servico.precoCentavos,
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos agendamentos</CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Os próximos horários que precisam de atenção.
                  </p>
                </CardHeader>

                <CardContent>
                  {resumo.proximosAgendamentos.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      Nenhum próximo agendamento encontrado.
                    </div>
                  )}

                  {resumo.proximosAgendamentos.length > 0 && (
                    <div className="space-y-3">
                      {resumo.proximosAgendamentos.map(
                        (agendamento) => (
                          <div
                            key={agendamento.id}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium">
                                  {agendamento.cliente.nome}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {formatarDataHora(
                                    agendamento.inicio,
                                  )}
                                </p>
                              </div>

                              <Badge
                                variant={obterVariantStatus(
                                  agendamento.status,
                                )}
                              >
                                {formatarStatus(agendamento.status)}
                              </Badge>
                            </div>

                            <p className="mt-2 text-sm">
                              {agendamento.servico.nome}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {agendamento.profissional.nome}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atalhos rápidos</CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Ações mais usadas pelo dono.
                  </p>
                </CardHeader>

                <CardContent className="grid gap-2">
                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/admin/agenda">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo agendamento / agenda
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/admin/bloqueios">
                      <Lock className="mr-2 h-4 w-4" />
                      Bloquear horário
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/admin/assinaturas">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Gerenciar assinaturas
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/admin/configuracoes">
                      <Settings className="mr-2 h-4 w-4" />
                      Serviços e profissionais
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="justify-start">
                    <Link to="/admin/clientes">
                      <Users className="mr-2 h-4 w-4" />
                      Clientes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function formatarDinheiro(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

function formatarHorario(valor: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function formatarDataHora(valor: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function formatarStatus(status: StatusAgendamento) {
  const mapa: Record<StatusAgendamento, string> = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado pelo cliente",
    CANCELADO_FUNCIONARIO: "Cancelado pelo funcionário",
    CONCLUIDO: "Concluído",
    FALTOU: "Faltou",
  };

  return mapa[status] ?? status;
}

function obterVariantStatus(status: StatusAgendamento) {
  if (status === "CONCLUIDO") {
    return "default";
  }

  if (status === "CONFIRMADO") {
    return "secondary";
  }

  if (status === "SOLICITADO") {
    return "outline";
  }

  return "destructive";
}