import { Button } from "@/components/ui/button";
import { landingImages } from "./media";
import { Reveal } from "./Reveal";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <img
        src={landingImages.ambienteEstacao.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 30%" }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70"
      />

      <Reveal className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
        <h2 className="font-display-landing text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Pronto para entrar no padrão Studio RD?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          Crie sua conta ou entre para agendar, assinar e acompanhar seus benefícios.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <a href="/login">Entrar ou cadastrar</a>
          </Button>

          <Button asChild size="lg" variant="outline" className="rounded-full px-7">
            <a href="/login">Ver horários</a>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
