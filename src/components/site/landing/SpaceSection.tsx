import { landingImages } from "./media";
import { Reveal } from "./Reveal";

export function SpaceSection() {
  return (
    <section id="ambiente" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Ambiente</p>
          <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
            Sinta o lugar antes de chegar.
          </h2>
          <p className="mt-5 text-sm text-muted-foreground md:text-base">
            Preto, grafite e luz quente compõem o espaço do Studio RD — uma atmosfera intimista
            pensada para o atendimento.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-14 grid gap-6 sm:grid-cols-[1.3fr_1fr] sm:gap-8">
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src={landingImages.ambienteEspelho.src}
                alt={landingImages.ambienteEspelho.alt}
                width={landingImages.ambienteEspelho.width}
                height={landingImages.ambienteEspelho.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border sm:mt-10">
              <img
                src={landingImages.ambienteDetalhe.src}
                alt={landingImages.ambienteDetalhe.alt}
                width={landingImages.ambienteDetalhe.width}
                height={landingImages.ambienteDetalhe.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
