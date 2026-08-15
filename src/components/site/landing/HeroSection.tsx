import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { landingImages, landingVideos } from "./media";
import { MediaVideo } from "./MediaVideo";

const destaques = ["Agendamento online", "Assinatura mensal", "Produtos premium"];

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden pt-16 lg:pt-0">
      <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-10 lg:py-20">
        <div className="relative lg:order-2">
          <div className="relative">
            <MediaVideo
              src={landingVideos.hero.src}
              width={landingVideos.hero.width}
              height={landingVideos.hero.height}
              fallback={landingImages.ritualVapor}
              priority
              className="aspect-[3/4] w-full lg:aspect-auto lg:h-[76vh] lg:rounded-[28px] lg:border lg:border-gold/15 lg:shadow-premium"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent lg:hidden"
            />

            <div className="absolute -bottom-8 -left-6 hidden w-36 overflow-hidden rounded-2xl border border-border shadow-premium lg:block xl:w-44">
              <img
                src={landingImages.resultadoDegrade.src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 px-6 pb-14 pt-8 lg:order-1 lg:px-0 lg:pb-0 lg:pt-0">
          <p className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
            <span aria-hidden="true" className="h-px w-8 bg-gold/70" />
            Studio RD Black
          </p>

          <h1 className="font-display-landing mt-6 max-w-xl text-[2.6rem] leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-[3.65rem]">
            Mais que um corte,
            <br />
            uma <em className="text-gold not-italic">experiência</em>
            <br />
            de cuidado masculino.
          </h1>

          <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
            Agende seu horário, conheça os serviços, veja os produtos vendidos no Studio RD e
            descubra os benefícios da assinatura RD Black.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <a href="/login">
                Agendar agora
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>

            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <a href="/login">Criar cadastro</a>
            </Button>
          </div>

          <p className="mt-5 max-w-sm text-xs text-muted-foreground">
            A visualização é pública — agendar, assinar ou acompanhar histórico exige login.
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
            {destaques.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
