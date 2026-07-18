import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  Crown,
  Gift,
  RefreshCw,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import { clienteBuscarFidelidade } from "@/lib/api/fidelidade.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/cliente/fidelidade")({
  component: ClienteFidelidadePage,
});

type EventoFidelidade = {
  id: string;
  tipo: "ATENDIMENTO" | "ASSINATURA";
  titulo: string;
  descricao: string;
  data: Date | string;
  valorCentavos: number;
  pontos: number;
};

type RecompensaFidelidade = {
  id: string;
  nome: string;
  pontosNecessarios: number;
  descricao: string;
  disponivel: boolean;
};

type FidelidadeResumo = {
  pontosTotais: number;
  pontosParaProximaRecompensa: number;
  progresso: number;
  proximaRecompensa: {
    id: string;
    nome: string;
    pontosNecessarios: number;
    descricao: string;
  } | null;
  recompensas: RecompensaFidelidade[];
  eventos: EventoFidelidade[];
};

function ClienteFidelidadePage() {
  const buscarFidelidade = useServerFn(clienteBuscarFidelidade);

  const [resumo, setResumo] = useState<FidelidadeResumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarFidelidade() {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await buscarFidelidade();

      setResumo(resultado as FidelidadeResumo);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar sua fidelidade.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarFidelidade();
  }, []);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Cliente Studio RD
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Fidelidade
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Seus pontos são calculados com base nos atendimentos
            concluídos e pagamentos de assinatura. Cada R$ 1,00 gasto
            gera 1 ponto.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void carregarFidelidade()}
          disabled={carregando}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
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
            Carregando fidelidade...
          </CardContent>
        </Card>
      )}

      {!carregando && resumo && (
        <>
          <Card className="border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card">
            <CardContent className="pt-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                    Seu saldo
                  </p>

                  <div className="mt-4 flex items-end gap-3">
                    <span className="text-5xl font-bold">
                      {resumo.pontosTotais.toLocaleString("pt-BR")}
                    </span>

                    <span className="mb-2 text-sm text-muted-foreground">
                      pontos
                    </span>
                  </div>

                  {resumo.proximaRecompensa ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Faltam{" "}
                      <strong className="text-foreground">
                        {resumo.pontosParaProximaRecompensa.toLocaleString(
                          "pt-BR",
                        )}
                      </strong>{" "}
                      pontos para{" "}
                      <strong className="text-foreground">
                        {resumo.proximaRecompensa.nome}
                      </strong>
                      .
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Você já possui pontos suficientes para as principais
                      recompensas.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border bg-background/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Regra atual
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    R$ 1,00 gasto = 1 ponto de fidelidade.
                  </p>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{
                    width: `${resumo.progresso}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-4 md:grid-cols-3">
            {resumo.recompensas.map((recompensa) => (
              <Card key={recompensa.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        {recompensa.nome}
                      </CardTitle>

                      <p className="mt-1 text-sm font-medium text-gold">
                        {recompensa.pontosNecessarios.toLocaleString(
                          "pt-BR",
                        )}{" "}
                        pts
                      </p>
                    </div>

                    {recompensa.disponivel ? (
                      <Badge>Disponível</Badge>
                    ) : (
                      <Badge variant="outline">Bloqueado</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {recompensa.descricao}
                  </p>

                  <Button
                    type="button"
                    className="mt-5 w-full"
                    variant={recompensa.disponivel ? "default" : "outline"}
                    disabled
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    {recompensa.disponivel
                      ? "Resgate disponível"
                      : "Junte mais pontos"}
                  </Button>

                  <p className="mt-2 text-xs text-muted-foreground">
                    O resgate será liberado na próxima etapa do sistema.
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de pontos</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Últimos registros que geraram pontos na sua conta.
              </p>
            </CardHeader>

            <CardContent>
              {resumo.eventos.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Star className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 font-medium">
                    Nenhum ponto registrado ainda
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Quando um atendimento for concluído ou uma assinatura
                    for paga, os pontos aparecerão aqui.
                  </p>
                </div>
              )}

              {resumo.eventos.length > 0 && (
                <div className="space-y-3">
                  {resumo.eventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 rounded-full bg-gold/10 p-2 text-gold">
                          {evento.tipo === "ATENDIMENTO" ? (
                            <Scissors className="h-4 w-4" />
                          ) : (
                            <Crown className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">{evento.titulo}</p>

                          <p className="text-sm text-muted-foreground">
                            {evento.descricao}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarClock className="h-3 w-3" />
                            {formatarDataHora(evento.data)}
                          </p>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatarDinheiro(evento.valorCentavos)}
                        </p>

                        <p className="text-lg font-bold text-gold">
                          +{evento.pontos.toLocaleString("pt-BR")} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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

function formatarDataHora(valor: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}