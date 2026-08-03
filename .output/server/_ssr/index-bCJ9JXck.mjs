import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as createSsrRpc } from "./router-oC4Qe4sf.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { B as Badge } from "./badge-YM7oB01y.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-B2WPZ-Hv.mjs";
import "../_libs/seroval.mjs";
import { i as Scissors, j as Sparkles, A as ArrowRight, k as Check, l as CalendarClock, f as Crown, P as Package, m as Star, n as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/tailwind-merge.mjs";
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
  const [servicos, setServicos] = reactExports.useState([]);
  const [planos, setPlanos] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
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
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b bg-background/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Studio RD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Barbearia premium" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#servicos", className: "hover:text-foreground", children: "Serviços" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#produtos", className: "hover:text-foreground", children: "Produtos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#assinatura", className: "hover:text-foreground", children: "Assinatura" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#beneficios", className: "hover:text-foreground", children: "Benefícios" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Entrar" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Agendar" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
          "Studio RD Black"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "max-w-3xl text-4xl font-bold tracking-tight md:text-6xl", children: "Mais que um corte, uma experiência de cuidado masculino." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-2xl text-base text-muted-foreground md:text-lg", children: "Agende seu horário, conheça os serviços, veja os produtos vendidos no Studio RD e descubra os benefícios da assinatura RD Black." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/login", children: [
            "Agendar agora",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Criar cadastro" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-3 text-sm text-muted-foreground md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-gold" }),
            "Agendamento online"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-gold" }),
            "Assinatura mensal"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-gold" }),
            "Produtos premium"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gold", children: "Próximo passo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold", children: "Entre ou cadastre-se para solicitar seu horário." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "A visualização é pública, mas ações como agendar, assinar ou acompanhar histórico exigem login." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/60 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4 text-gold" }),
              "Agendamento"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Escolha serviço, profissional e horário após entrar." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-background/60 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-gold" }),
              "RD Black"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Tenha benefícios exclusivos e cortes inclusos no plano." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Começar agora" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "servicos", className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gold", children: "Serviços" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold", children: "Escolha seu cuidado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Consulte os serviços disponíveis antes de fazer seu cadastro." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Agendar serviço" }) })
      ] }),
      carregando && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Carregando serviços..." }) }),
      !carregando && servicos.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Nenhum serviço ativo cadastrado ainda." }) }),
      servicos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: servicos.map((servico) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: servico.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            servico.duracaoMinutos,
            " minutos"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "min-h-12 text-sm text-muted-foreground", children: servico.descricao || "Serviço profissional Studio RD." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gold", children: formatarDinheiro(servico.precoCentavos) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Agendar" }) })
          ] })
        ] })
      ] }, servico.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "produtos", className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gold", children: "Produtos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold", children: "Produtos vendidos no Studio RD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Conheça alguns produtos para manter o visual em casa." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: produtos.map((produto) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: produto.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gold", children: produto.categoria })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: produto.descricao }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-5 w-full", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Tenho interesse" }) })
        ] })
      ] }, produto.nome)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "assinatura", className: "mx-auto max-w-7xl px-6 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-gold/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-8 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm font-medium text-gold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }),
          "Assinatura RD Black"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold", children: "Benefícios para quem cuida do visual todo mês." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Planos com cortes inclusos, benefícios exclusivos e condições especiais em serviços e produtos selecionados." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Quero assinar" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        planos.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-sm text-muted-foreground", children: "Nenhum plano ativo cadastrado ainda." }) }),
        planos.map((plano) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-background/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: plano.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              plano.cortesPorCiclo,
              " cortes a cada",
              " ",
              plano.duracaoDias,
              " dias"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gold", children: formatarDinheiro(plano.precoCentavos) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: plano.descricao || "Plano de assinatura Studio RD Black." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-5 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Entrar para assinar" }) })
          ] })
        ] }, plano.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "beneficios", className: "mx-auto max-w-7xl px-6 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gold", children: "Benefícios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold", children: "Por que criar sua conta?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mb-3 h-6 w-6 text-gold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Fidelidade" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Acompanhe seus pontos e recompensas conforme realiza atendimentos no Studio RD." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mb-3 h-6 w-6 text-gold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Histórico" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Veja seus atendimentos anteriores, assinatura ativa e benefícios disponíveis." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "mb-3 h-6 w-6 text-gold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Agendamento" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Solicite horários online e acompanhe a confirmação pela equipe." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border bg-card p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold", children: "Pronto para entrar no padrão Studio RD?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-xl text-sm text-muted-foreground", children: "Crie sua conta ou entre para agendar, assinar e acompanhar seus benefícios." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Entrar ou cadastrar" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", children: "Ver horários" }) })
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
