import { Button } from "@/components/ui/button";
import { formatarDinheiro } from "./format";
import { Reveal } from "./Reveal";

export type PlanoPublico = {
  id: string;
  nome: string;
  descricao?: string | null;
  precoCentavos: number;
  cortesPorCiclo: number;
  duracaoDias: number;
};

type PlansSectionProps = {
  planos: PlanoPublico[];
};

export function PlansSection({ planos }: PlansSectionProps) {
  return (
    <section id="assinatura" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Assinatura RD Black</p>

            <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
              Benefícios para quem cuida do visual todo mês.
            </h2>

            <p className="mt-5 max-w-md text-sm text-muted-foreground md:text-base">
              Planos com cortes inclusos, benefícios exclusivos e condições especiais em serviços e
              produtos selecionados.
            </p>

            <Button asChild size="lg" className="mt-8 rounded-full px-7">
              <a href="/login">Quero assinar</a>
            </Button>
          </Reveal>

          <Reveal delay={1}>
            {planos.length === 0 ? (
              <p className="border-t border-border py-8 text-sm text-muted-foreground">
                Nenhum plano ativo cadastrado ainda.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {planos.map((plano) => (
                  <div
                    key={plano.id}
                    className="flex flex-col rounded-2xl border border-gold/15 bg-surface/60 p-6"
                  >
                    <h3 className="font-display-landing text-xl text-foreground">{plano.nome}</h3>

                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {plano.cortesPorCiclo} cortes a cada {plano.duracaoDias} dias
                    </p>

                    <p className="mt-6 text-2xl font-medium text-gold">
                      {formatarDinheiro(plano.precoCentavos)}
                    </p>

                    <p className="mt-3 flex-1 text-sm text-muted-foreground">
                      {plano.descricao || "Plano de assinatura Studio RD Black."}
                    </p>

                    <Button asChild variant="outline" className="mt-6 rounded-full">
                      <a href="/login">Entrar para assinar</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
