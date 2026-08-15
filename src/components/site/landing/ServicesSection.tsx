import { ArrowUpRight } from "lucide-react";

import { formatarDinheiro } from "./format";
import { Reveal } from "./Reveal";

export type ServicoPublico = {
  id: string;
  nome: string;
  descricao?: string | null;
  duracaoMinutos: number;
  precoCentavos: number;
};

type ServicesSectionProps = {
  servicos: ServicoPublico[];
  carregando: boolean;
};

export function ServicesSection({ servicos, carregando }: ServicesSectionProps) {
  return (
    <section id="servicos" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Serviços</p>
            <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
              Escolha seu cuidado
            </h2>
          </div>

          <p className="max-w-sm text-sm text-muted-foreground">
            Consulte os serviços disponíveis antes de fazer seu cadastro.
          </p>
        </Reveal>

        <div className="mt-12">
          {carregando && (
            <p className="border-t border-border py-8 text-sm text-muted-foreground">
              Carregando serviços...
            </p>
          )}

          {!carregando && servicos.length === 0 && (
            <p className="border-t border-border py-8 text-sm text-muted-foreground">
              Nenhum serviço ativo cadastrado ainda.
            </p>
          )}

          {servicos.length > 0 && (
            <Reveal>
              <ul className="divide-y divide-border border-y border-border">
                {servicos.map((servico, index) => (
                  <li
                    key={servico.id}
                    className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div className="flex items-start gap-5 sm:items-center">
                      <span className="font-display-landing w-8 shrink-0 text-sm text-gold/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h3 className="font-display-landing text-xl text-foreground sm:text-2xl">
                          {servico.nome}
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                          {servico.descricao || "Serviço profissional Studio RD."}
                          {" · "}
                          {servico.duracaoMinutos} minutos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 pl-13 sm:pl-0">
                      <span className="text-lg font-medium text-gold">
                        {formatarDinheiro(servico.precoCentavos)}
                      </span>

                      <a
                        href="/login"
                        className="inline-flex items-center gap-1 text-sm text-foreground/80 transition group-hover:text-gold"
                      >
                        Agendar
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
