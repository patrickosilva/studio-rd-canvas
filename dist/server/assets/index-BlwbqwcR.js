import { jsxs, jsx } from "react/jsx-runtime";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { Scissors, Sparkles, ArrowRight, Check, CalendarClock, Crown, Package, Star, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { a as createSsrRpc } from "./router-CUHN8dl0.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { B as Badge } from "./badge-YM7oB01y.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-B2WPZ-Hv.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "zod";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "clsx";
import "tailwind-merge";
const listarDadosPublicosStudio = createServerFn({
  method: "GET"
}).handler(createSsrRpc("9cd63a6b36763eb306ef3c07f5f0fce1990bd076bab04badd4abea1b3673e375"));
const produtos = [{
  nome: "Pomada modeladora",
  categoria: "Finalização",
  descricao: "Produto para modelar e manter o cabelo alinhado no dia a dia."
}, {
  nome: "Balm para barba",
  categoria: "Barba",
  descricao: "Ajuda a hidratar, alinhar e reduzir o ressecamento da barba."
}, {
  nome: "Óleo para barba",
  categoria: "Barba",
  descricao: "Finalização premium para brilho, maciez e acabamento."
}, {
  nome: "Kit RD Black",
  categoria: "Combo",
  descricao: "Produtos selecionados para manter o visual em casa."
}];
function LandingPage() {
  const listarDados = useServerFn(listarDadosPublicosStudio);
  const [servicos, setServicos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  async function carregarDados() {
    setCarregando(true);
    try {
      const resultado = await listarDados();
      setServicos(resultado.servicos);
      setPlanos(resultado.planos);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b bg-background/80 backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxs("a", { href: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black", children: /* @__PURE__ */ jsx(Scissors, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Studio RD" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Barbearia premium" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsx("a", { href: "#servicos", className: "hover:text-foreground", children: "Serviços" }),
        /* @__PURE__ */ jsx("a", { href: "#produtos", className: "hover:text-foreground", children: "Produtos" }),
        /* @__PURE__ */ jsx("a", { href: "#assinatura", className: "hover:text-foreground", children: "Assinatura" }),
        /* @__PURE__ */ jsx("a", { href: "#beneficios", className: "hover:text-foreground", children: "Benefícios" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Entrar" }) }),
        /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Agendar" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Badge, { className: "mb-5", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
          "Studio RD Black"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "max-w-3xl text-4xl font-bold tracking-tight md:text-6xl", children: "Mais que um corte, uma experiência de cuidado masculino." }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-2xl text-base text-muted-foreground md:text-lg", children: "Agende seu horário, conheça os serviços, veja os produtos vendidos no Studio RD e descubra os benefícios da assinatura RD Black." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsxs("a", { href: "/login", children: [
            "Agendar agora",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", variant: "outline", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Criar cadastro" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-3 text-sm text-muted-foreground md:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-gold" }),
            "Agendamento online"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-gold" }),
            "Assinatura mensal"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-gold" }),
            "Produtos premium"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-8", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gold", children: "Próximo passo" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold", children: "Entre ou cadastre-se para solicitar seu horário." }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "A visualização é pública, mas ações como agendar, assinar ou acompanhar histórico exigem login." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-background/60 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsx(CalendarClock, { className: "h-4 w-4 text-gold" }),
              "Agendamento"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Escolha serviço, profissional e horário após entrar." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-background/60 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-gold" }),
              "RD Black"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tenha benefícios exclusivos e cortes inclusos no plano." })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-6 w-full", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Começar agora" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "servicos", className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gold", children: "Serviços" }),
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Escolha seu cuidado" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Consulte os serviços disponíveis antes de fazer seu cadastro." })
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Agendar serviço" }) })
      ] }),
      carregando && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Carregando serviços..." }) }),
      !carregando && servicos.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Nenhum serviço ativo cadastrado ainda." }) }),
      servicos.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: servicos.map((servico) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold", children: /* @__PURE__ */ jsx(Scissors, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx(CardTitle, { children: servico.nome }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            servico.duracaoMinutos,
            " minutos"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("p", { className: "min-h-12 text-sm text-muted-foreground", children: servico.descricao || "Serviço profissional Studio RD." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold text-gold", children: formatarDinheiro(servico.precoCentavos) }),
            /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Agendar" }) })
          ] })
        ] })
      ] }, servico.id)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "produtos", className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gold", children: "Produtos" }),
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Produtos vendidos no Studio RD" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Conheça alguns produtos para manter o visual em casa." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: produtos.map((produto) => /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold", children: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: produto.nome }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gold", children: produto.categoria })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: produto.descricao }),
          /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-5 w-full", variant: "outline", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Tenho interesse" }) })
        ] })
      ] }, produto.nome)) })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "assinatura", className: "mx-auto max-w-7xl px-6 py-12", children: /* @__PURE__ */ jsx(Card, { className: "border-gold/30", children: /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-8 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-sm font-medium text-gold", children: [
          /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }),
          "Assinatura RD Black"
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold", children: "Benefícios para quem cuida do visual todo mês." }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Planos com cortes inclusos, benefícios exclusivos e condições especiais em serviços e produtos selecionados." }),
        /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Quero assinar" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        planos.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Nenhum plano ativo cadastrado ainda." }) }),
        planos.map((plano) => /* @__PURE__ */ jsxs(Card, { className: "bg-background/60", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: plano.nome }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              plano.cortesPorCiclo,
              " cortes a cada",
              " ",
              plano.duracaoDias,
              " dias"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gold", children: formatarDinheiro(plano.precoCentavos) }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: plano.descricao || "Plano de assinatura Studio RD Black." }),
            /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-5 w-full", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Entrar para assinar" }) })
          ] })
        ] }, plano.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { id: "beneficios", className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gold", children: "Benefícios" }),
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "Por que criar sua conta?" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(Star, { className: "mb-3 h-6 w-6 text-gold" }),
            /* @__PURE__ */ jsx(CardTitle, { children: "Fidelidade" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Acompanhe seus pontos e recompensas conforme realiza atendimentos no Studio RD." })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "mb-3 h-6 w-6 text-gold" }),
            /* @__PURE__ */ jsx(CardTitle, { children: "Histórico" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Veja seus atendimentos anteriores, assinatura ativa e benefícios disponíveis." })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CalendarClock, { className: "mb-3 h-6 w-6 text-gold" }),
            /* @__PURE__ */ jsx(CardTitle, { children: "Agendamento" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Solicite horários online e acompanhe a confirmação pela equipe." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-2xl border bg-card p-6 text-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold", children: "Pronto para entrar no padrão Studio RD?" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-xl text-sm text-muted-foreground", children: "Crie sua conta ou entre para agendar, assinar e acompanhar seus benefícios." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Entrar ou cadastrar" }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx("a", { href: "/login", children: "Ver horários" }) })
        ] })
      ] })
    ] })
  ] });
}
function formatarDinheiro(valorCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valorCentavos / 100);
}
export {
  LandingPage as component
};
