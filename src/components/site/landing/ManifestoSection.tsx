import { landingImages } from "./media";
import { Reveal } from "./Reveal";

export function ManifestoSection() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-10 lg:py-32">
        <Reveal className="order-2 lg:order-1">
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl lg:mx-0">
            <img
              src={landingImages.ambienteEstacao.src}
              alt={landingImages.ambienteEstacao.alt}
              width={landingImages.ambienteEstacao.width}
              height={landingImages.ambienteEstacao.height}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={1} className="order-1 lg:order-2">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">A experiência</p>

          <h2 className="font-display-landing mt-6 max-w-2xl text-[1.9rem] leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Um espaço pensado em preto e luz quente, onde o atendimento é conduzido com calma — para
            ser sentido, não só visto.
          </h2>

          <p className="mt-8 max-w-md text-sm text-muted-foreground md:text-base">
            No Studio RD, o ambiente, o ritual e o resultado fazem parte do mesmo serviço. Cada
            visita é conduzida com atenção, do início ao acabamento final.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
