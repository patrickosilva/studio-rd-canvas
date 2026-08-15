import { Reveal } from "./Reveal";

const beneficios = [
  {
    titulo: "Fidelidade",
    texto: "Acompanhe seus pontos e recompensas conforme realiza atendimentos no Studio RD.",
  },
  {
    titulo: "Histórico",
    texto: "Veja seus atendimentos anteriores, assinatura ativa e benefícios disponíveis.",
  },
  {
    titulo: "Agendamento",
    texto: "Solicite horários online e acompanhe a confirmação pela equipe.",
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Benefícios</p>
          <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
            Por que criar sua conta?
          </h2>
        </Reveal>

        <Reveal delay={1}>
          <ul className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {beneficios.map((beneficio, index) => (
              <li key={beneficio.titulo} className="border-t border-border pt-5">
                <span className="font-display-landing text-sm text-gold/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display-landing mt-2 text-xl text-foreground">
                  {beneficio.titulo}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{beneficio.texto}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
