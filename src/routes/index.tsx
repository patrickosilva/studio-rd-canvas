import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Crown, Gift, Sparkles, Scissors, ShieldCheck, Star, ArrowRight, Check } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import hero from "@/assets/hero-barbershop.jpg";
import c1 from "@/assets/client-1.jpg";
import c2 from "@/assets/client-2.jpg";
import c3 from "@/assets/client-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio RD — Barbearia Premium" },
      { name: "description", content: "Studio RD: experiência de barbearia premium. Agende, acompanhe benefícios e faça parte do RD Black." },
      { property: "og:title", content: "Studio RD — Barbearia Premium" },
      { property: "og:description", content: "Imagem, experiência e exclusividade." },
    ],
  }),
  component: Home,
});

const services = [
  { icon: Scissors, name: "Corte Masculino", desc: "Corte assinatura, lavagem e finalização.", price: "R$ 70" },
  { icon: Sparkles, name: "Barba", desc: "Modelagem com toalha quente e óleos.", price: "R$ 55" },
  { icon: Crown, name: "Corte + Barba", desc: "A combinação clássica Studio RD.", price: "R$ 110" },
  { icon: ShieldCheck, name: "Limpeza de Pele", desc: "Tratamento profundo e revigorante.", price: "R$ 130" },
  { icon: Star, name: "Sobrancelha", desc: "Design preciso e natural.", price: "R$ 35" },
  { icon: Gift, name: "Pacotes", desc: "Combinações exclusivas com desconto.", price: "A partir de R$ 180" },
];

const benefits = [
  { icon: Crown, title: "Atendimento Premium", desc: "Ambiente exclusivo, experiência sob medida." },
  { icon: Calendar, title: "Agendamento Online", desc: "Reserve em segundos, sem fricção." },
  { icon: Gift, title: "Programa de Fidelidade", desc: "Cada visita gera pontos e benefícios." },
  { icon: ShieldCheck, title: "Plano RD Black", desc: "Assinatura mensal com vantagens reais." },
  { icon: Sparkles, title: "Produtos Selecionados", desc: "Linha premium para uso em casa." },
  { icon: Star, title: "Comunidade VIP", desc: "Eventos, lançamentos e perks exclusivos." },
];

const testimonials = [
  { name: "Rafael M.", img: c1, text: "Outro nível. Toda visita é um ritual. Saio renovado." },
  { name: "André S.", img: c2, text: "Profissionais incríveis. O RD Black vale cada centavo." },
  { name: "Lucas P.", img: c3, text: "Atendimento impecável e ambiente sofisticado." },
];

function Home() {
  return (
    <div className="bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
        <img
          src={hero}
          alt="Interior premium do Studio RD"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10 items-center w-full">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold-soft text-gold text-xs tracking-widest uppercase">
              <span className="w-1 h-1 rounded-full bg-gold" /> Studio RD · Premium Barbershop
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-7xl leading-[1.02] text-balance">
              Quer ser tratado <span className="text-gold">diferente?</span><br />
              Comece pela sua imagem.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">
              Agende seu horário, acompanhe seus benefícios e faça parte do{" "}
              <span className="text-foreground">Studio RD Black</span>.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/cliente" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gold text-gold-foreground font-medium hover:opacity-90 transition shadow-gold">
                Agendar Agora <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#black" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-border hover:bg-surface transition">
                Conhecer Plano Black
              </a>
            </div>
            <div className="mt-12 flex items-center gap-8 text-xs text-muted-foreground">
              <div><div className="text-xl font-display text-foreground">+12k</div>cortes realizados</div>
              <div><div className="text-xl font-display text-foreground">4.9★</div>avaliação média</div>
              <div><div className="text-xl font-display text-foreground">800+</div>membros RD Black</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs tracking-widest uppercase text-gold">Por que Studio RD</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-display text-balance">
              Uma experiência feita para quem valoriza detalhe.
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {benefits.map((b) => (
              <div key={b.title} className="bg-surface p-8 hover:bg-surface-elevated transition group">
                <b.icon className="w-6 h-6 text-gold" />
                <h3 className="mt-6 text-lg font-medium">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <span className="text-xs tracking-widest uppercase text-gold">Serviços</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-display">Cada detalhe pensado.</h2>
            </div>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Ver todos →</a>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.name} className="group relative rounded-2xl border border-border bg-background p-7 hover:border-gold/40 transition">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-gold-soft grid place-items-center">
                    <s.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-sm text-gold">{s.price}</span>
                </div>
                <h3 className="mt-6 text-lg font-medium">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-6 text-sm flex items-center gap-2 text-foreground/80 group-hover:text-gold transition">
                  Agendar <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RD BLACK */}
      <section id="black" className="py-28 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-gold/20 bg-gradient-dark shadow-premium p-10 sm:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.13_85/0.18),transparent_60%)]" />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold-soft text-gold text-xs tracking-widest uppercase">
                <Crown className="w-3 h-3" /> Studio RD Black
              </div>
              <h2 className="mt-6 text-4xl sm:text-5xl font-display leading-tight">
                Pertencer <span className="text-gold">muda tudo.</span>
              </h2>
              <p className="mt-5 text-muted-foreground max-w-md">
                Assinatura mensal com benefícios exclusivos, prioridade e preço de membro.
              </p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-5xl font-display">R$ 99,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <Link to="/cliente" className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gold text-gold-foreground font-medium hover:opacity-90 transition shadow-gold">
                Assinar Agora <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {[
                "2 cortes inclusos por mês",
                "Prioridade na agenda",
                "Desconto na limpeza de pele",
                "Preço de membro em produtos",
                "Promoções e eventos exclusivos",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-gold-soft grid place-items-center">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </span>
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs tracking-widest uppercase text-gold">Depoimentos</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-display">Quem entra, fica.</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-background p-7">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <blockquote className="mt-5 text-foreground/90">"{t.text}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img src={t.img} alt={t.name} loading="lazy" width={48} height={48} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">Membro RD Black</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 px-6 text-center">
        <h2 className="text-4xl sm:text-6xl font-display tracking-tight text-balance">
          Pertencer <span className="text-gold">muda tudo.</span>
        </h2>
        <Link to="/cliente" className="mt-10 inline-flex items-center gap-2 h-12 px-7 rounded-full bg-gold text-gold-foreground font-medium hover:opacity-90 transition shadow-gold">
          Entrar para o Studio RD Black <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
