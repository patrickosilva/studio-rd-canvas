import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { listarDadosPublicosStudio } from "@/lib/api/publico.functions";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { BenefitsSection } from "@/components/site/landing/BenefitsSection";
import { FinalCtaSection } from "@/components/site/landing/FinalCtaSection";
import { HeroSection } from "@/components/site/landing/HeroSection";
import { ManifestoSection } from "@/components/site/landing/ManifestoSection";
import { PlansSection, type PlanoPublico } from "@/components/site/landing/PlansSection";
import { ProductsSection } from "@/components/site/landing/ProductsSection";
import { ResultsSection } from "@/components/site/landing/ResultsSection";
import { RitualSection } from "@/components/site/landing/RitualSection";
import { ServicesSection, type ServicoPublico } from "@/components/site/landing/ServicesSection";
import { SpaceSection } from "@/components/site/landing/SpaceSection";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&display=swap",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const listarDados = useServerFn(listarDadosPublicosStudio);

  const [servicos, setServicos] = useState<ServicoPublico[]>([]);
  const [planos, setPlanos] = useState<PlanoPublico[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);

    try {
      const resultado = await listarDados();

      setServicos(resultado.servicos as ServicoPublico[]);
      setPlanos(resultado.planos as PlanoPublico[]);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  return (
    <div className="landing-page min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <HeroSection />
        <ManifestoSection />
        <ServicesSection servicos={servicos} carregando={carregando} />
        <RitualSection />
        <ResultsSection />
        <SpaceSection />
        <PlansSection planos={planos} />
        <ProductsSection />
        <BenefitsSection />
        <FinalCtaSection />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
