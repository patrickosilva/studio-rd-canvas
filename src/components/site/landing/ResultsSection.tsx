import { landingImages } from "./media";
import { Reveal } from "./Reveal";

const resultados = [landingImages.resultadoDegrade, landingImages.resultadoPenteado];

export function ResultsSection() {
  return (
    <section id="resultados" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Resultados</p>
            <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
              O acabamento fala por si.
            </h2>
          </div>

          <p className="max-w-sm text-sm text-muted-foreground">
            Fotos reais de atendimentos realizados no Studio RD.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-8">
            {resultados.map((foto, index) => (
              <div key={foto.src} className={index === 1 ? "sm:mt-16" : undefined}>
                <div className="group overflow-hidden rounded-2xl border border-border">
                  <img
                    src={foto.src}
                    alt={foto.alt}
                    width={foto.width}
                    height={foto.height}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
                  />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
