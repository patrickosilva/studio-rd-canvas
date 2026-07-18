import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  CreditCard,
  Mail,
  Phone,
  RefreshCw,
  Scissors,
  Search,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { adminListarClientesResumo } from "@/lib/api/clientes.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/clientes")({
  component: AdminClientesPage,
});

type StatusAgendamento =
  | "SOLICITADO"
  | "CONFIRMADO"
  | "RECUSADO"
  | "CANCELADO_CLIENTE"
  | "CANCELADO_FUNCIONARIO"
  | "CONCLUIDO"
  | "FALTOU";

type ClienteResumo = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  criadoEm: Date | string;
  totalAgendamentos: number;
  totalConcluidos: number;
  totalGastoCentavos: number;
  ultimoAgendamento: {
    id: string;
    inicio: Date | string;
    status: StatusAgendamento;
    servico: {
      nome: string;
      precoCentavos: number;
    };
  } | null;
  assinaturaAtiva: {
    id: string;
    status: string;
    vigenciaFim: Date | string;
    saldoCortes: number;
    planoNome: string;
  } | null;
};

function AdminClientesPage() {
  const listarClientes = useServerFn(adminListarClientesResumo);

  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarClientes() {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await listarClientes();

      setClientes(resultado as ClienteResumo[]);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar os clientes.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      const texto = [
        cliente.nome,
        cliente.email,
        cliente.telefone ?? "",
        cliente.assinaturaAtiva?.planoNome ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [clientes, busca]);

  const resumo = useMemo(() => {
    const clientesComAssinatura = clientes.filter(
      (cliente) => cliente.assinaturaAtiva,
    ).length;

    const totalAgendamentos = clientes.reduce(
      (total, cliente) => total + cliente.totalAgendamentos,
      0,
    );

    const totalGasto = clientes.reduce(
      (total, cliente) => total + cliente.totalGastoCentavos,
      0,
    );

    return {
      totalClientes: clientes.length,
      clientesComAssinatura,
      totalAgendamentos,
      totalGasto,
    };
  }, [clientes]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Administração
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Clientes
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Consulte os clientes cadastrados, histórico de
            agendamentos, consumo e situação de assinatura.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void carregarClientes()}
            disabled={carregando}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>

          <Button asChild>
            <Link to="/admin/assinaturas">
              <CreditCard className="mr-2 h-4 w-4" />
              Assinaturas
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes cadastrados
            </CardTitle>

            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.totalClientes}
            </div>

            <p className="text-xs text-muted-foreground">
              Total de usuários com perfil de cliente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Com assinatura
            </CardTitle>

            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.clientesComAssinatura}
            </div>

            <p className="text-xs text-muted-foreground">
              Clientes com assinatura ativa.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos
            </CardTitle>

            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.totalAgendamentos}
            </div>

            <p className="text-xs text-muted-foreground">
              Soma dos agendamentos dos clientes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consumo total
            </CardTitle>

            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatarDinheiro(resumo.totalGasto)}
            </div>

            <p className="text-xs text-muted-foreground">
              Receita já concluída por esses clientes.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Lista de clientes</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Busque por nome, e-mail, telefone ou plano ativo.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar cliente..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {carregando && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Carregando clientes...
            </div>
          )}

          {!carregando && clientesFiltrados.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          )}

          {!carregando && clientesFiltrados.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />

                        <h3 className="font-semibold">
                          {cliente.nome}
                        </h3>

                        {cliente.assinaturaAtiva ? (
                          <Badge>Assinante</Badge>
                        ) : (
                          <Badge variant="outline">
                            Sem assinatura
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {cliente.email}
                        </p>

                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {cliente.telefone || "Telefone não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs text-muted-foreground">
                        Cliente desde
                      </p>

                      <p className="text-sm font-medium">
                        {formatarData(cliente.criadoEm)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Agendamentos
                      </p>

                      <p className="text-lg font-semibold">
                        {cliente.totalAgendamentos}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Concluídos
                      </p>

                      <p className="text-lg font-semibold">
                        {cliente.totalConcluidos}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Total gasto
                      </p>

                      <p className="text-lg font-semibold">
                        {formatarDinheiro(
                          cliente.totalGastoCentavos,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <CalendarClock className="h-4 w-4" />
                        Último agendamento
                      </p>

                      {cliente.ultimoAgendamento ? (
                        <div className="mt-2">
                          <p className="text-sm font-medium">
                            {cliente.ultimoAgendamento.servico.nome}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {formatarDataHora(
                              cliente.ultimoAgendamento.inicio,
                            )}{" "}
                            ·{" "}
                            {formatarStatus(
                              cliente.ultimoAgendamento.status,
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Nenhum agendamento ainda.
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        Assinatura
                      </p>

                      {cliente.assinaturaAtiva ? (
                        <div className="mt-2">
                          <p className="text-sm font-medium">
                            {cliente.assinaturaAtiva.planoNome}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {cliente.assinaturaAtiva.saldoCortes} cortes
                            disponíveis · vence em{" "}
                            {formatarData(
                              cliente.assinaturaAtiva.vigenciaFim,
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Cliente sem assinatura ativa.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatarDinheiro(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

function formatarData(valor: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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