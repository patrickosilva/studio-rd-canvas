import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as getRouteApi } from "../_libs/tanstack__react-router.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { q as UserRound, I as Info } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
const rootRoute = getRouteApi("__root__");
function formatarTelefone(telefone) {
  if (!telefone) {
    return "Não informado";
  }
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}
function CampoPerfil({
  id,
  label,
  value,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: id, className: "text-xs uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id, type, value, readOnly: true, className: "bg-surface-elevated" })
  ] });
}
function PerfilPage() {
  const {
    usuario
  } = rootRoute.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Perfil", subtitle: "Confira as informações vinculadas à sua conta." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-6 w-6 text-gold" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium", children: usuario?.nome ?? "Cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Conta de cliente Studio RD" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CampoPerfil, { id: "nome", label: "Nome", value: usuario?.nome ?? "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CampoPerfil, { id: "email", label: "E-mail", type: "email", value: usuario?.email ?? "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CampoPerfil, { id: "telefone", label: "Telefone", type: "tel", value: formatarTelefone(usuario?.telefone) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dataNascimento", className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Data de nascimento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "dataNascimento", value: "Ainda não cadastrada", readOnly: true, className: "bg-surface-elevated text-muted-foreground" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "A visualização já está conectada à sua conta. A edição dos dados será habilitada quando criarmos a função segura de atualização do perfil." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: true, className: "mt-6", children: "Edição em breve" })
    ] })
  ] });
}
export {
  PerfilPage as component
};
