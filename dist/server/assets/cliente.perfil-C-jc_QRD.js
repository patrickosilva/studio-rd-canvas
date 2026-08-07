import { jsxs, jsx } from "react/jsx-runtime";
import { getRouteApi } from "@tanstack/react-router";
import { UserRound, Info } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { I as Input } from "./input-D_U8fI25.js";
import { L as Label } from "./label-C8WJLhmR.js";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
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
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: id, className: "text-xs uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx(Input, { id, type, value, readOnly: true, className: "bg-surface-elevated" })
  ] });
}
function PerfilPage() {
  const {
    usuario
  } = rootRoute.useRouteContext();
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Perfil", subtitle: "Confira as informações vinculadas à sua conta." }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsx(UserRound, { className: "h-6 w-6 text-gold" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-medium", children: usuario?.nome ?? "Cliente" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Conta de cliente Studio RD" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsx(CampoPerfil, { id: "nome", label: "Nome", value: usuario?.nome ?? "" }),
        /* @__PURE__ */ jsx(CampoPerfil, { id: "email", label: "E-mail", type: "email", value: usuario?.email ?? "" }),
        /* @__PURE__ */ jsx(CampoPerfil, { id: "telefone", label: "Telefone", type: "tel", value: formatarTelefone(usuario?.telefone) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "dataNascimento", className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Data de nascimento" }),
          /* @__PURE__ */ jsx(Input, { id: "dataNascimento", value: "Ainda não cadastrada", readOnly: true, className: "bg-surface-elevated text-muted-foreground" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4", children: [
        /* @__PURE__ */ jsx(Info, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "A visualização já está conectada à sua conta. A edição dos dados será habilitada quando criarmos a função segura de atualização do perfil." })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "button", disabled: true, className: "mt-6", children: "Edição em breve" })
    ] })
  ] });
}
export {
  PerfilPage as component
};
