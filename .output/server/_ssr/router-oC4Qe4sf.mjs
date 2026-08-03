import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { U as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-BeKYjhVv.mjs";
import { o as objectType, s as stringType, l as literalType, b as booleanType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const obterUsuarioAtualFn = createServerFn({
  method: "GET"
}).handler(createSsrRpc("4c6b1543dbabcab4e515645ae9b990b60d036f7f649a8bca2ea9ef94d45c622e"));
const sair = createServerFn({
  method: "POST"
}).handler(createSsrRpc("21b8f98a86e4a15e2c4cef88a3485cf31d5d08d6fa5e45f668e001907171a63c"));
const cadastroSchema = objectType({
  nome: stringType().trim().min(3, "O nome precisa ter pelo menos 3 caracteres.").max(100, "O nome é muito grande."),
  email: stringType().trim().email("Informe um e-mail válido."),
  telefone: stringType().trim().max(20, "Telefone inválido.").optional().or(literalType("")),
  senha: stringType().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72, "A senha é muito grande.")
});
const loginSchema = objectType({
  email: stringType().trim().email("Informe um e-mail válido."),
  senha: stringType().min(1, "Informe sua senha.").max(72, "A senha é muito grande."),
  manterConectado: booleanType().default(false),
  redirect: stringType().trim().max(300).optional()
});
const cadastrarCliente = createServerFn({
  method: "POST"
}).validator(cadastroSchema).handler(createSsrRpc("437c2945790358e3468a44542ba4f1129f341a958f13be44b51f368deda7d05c"));
const entrar = createServerFn({
  method: "POST"
}).validator(loginSchema).handler(createSsrRpc("ed4e1a4c2eaabdff9e752241bec55f15eb6e22cf1e8a0c5d9abd5df93735fabf"));
const appCss = "/assets/styles-Cloc8BGF.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$r = createRootRouteWithContext()({
  beforeLoad: async () => {
    const usuario = await obterUsuarioAtualFn();
    return {
      usuario
    };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Studio RD — Barbearia Premium" },
      { name: "description", content: "Studio RD: experiência de barbearia premium. Agende, acompanhe benefícios e faça parte do RD Black." },
      { name: "author", content: "Studio RD" },
      { property: "og:title", content: "Studio RD — Barbearia Premium" },
      { property: "og:description", content: "Imagem, experiência e exclusividade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$r.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
const $$splitComponentImporter$q = () => import("./logout-ngfBw6pk.mjs");
const Route$q = createFileRoute("/logout")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./login-BQe2aGb9.mjs");
const Route$p = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./funcionario-Bazc3uBu.mjs");
const Route$o = createFileRoute("/funcionario")({
  beforeLoad: ({
    context,
    location
  }) => {
    const {
      usuario
    } = context;
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
    if (usuario.papel === "CLIENTE") {
      throw redirect({
        to: "/cliente"
      });
    }
    if (usuario.papel !== "FUNCIONARIO" && usuario.papel !== "DONO") {
      throw redirect({
        to: "/"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Área do Funcionário · Studio RD"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./cliente-BA0QEDHs.mjs");
const Route$n = createFileRoute("/cliente")({
  beforeLoad: ({
    context,
    location
  }) => {
    const {
      usuario
    } = context;
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
    if (usuario.papel === "DONO") {
      throw redirect({
        to: "/admin"
      });
    }
    if (usuario.papel === "FUNCIONARIO") {
      throw redirect({
        to: "/"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Área do Cliente · Studio RD"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./cadastro-Cmvr_Jbh.mjs");
const Route$m = createFileRoute("/cadastro")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./admin-Bo2ipmqS.mjs");
const Route$l = createFileRoute("/admin")({
  beforeLoad: ({
    context,
    location
  }) => {
    const {
      usuario
    } = context;
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
    if (usuario.papel === "CLIENTE") {
      throw redirect({
        to: "/cliente"
      });
    }
    if (usuario.papel === "FUNCIONARIO") {
      throw redirect({
        to: "/"
      });
    }
    if (usuario.papel !== "DONO") {
      throw redirect({
        to: "/"
      });
    }
  },
  head: () => ({
    meta: [{
      title: "Administração · Studio RD"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./index-bCJ9JXck.mjs");
const Route$k = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./funcionario.index-BZMHcB12.mjs");
const Route$j = createFileRoute("/funcionario/")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./cliente.index-CHICVPN2.mjs");
const Route$i = createFileRoute("/cliente/")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./admin.index-BL9Wv5MQ.mjs");
const Route$h = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./funcionario.solicitacoes-DPUFBgAX.mjs");
const Route$g = createFileRoute("/funcionario/solicitacoes")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./funcionario.bloqueios-B4UqnFHG.mjs");
const Route$f = createFileRoute("/funcionario/bloqueios")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./cliente.perfil-C-jc_QRD.mjs");
const Route$e = createFileRoute("/cliente/perfil")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./cliente.historico-DbzxJsDQ.mjs");
const Route$d = createFileRoute("/cliente/historico")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./cliente.fidelidade-BBTNF_69.mjs");
const Route$c = createFileRoute("/cliente/fidelidade")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./cliente.beneficios-DN343bbc.mjs");
const Route$b = createFileRoute("/cliente/beneficios")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./cliente.assinatura-uWM4v0a5.mjs");
const Route$a = createFileRoute("/cliente/assinatura")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./cliente.agendamentos-CNPGeFa9.mjs");
const Route$9 = createFileRoute("/cliente/agendamentos")({
  beforeLoad: ({
    context,
    location
  }) => {
    const {
      usuario
    } = context;
    if (!usuario) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
    if (usuario.papel === "FUNCIONARIO") {
      throw redirect({
        to: "/funcionario/solicitacoes"
      });
    }
    if (usuario.papel === "DONO") {
      throw redirect({
        to: "/admin/agenda"
      });
    }
    if (usuario.papel !== "CLIENTE") {
      throw redirect({
        to: "/"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./admin.usuarios-CsdF5GKW.mjs");
const Route$8 = createFileRoute("/admin/usuarios")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./admin.relatorios-Iv6_JjvK.mjs");
const Route$7 = createFileRoute("/admin/relatorios")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./admin.marketing-BLaLiodo.mjs");
const Route$6 = createFileRoute("/admin/marketing")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./admin.financeiro-Dk_6dl52.mjs");
const Route$5 = createFileRoute("/admin/financeiro")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./admin.configuracoes-Cgj4gQjc.mjs");
const Route$4 = createFileRoute("/admin/configuracoes")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./admin.clientes-DGj-bn3H.mjs");
const Route$3 = createFileRoute("/admin/clientes")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.bloqueios-UxF3UaEY.mjs");
const Route$2 = createFileRoute("/admin/bloqueios")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.assinaturas-CoFaJTXI.mjs");
const Route$1 = createFileRoute("/admin/assinaturas")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./admin.agenda-xfxAC1Af.mjs");
const Route = createFileRoute("/admin/agenda")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LogoutRoute = Route$q.update({
  id: "/logout",
  path: "/logout",
  getParentRoute: () => Route$r
});
const LoginRoute = Route$p.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$r
});
const FuncionarioRoute = Route$o.update({
  id: "/funcionario",
  path: "/funcionario",
  getParentRoute: () => Route$r
});
const ClienteRoute = Route$n.update({
  id: "/cliente",
  path: "/cliente",
  getParentRoute: () => Route$r
});
const CadastroRoute = Route$m.update({
  id: "/cadastro",
  path: "/cadastro",
  getParentRoute: () => Route$r
});
const AdminRoute = Route$l.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$r
});
const IndexRoute = Route$k.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$r
});
const FuncionarioIndexRoute = Route$j.update({
  id: "/",
  path: "/",
  getParentRoute: () => FuncionarioRoute
});
const ClienteIndexRoute = Route$i.update({
  id: "/",
  path: "/",
  getParentRoute: () => ClienteRoute
});
const AdminIndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const FuncionarioSolicitacoesRoute = Route$g.update({
  id: "/solicitacoes",
  path: "/solicitacoes",
  getParentRoute: () => FuncionarioRoute
});
const FuncionarioBloqueiosRoute = Route$f.update({
  id: "/bloqueios",
  path: "/bloqueios",
  getParentRoute: () => FuncionarioRoute
});
const ClientePerfilRoute = Route$e.update({
  id: "/perfil",
  path: "/perfil",
  getParentRoute: () => ClienteRoute
});
const ClienteHistoricoRoute = Route$d.update({
  id: "/historico",
  path: "/historico",
  getParentRoute: () => ClienteRoute
});
const ClienteFidelidadeRoute = Route$c.update({
  id: "/fidelidade",
  path: "/fidelidade",
  getParentRoute: () => ClienteRoute
});
const ClienteBeneficiosRoute = Route$b.update({
  id: "/beneficios",
  path: "/beneficios",
  getParentRoute: () => ClienteRoute
});
const ClienteAssinaturaRoute = Route$a.update({
  id: "/assinatura",
  path: "/assinatura",
  getParentRoute: () => ClienteRoute
});
const ClienteAgendamentosRoute = Route$9.update({
  id: "/agendamentos",
  path: "/agendamentos",
  getParentRoute: () => ClienteRoute
});
const AdminUsuariosRoute = Route$8.update({
  id: "/usuarios",
  path: "/usuarios",
  getParentRoute: () => AdminRoute
});
const AdminRelatoriosRoute = Route$7.update({
  id: "/relatorios",
  path: "/relatorios",
  getParentRoute: () => AdminRoute
});
const AdminMarketingRoute = Route$6.update({
  id: "/marketing",
  path: "/marketing",
  getParentRoute: () => AdminRoute
});
const AdminFinanceiroRoute = Route$5.update({
  id: "/financeiro",
  path: "/financeiro",
  getParentRoute: () => AdminRoute
});
const AdminConfiguracoesRoute = Route$4.update({
  id: "/configuracoes",
  path: "/configuracoes",
  getParentRoute: () => AdminRoute
});
const AdminClientesRoute = Route$3.update({
  id: "/clientes",
  path: "/clientes",
  getParentRoute: () => AdminRoute
});
const AdminBloqueiosRoute = Route$2.update({
  id: "/bloqueios",
  path: "/bloqueios",
  getParentRoute: () => AdminRoute
});
const AdminAssinaturasRoute = Route$1.update({
  id: "/assinaturas",
  path: "/assinaturas",
  getParentRoute: () => AdminRoute
});
const AdminAgendaRoute = Route.update({
  id: "/agenda",
  path: "/agenda",
  getParentRoute: () => AdminRoute
});
const AdminRouteChildren = {
  AdminAgendaRoute,
  AdminAssinaturasRoute,
  AdminBloqueiosRoute,
  AdminClientesRoute,
  AdminConfiguracoesRoute,
  AdminFinanceiroRoute,
  AdminMarketingRoute,
  AdminRelatoriosRoute,
  AdminUsuariosRoute,
  AdminIndexRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const ClienteRouteChildren = {
  ClienteAgendamentosRoute,
  ClienteAssinaturaRoute,
  ClienteBeneficiosRoute,
  ClienteFidelidadeRoute,
  ClienteHistoricoRoute,
  ClientePerfilRoute,
  ClienteIndexRoute
};
const ClienteRouteWithChildren = ClienteRoute._addFileChildren(ClienteRouteChildren);
const FuncionarioRouteChildren = {
  FuncionarioBloqueiosRoute,
  FuncionarioSolicitacoesRoute,
  FuncionarioIndexRoute
};
const FuncionarioRouteWithChildren = FuncionarioRoute._addFileChildren(
  FuncionarioRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  CadastroRoute,
  ClienteRoute: ClienteRouteWithChildren,
  FuncionarioRoute: FuncionarioRouteWithChildren,
  LoginRoute,
  LogoutRoute
};
const routeTree = Route$r._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$p as R,
  createSsrRpc as a,
  cadastrarCliente as c,
  entrar as e,
  router as r,
  sair as s
};
