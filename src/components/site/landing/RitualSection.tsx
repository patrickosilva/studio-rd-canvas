import { useEffect, useRef } from "react";

import { landingImages, landingVideos } from "./media";
import { MediaVideo } from "./MediaVideo";
import { Reveal } from "./Reveal";

export function RitualSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;

    if (!el) {
      return;
    }

    const isRowLayout = window.matchMedia("(min-width: 1024px)");

    function onWheel(event: WheelEvent) {
      // Abaixo de lg os cards ficam empilhados (sem scroll horizontal), então
      // não há o que redirecionar — deixa a rolagem vertical normal da página
      // acontecer.
      if (!isRowLayout.matches) {
        return;
      }

      // Só redireciona quando o gesto é predominantemente vertical (roda de
      // mouse comum); um swipe horizontal de trackpad já chega com deltaX
      // maior e continua funcionando nativamente sem passar por aqui.
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      el!.scrollLeft += event.deltaY;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section id="ritual" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">O ritual</p>
          <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
            Cada etapa do atendimento é conduzida com cuidado.
          </h2>
          <p className="mt-5 text-sm text-muted-foreground md:text-base">
            Do corte ao acabamento, o processo no Studio RD é feito com precisão e sem pressa —
            encerrando com um ritual de vapor que marca a experiência.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <Reveal delay={1}>
            <div className="relative overflow-hidden rounded-[28px] border border-gold/15 shadow-premium">
              <img
                src={landingImages.ritualVapor.src}
                alt={landingImages.ritualVapor.alt}
                width={landingImages.ritualVapor.width}
                height={landingImages.ritualVapor.height}
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] w-full object-cover"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent"
              />

              <p className="absolute bottom-5 left-6 text-xs uppercase tracking-[0.3em] text-gold">
                Ritual com vapor
              </p>
            </div>
          </Reveal>

          <Reveal delay={2} className="min-w-0">
            <div
              ref={scrollerRef}
              className="landing-edge-fade landing-scrollbar-hidden -mx-6 flex min-w-0 flex-col gap-5 px-6 pb-2 lg:mx-0 lg:flex-row lg:snap-x lg:snap-mandatory lg:overflow-x-auto lg:px-0"
              role="list"
              aria-label="Momentos do atendimento no Studio RD"
            >
              {landingVideos.ritual.map((clip) => (
                <div
                  key={clip.src}
                  role="listitem"
                  className="w-full shrink-0 lg:w-[280px] lg:snap-center"
                >
                  <MediaVideo
                    src={clip.src}
                    width={clip.width}
                    height={clip.height}
                    fallback={landingImages.ambienteDetalhe}
                    className="aspect-[3/4] w-full rounded-2xl border border-border"
                  />

                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {clip.caption}
                  </p>
                </div>
              ))}

              {/* Reserva espaço após o último card para que ele consiga
                  alcançar o snap-center: sem isso, a área rolável termina
                  junto com a borda do card e o navegador não tem para onde
                  rolar além do ponto em que ele fica só parcialmente visível. */}
              <div
                aria-hidden="true"
                className="w-[max(0px,calc((100%-68vw)/2-20px))] shrink-0 sm:w-[max(0px,calc((100%-280px)/2-20px))]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
