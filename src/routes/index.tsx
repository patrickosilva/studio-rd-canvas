import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Crown,
  Package,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import { listarDadosPublicosStudio } from "@/lib/api/publico.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

type ServicoPublico = {
  id: string;
  nome: string;
  descricao?: string | null;
  duracaoMinutos: number;
  precoCentavos: number;
};

type PlanoPublico = {
  id: string;
  nome: string;
  descricao?: string | null;
  precoCentavos: number;
  cortesPorCiclo: number;
  duracaoDias: number;
};

const produtos = [
  {
    nome: "Pomada modeladora",
    categoria: "Finalização",
    descricao: "Produto para modelar e manter o cabelo alinhado no dia a dia.",
  },
  {
    nome: "Balm para barba",
    categoria: "Barba",
    descricao: "Ajuda a hidratar, alinhar e reduzir o ressecamento da barba.",
  },
  {
    nome: "Óleo para barba",
    categoria: "Barba",
    descricao: "Finalização premium para brilho, maciez e acabamento.",
  },
  {
    nome: "Kit RD Black",
    categoria: "Combo",
    descricao: "Produtos selecionados para manter o visual em casa.",
  },
];

function LandingPage() {
  const listarDados = useServerFn(listarDadosPublicosStudio);

  const [servicos, setServicos] = useState<ServicoPublico[]>([]);
  const [planos, setPlanos] = useState<PlanoPublico[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);

    try {
      const resultado = await listarDados();

      setServicos(resultado.servicos as ServicoPublico[]);
      setPlanos(resultado.planos as PlanoPublico[]);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black">
              <Scissors className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold">Studio RD</p>
              <p className="text-xs text-muted-foreground">
                Barbearia premium
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#servicos" className="hover:text-foreground">
              Serviços
            </a>

            <a href="#produtos" className="hover:text-foreground">
              Produtos
            </a>

            <a href="#assinatura" className="hover:text-foreground">
              Assinatura
            </a>

            <a href="#beneficios" className="hover:text-foreground">
              Benefícios
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href="/login">Entrar</a>
            </Button>

            <Button asChild>
              <a href="/login">Agendar</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Badge className="mb-5">
            <Sparkles className="mr-2 h-4 w-4" />
            Studio RD Black
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Mais que um corte, uma experiência de cuidado masculino.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Agende seu horário, conheça os serviços, veja os produtos
            vendidos no Studio RD e descubra os benefícios da assinatura
            RD Black.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="/login">
                Agendar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button asChild size="lg" variant="outline">
              <a href="/login">Criar cadastro</a>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Agendamento online
            </p>

            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Assinatura mensal
            </p>

            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-gold" />
              Produtos premium
            </p>
          </div>
        </div>

        <Card className="border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card">
          <CardContent className="pt-8">
            <p className="text-sm font-medium text-gold">
              Próximo passo
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Entre ou cadastre-se para solicitar seu horário.
            </h2>

            <p className="mt-4 text-sm text-muted-foreground">
              A visualização é pública, mas ações como agendar, assinar
              ou acompanhar histórico exigem login.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg border bg-background/60 p-4">
                <p className="flex items-center gap-2 font-medium">
                  <CalendarClock className="h-4 w-4 text-gold" />
                  Agendamento
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha serviço, profissional e horário após entrar.
                </p>
              </div>

              <div className="rounded-lg border bg-background/60 p-4">
                <p className="flex items-center gap-2 font-medium">
                  <Crown className="h-4 w-4 text-gold" />
                  RD Black
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tenha benefícios exclusivos e cortes inclusos no plano.
                </p>
              </div>
            </div>

            <Button asChild className="mt-6 w-full">
              <a href="/login">Começar agora</a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section id="servicos" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-gold">Serviços</p>

            <h2 className="text-3xl font-bold">Escolha seu cuidado</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Consulte os serviços disponíveis antes de fazer seu cadastro.
            </p>
          </div>

          <Button asChild variant="outline">
            <a href="/login">Agendar serviço</a>
          </Button>
        </div>

        {carregando && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Carregando serviços...
            </CardContent>
          </Card>
        )}

        {!carregando && servicos.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Nenhum serviço ativo cadastrado ainda.
            </CardContent>
          </Card>
        )}

        {servicos.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {servicos.map((servico) => (
              <Card key={servico.id}>
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <Scissors className="h-5 w-5" />
                  </div>

                  <CardTitle>{servico.nome}</CardTitle>

                  <p className="text-sm text-muted-foreground">
                    {servico.duracaoMinutos} minutos
                  </p>
                </CardHeader>

                <CardContent>
                  <p className="min-h-12 text-sm text-muted-foreground">
                    {servico.descricao ||
                      "Serviço profissional Studio RD."}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-xl font-bold text-gold">
                      {formatarDinheiro(servico.precoCentavos)}
                    </p>

                    <Button asChild size="sm">
                      <a href="/login">Agendar</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <p className="text-sm font-medium text-gold">Produtos</p>

          <h2 className="text-3xl font-bold">
            Produtos vendidos no Studio RD
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Conheça alguns produtos para manter o visual em casa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {produtos.map((produto) => (
            <Card key={produto.nome}>
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Package className="h-5 w-5" />
                </div>

                <CardTitle className="text-lg">{produto.nome}</CardTitle>

                <p className="text-sm text-gold">{produto.categoria}</p>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {produto.descricao}
                </p>

                <Button asChild className="mt-5 w-full" variant="outline">
                  <a href="/login">Tenho interesse</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="assinatura" className="mx-auto max-w-7xl px-6 py-12">
        <Card className="border-gold/30">
          <CardContent className="grid gap-8 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-gold">
                <Crown className="h-4 w-4" />
                Assinatura RD Black
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Benefícios para quem cuida do visual todo mês.
              </h2>

              <p className="mt-4 text-sm text-muted-foreground">
                Planos com cortes inclusos, benefícios exclusivos e
                condições especiais em serviços e produtos selecionados.
              </p>

              <Button asChild className="mt-6">
                <a href="/login">Quero assinar</a>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {planos.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Nenhum plano ativo cadastrado ainda.
                  </CardContent>
                </Card>
              )}

              {planos.map((plano) => (
                <Card key={plano.id} className="bg-background/60">
                  <CardHeader>
                    <CardTitle>{plano.nome}</CardTitle>

                    <p className="text-sm text-muted-foreground">
                      {plano.cortesPorCiclo} cortes a cada{" "}
                      {plano.duracaoDias} dias
                    </p>
                  </CardHeader>

                  <CardContent>
                    <p className="text-2xl font-bold text-gold">
                      {formatarDinheiro(plano.precoCentavos)}
                    </p>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {plano.descricao ||
                        "Plano de assinatura Studio RD Black."}
                    </p>

                    <Button asChild className="mt-5 w-full">
                      <a href="/login">
                        Entrar para assinar
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="beneficios" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6">
          <p className="text-sm font-medium text-gold">Benefícios</p>

          <h2 className="text-3xl font-bold">
            Por que criar sua conta?
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Star className="mb-3 h-6 w-6 text-gold" />
              <CardTitle>Fidelidade</CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              Acompanhe seus pontos e recompensas conforme realiza
              atendimentos no Studio RD.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheck className="mb-3 h-6 w-6 text-gold" />
              <CardTitle>Histórico</CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              Veja seus atendimentos anteriores, assinatura ativa e
              benefícios disponíveis.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CalendarClock className="mb-3 h-6 w-6 text-gold" />
              <CardTitle>Agendamento</CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              Solicite horários online e acompanhe a confirmação pela
              equipe.
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border bg-card p-6 text-center">
          <h3 className="text-2xl font-bold">
            Pronto para entrar no padrão Studio RD?
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Crie sua conta ou entre para agendar, assinar e acompanhar
            seus benefícios.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href="/login">Entrar ou cadastrar</a>
            </Button>

            <Button asChild variant="outline">
              <a href="/login">Ver horários</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatarDinheiro(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}
