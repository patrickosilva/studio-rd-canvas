import{r as x,j as e}from"./index-B6X7s3yv.js";import{u as G}from"./useServerFn-oKYUM7c3.js";import{P as se}from"./Sidebar-9chU7aTq.js";import{h as re}from"./agendamento.functions-BLS-TD7-.js";import{a as oe}from"./assinatura.functions-BpO7bUsf.js";import{D as ie}from"./dollar-sign-BOidBfQJ.js";import{S as Q}from"./scissors-CwV1Hepd.js";import{C as W}from"./crown-CCONrFVV.js";import{T as ne}from"./trending-up-KkdH-DhF.js";import{R as U}from"./receipt-CSUitjgg.js";import{C as de}from"./circle-x-DWQro4Ij.js";import{c as J}from"./createLucideIcon-tAmKXPYE.js";import{F as ce}from"./file-chart-column-increasing-B9mIsGtr.js";import{C as le}from"./chart-column-CRPAj5Pc.js";import{C as me}from"./circle-check-DLTn5Bav.js";import{C as ue}from"./clock-Bpvl1EYn.js";import{C as xe}from"./calendar-clock-BzAHgYWH.js";import{W as pe}from"./wallet-BNLVxHMP.js";import{C as fe}from"./credit-card-33tMeA-X.js";import"./log-out-nyiPvsrK.js";const he=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],ge=J("download",he);const be=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],ve=J("printer",be);function We(){const a=G(re),s=G(oe),[r,m]=x.useState([]),[D,w]=x.useState([]),[g,p]=x.useState("semanaAtual"),[N,O]=x.useState(!0),[$,A]=x.useState("");async function c(){O(!0),A("");try{const[t,n]=await Promise.all([a(),s()]);m(t),w(n)}catch(t){console.error(t),A("Não foi possível carregar os dados financeiros.")}finally{O(!1)}}x.useEffect(()=>{c()},[]);const l=x.useMemo(()=>ye(g),[g]),y=x.useMemo(()=>r.filter(t=>q(t.inicio,l.inicio,l.fim)),[r,l]),h=x.useMemo(()=>r.filter(t=>t.status!=="CONCLUIDO"?!1:q(_(t),l.inicio,l.fim)),[r,l]),j=x.useMemo(()=>D.filter(t=>q(t.pagoEm,l.inicio,l.fim)),[D,l]),b=x.useMemo(()=>{const t=y.filter(f=>["SOLICITADO","CONFIRMADO"].includes(f.status)),n=y.filter(f=>["RECUSADO","CANCELADO_CLIENTE","CANCELADO_FUNCIONARIO","FALTOU"].includes(f.status)),o=h.reduce((f,i)=>f+S(i),0),u=j.reduce((f,i)=>f+i.valorCentavos,0),I=t.reduce((f,i)=>f+i.servico.precoCentavos,0),E=n.reduce((f,i)=>f+i.servico.precoCentavos,0),T=o+u,z=h.length+j.length,L=h.length>0?Math.round(o/h.length):0;return{totalAgendamentos:y.length,concluidos:h.length,previstos:t.length,perdidos:n.length,quantidadeAssinaturas:j.length,quantidadeRecebimentos:z,receitaAtendimentos:o,receitaAssinaturas:u,receitaRealizada:T,receitaPrevista:I,receitaPerdida:E,ticketMedio:L}},[y,h,j]),M=x.useMemo(()=>{const t=new Map;for(const n of h){const o=n.formaPagamento??"NAO_INFORMADO",u=t.get(o)??{formaPagamento:o,quantidade:0,valor:0};u.quantidade+=1,u.valor+=S(n),t.set(o,u)}for(const n of j){const o=n.formaPagamento,u=t.get(o)??{formaPagamento:o,quantidade:0,valor:0};u.quantidade+=1,u.valor+=n.valorCentavos,t.set(o,u)}return[...t.values()].sort((n,o)=>o.valor-n.valor)},[h,j]),V=x.useMemo(()=>Ce(l.inicio,l.fim).map(n=>{const o=h.filter(i=>k(_(i),n)),u=j.filter(i=>k(i.pagoEm,n)),I=y.filter(i=>["SOLICITADO","CONFIRMADO"].includes(i.status)&&k(i.inicio,n)),E=y.filter(i=>["RECUSADO","CANCELADO_CLIENTE","CANCELADO_FUNCIONARIO","FALTOU"].includes(i.status)&&k(i.inicio,n)),T=o.reduce((i,C)=>i+S(C),0),z=u.reduce((i,C)=>i+C.valorCentavos,0),L=I.reduce((i,C)=>i+C.servico.precoCentavos,0),f=E.reduce((i,C)=>i+C.servico.precoCentavos,0);return{data:n,label:Ne(n),atendimentos:o.length,assinaturas:u.length,previstos:I.length,receitaRealizada:T+z,receitaPrevista:L,receitaPerdida:f}}),[y,h,j,l]),P=x.useMemo(()=>{const t=h.map(o=>({id:`agendamento-${o.id}`,tipo:"ATENDIMENTO",data:_(o),titulo:o.servico.nome,cliente:o.cliente.nome,detalhe:`Profissional: ${o.profissional.nome}`,formaPagamento:o.formaPagamento,valorCentavos:S(o)})),n=j.map(o=>({id:`assinatura-${o.id}`,tipo:"ASSINATURA",data:o.pagoEm,titulo:`Assinatura ${o.assinatura.plano.nome}`,cliente:o.assinatura.cliente.nome,detalhe:o.observacao||`Plano com status ${o.assinatura.status}`,formaPagamento:o.formaPagamento,valorCentavos:o.valorCentavos}));return[...t,...n].sort((o,u)=>new Date(u.data).getTime()-new Date(o.data).getTime())},[h,j]),Y=x.useMemo(()=>P.slice(0,10),[P]),Z=[{label:"Hoje",value:"hoje"},{label:"Semana atual",value:"semanaAtual"},{label:"Últimos 7 dias",value:"ultimos7"},{label:"Mês atual",value:"mesAtual"}],ee=[{label:"Realizado",value:d(b.receitaRealizada),icon:ie,descricao:"Caixa recebido no período."},{label:"Atendimentos",value:d(b.receitaAtendimentos),icon:Q,descricao:"Serviços concluídos e pagos."},{label:"Assinaturas",value:d(b.receitaAssinaturas),icon:W,descricao:"Planos RD Black recebidos."},{label:"Previsto",value:d(b.receitaPrevista),icon:ne,descricao:"Solicitados e confirmados."},{label:"Ticket médio",value:d(b.ticketMedio),icon:U,descricao:"Média dos atendimentos pagos."},{label:"Perdido",value:d(b.receitaPerdida),icon:de,descricao:"Cancelamentos, recusas e faltas."}];function te(){Pe(P,l.rotulo)}function ae(){Re({periodo:l.rotulo,intervalo:X(l.inicio,l.fim),resumo:b,resumoPorDia:V,faturamentoPorPagamento:M,movimentos:P})}return e.jsxs("div",{className:"max-w-7xl p-8 lg:p-12",children:[e.jsx(se,{title:"Financeiro",subtitle:`Caixa do período: ${X(l.inicio,l.fim)}. Para histórico completo, use a aba Relatórios.`,actions:e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs("button",{type:"button",onClick:ae,disabled:P.length===0,className:"inline-flex h-10 items-center rounded-full border border-gold bg-gold-soft px-5 text-sm text-gold transition hover:bg-gold-soft/80 disabled:cursor-not-allowed disabled:opacity-50",children:[e.jsx(ve,{className:"mr-2 h-4 w-4"}),"Imprimir / PDF"]}),e.jsxs("button",{type:"button",onClick:te,disabled:P.length===0,className:"inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50",children:[e.jsx(ge,{className:"mr-2 h-4 w-4"}),"CSV"]}),e.jsxs("a",{href:"/admin/relatorios",className:"inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated",children:[e.jsx(ce,{className:"mr-2 h-4 w-4"}),"Ver relatório completo"]}),e.jsx("a",{href:"/admin/agenda",className:"inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated",children:"Ver agenda"})]})}),$&&e.jsx("div",{role:"alert",className:"mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",children:$}),e.jsx("div",{className:"mb-6 flex flex-wrap gap-2",children:Z.map(t=>{const n=g===t.value;return e.jsx("button",{type:"button",onClick:()=>p(t.value),className:`rounded-full border px-4 py-2 text-sm transition ${n?"border-gold bg-gold-soft text-gold":"border-border bg-surface text-muted-foreground hover:bg-surface-elevated"}`,children:t.label},t.value)})}),e.jsx("div",{className:"mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3",children:ee.map(t=>e.jsxs("section",{className:"rounded-2xl border border-border bg-surface p-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:t.label}),e.jsx(t.icon,{className:"h-4 w-4 text-gold"})]}),e.jsx("div",{className:"mt-3 text-2xl font-display",children:N?"...":t.value}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:t.descricao})]},t.label))}),e.jsxs("div",{className:"mb-8 grid gap-4 md:grid-cols-4",children:[e.jsxs("section",{className:"rounded-2xl border border-border bg-surface p-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"Agendamentos"}),e.jsx(le,{className:"h-4 w-4 text-gold"})]}),e.jsx("div",{className:"mt-3 text-3xl font-display",children:N?"...":b.totalAgendamentos}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"no período selecionado"})]}),e.jsxs("section",{className:"rounded-2xl border border-border bg-surface p-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"Concluídos"}),e.jsx(me,{className:"h-4 w-4 text-gold"})]}),e.jsx("div",{className:"mt-3 text-3xl font-display",children:N?"...":b.concluidos}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"atendimentos recebidos"})]}),e.jsxs("section",{className:"rounded-2xl border border-border bg-surface p-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"Em aberto"}),e.jsx(ue,{className:"h-4 w-4 text-gold"})]}),e.jsx("div",{className:"mt-3 text-3xl font-display",children:N?"...":b.previstos}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"solicitados ou confirmados"})]}),e.jsxs("section",{className:"rounded-2xl border border-border bg-surface p-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs uppercase tracking-widest text-muted-foreground",children:"Assinaturas"}),e.jsx(W,{className:"h-4 w-4 text-gold"})]}),e.jsx("div",{className:"mt-3 text-3xl font-display",children:N?"...":b.quantidadeAssinaturas}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"pagamentos de plano"})]})]}),e.jsxs("div",{className:"mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]",children:[e.jsxs("section",{className:"overflow-hidden rounded-2xl border border-border bg-surface",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-border px-6 py-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-sm font-medium",children:"Resumo diário do período"}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Ideal para fechar o caixa da semana sem olhar o histórico inteiro."})]}),e.jsx(xe,{className:"h-4 w-4 text-gold"})]}),N?e.jsx("div",{className:"px-6 py-8 text-sm text-muted-foreground",children:"Carregando resumo diário..."}):e.jsx("div",{className:"max-h-[520px] divide-y divide-border overflow-y-auto",children:V.map(t=>e.jsxs("article",{className:"grid gap-4 px-6 py-4 md:grid-cols-[1fr_auto_auto_auto]",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium",children:t.label}),e.jsxs("p",{className:"mt-1 text-xs text-muted-foreground",children:[t.atendimentos," atendimento",t.atendimentos===1?"":"s"," pago",t.atendimentos===1?"":"s"," ·"," ",t.assinaturas," assinatura",t.assinaturas===1?"":"s"]})]}),e.jsxs("div",{className:"text-sm",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Realizado"}),e.jsx("p",{className:"font-medium",children:d(t.receitaRealizada)})]}),e.jsxs("div",{className:"text-sm",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Previsto"}),e.jsx("p",{className:"font-medium",children:d(t.receitaPrevista)})]}),e.jsxs("div",{className:"text-sm",children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Perdido"}),e.jsx("p",{className:"font-medium",children:d(t.receitaPerdida)})]})]},t.data.toISOString()))})]}),e.jsxs("section",{className:"overflow-hidden rounded-2xl border border-border bg-surface",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-border px-6 py-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-sm font-medium",children:"Formas de pagamento"}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Atendimentos pagos e assinaturas recebidas."})]}),e.jsx(pe,{className:"h-4 w-4 text-gold"})]}),N?e.jsx("div",{className:"px-6 py-8 text-sm text-muted-foreground",children:"Carregando pagamentos..."}):M.length===0?e.jsx("div",{className:"px-6 py-8 text-sm text-muted-foreground",children:"Nenhum pagamento registrado no período."}):e.jsx("div",{className:"divide-y divide-border",children:M.map(t=>e.jsxs("article",{className:"flex items-center justify-between gap-4 px-6 py-4",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"flex items-center gap-2 font-medium",children:[e.jsx(fe,{className:"h-4 w-4 text-gold"}),R(t.formaPagamento)]}),e.jsxs("p",{className:"mt-1 text-sm text-muted-foreground",children:[t.quantidade," recebimento",t.quantidade===1?"":"s"]})]}),e.jsx("p",{className:"text-right font-display",children:d(t.valor)})]},t.formaPagamento))})]})]}),e.jsxs("section",{className:"mb-8 overflow-hidden rounded-2xl border border-border bg-surface",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-border px-6 py-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-sm font-medium",children:"Últimos recebimentos do período"}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Lista curta para conferência rápida do caixa."})]}),e.jsx(U,{className:"h-4 w-4 text-gold"})]}),N?e.jsx("div",{className:"px-6 py-10",children:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Carregando movimentações..."})}):Y.length===0?e.jsxs("div",{className:"flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center",children:[e.jsx(U,{className:"h-10 w-10 text-muted-foreground"}),e.jsx("h3",{className:"mt-4 text-lg font-display",children:"Nenhum recebimento no período"}),e.jsx("p",{className:"mt-2 max-w-md text-sm text-muted-foreground",children:"Quando houver atendimento concluído ou assinatura paga, o movimento aparecerá aqui."})]}):e.jsx("div",{className:"divide-y divide-border",children:Y.map(t=>e.jsx("article",{className:"px-6 py-5",children:e.jsxs("div",{className:"flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx("h3",{className:"font-medium",children:t.titulo}),e.jsx("span",{className:"rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground",children:t.tipo==="ASSINATURA"?"Assinatura":"Atendimento"})]}),e.jsxs("div",{className:"mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3",children:[e.jsx("p",{children:B(t.data)}),e.jsxs("p",{children:["Cliente: ",t.cliente]}),e.jsx("p",{children:t.detalhe})]}),e.jsxs("p",{className:"mt-2 text-xs text-muted-foreground",children:["Pagamento:"," ",R(t.formaPagamento)]})]}),e.jsxs("div",{className:"text-left lg:text-right",children:[e.jsx("p",{className:"text-lg font-display",children:d(t.valorCentavos)}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"recebido"})]})]})},t.id))})]}),e.jsx("section",{className:"rounded-2xl border border-border bg-surface p-5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(Q,{className:"h-5 w-5 text-gold"}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-sm font-medium",children:"Regra atual do financeiro"}),e.jsx("p",{className:"mt-1 text-sm text-muted-foreground",children:"Esta tela funciona como caixa do período. Atendimento concluído entra pelo valor recebido. Assinatura entra no dia do pagamento. Solicitações e confirmações entram como previsão. Cancelamentos, recusas e faltas entram como perda estimada. Para análise histórica completa, use a aba Relatórios."})]})]})})]})}function _(a){return a.pagoEm??a.inicio}function S(a){return a.valorPagoCentavos??a.servico.precoCentavos}function d(a){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(a/100)}function B(a){const s=new Date(a);return new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(s)}function Ne(a){const s=new Date(a);return new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"}).format(s)}function R(a){const s={PIX:"Pix",DINHEIRO:"Dinheiro",CARTAO_DEBITO:"Cartão de débito",CARTAO_CREDITO:"Cartão de crédito",ASSINATURA:"Assinatura RD Black",CORTESIA:"Cortesia",OUTRO:"Outro",NAO_INFORMADO:"Não informado"};return a?s[a]??a:"Não informado"}function F(a){const s=new Date(a);return s.setHours(0,0,0,0),s}function H(a){const s=new Date(a);return s.setHours(23,59,59,999),s}function K(a){const s=F(a),r=s.getDay(),m=r===0?-6:1-r;return s.setDate(s.getDate()+m),s}function je(a){const s=K(a),r=new Date(s);return r.setDate(s.getDate()+6),r.setHours(23,59,59,999),r}function De(a){return new Date(a.getFullYear(),a.getMonth(),1)}function Ae(a){return new Date(a.getFullYear(),a.getMonth()+1,0,23,59,59,999)}function ye(a){const s=new Date;if(a==="hoje")return{inicio:F(s),fim:H(s),rotulo:"Hoje"};if(a==="ultimos7"){const r=F(s);return r.setDate(r.getDate()-6),{inicio:r,fim:H(s),rotulo:"Últimos 7 dias"}}return a==="mesAtual"?{inicio:De(s),fim:Ae(s),rotulo:"Mês atual"}:{inicio:K(s),fim:je(s),rotulo:"Semana atual"}}function q(a,s,r){const m=new Date(a);return m>=s&&m<=r}function k(a,s){const r=new Date(a);return r.getFullYear()===s.getFullYear()&&r.getMonth()===s.getMonth()&&r.getDate()===s.getDate()}function Ce(a,s){const r=[],m=F(a),D=H(s);for(;m<=D&&r.length<=40;)r.push(new Date(m)),m.setDate(m.getDate()+1);return r}function X(a,s){const r=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});return`${r.format(a)} até ${r.format(s)}`}function we(a){return`"${(a==null?"":String(a)).replace(/"/g,'""')}"`}function Pe(a,s){const m=[["Período","Tipo","Data","Cliente","Descrição","Detalhe","Forma de pagamento","Valor"],...a.map(p=>[s,p.tipo,B(p.data),p.cliente,p.titulo,p.detalhe,R(p.formaPagamento),d(p.valorCentavos)])].map(p=>p.map(we).join(";")).join(`
`),D=new Blob([`\uFEFF${m}`],{type:"text/csv;charset=utf-8;"}),w=URL.createObjectURL(D),g=document.createElement("a");g.href=w,g.download=`financeiro-${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(g),g.click(),document.body.removeChild(g),URL.revokeObjectURL(w)}function v(a){return(a==null?"":String(a)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Re({periodo:a,intervalo:s,resumo:r,resumoPorDia:m,faturamentoPorPagamento:D,movimentos:w}){const g=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date),p=m.map(c=>`
        <tr>
          <td>${v(c.label)}</td>
          <td>${c.atendimentos}</td>
          <td>${c.assinaturas}</td>
          <td>${d(c.receitaRealizada)}</td>
          <td>${d(c.receitaPrevista)}</td>
          <td>${d(c.receitaPerdida)}</td>
        </tr>
      `).join(""),N=D.map(c=>`
        <tr>
          <td>${v(R(c.formaPagamento))}</td>
          <td>${c.quantidade}</td>
          <td>${d(c.valor)}</td>
        </tr>
      `).join(""),O=w.slice(0,25).map(c=>`
        <tr>
          <td>${v(B(c.data))}</td>
          <td>${v(c.tipo==="ASSINATURA"?"Assinatura":"Atendimento")}</td>
          <td>${v(c.cliente)}</td>
          <td>${v(c.titulo)}</td>
          <td>${v(R(c.formaPagamento))}</td>
          <td>${d(c.valorCentavos)}</td>
        </tr>
      `).join(""),$=`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Relatório financeiro - ${v(a)}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 32px;
            background: #ffffff;
            color: #111111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            line-height: 1.45;
          }

          .cabecalho {
            border-bottom: 3px solid #111111;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }

          .marca {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 0.02em;
          }

          .subtitulo {
            margin-top: 6px;
            color: #555555;
            font-size: 15px;
          }

          .periodo {
            margin-top: 16px;
            padding: 12px 14px;
            border: 1px solid #dddddd;
            border-radius: 10px;
            background: #f7f7f7;
            font-size: 15px;
          }

          h1 {
            margin: 0;
            font-size: 24px;
          }

          h2 {
            margin: 28px 0 12px;
            font-size: 18px;
            border-bottom: 1px solid #dddddd;
            padding-bottom: 6px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 18px;
          }

          .card {
            border: 1px solid #dddddd;
            border-radius: 12px;
            padding: 14px;
            background: #fafafa;
          }

          .card-label {
            color: #555555;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .card-value {
            margin-top: 8px;
            font-size: 22px;
            font-weight: 800;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            page-break-inside: auto;
          }

          th {
            background: #111111;
            color: #ffffff;
            text-align: left;
            font-size: 12px;
            padding: 9px;
          }

          td {
            border-bottom: 1px solid #dddddd;
            padding: 9px;
            vertical-align: top;
          }

          tr {
            page-break-inside: avoid;
          }

          .observacao {
            margin-top: 24px;
            padding: 14px;
            border: 1px solid #dddddd;
            border-radius: 10px;
            background: #f7f7f7;
            color: #444444;
          }

          .rodape {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #dddddd;
            color: #666666;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 18mm;
            }

            button {
              display: none;
            }

            .no-print {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <section class="cabecalho">
          <div class="marca">Studio RD</div>
          <h1>Relatório financeiro do período</h1>

          <div class="subtitulo">
            Documento simples para conferência de caixa, impressão ou PDF.
          </div>

          <div class="periodo">
            <strong>Período:</strong> ${v(a)}<br />
            <strong>Intervalo:</strong> ${v(s)}<br />
            <strong>Gerado em:</strong> ${v(g)}
          </div>
        </section>

        <section>
          <h2>Resumo financeiro</h2>

          <div class="grid">
            <div class="card">
              <div class="card-label">Receita realizada</div>
              <div class="card-value">${d(r.receitaRealizada)}</div>
            </div>

            <div class="card">
              <div class="card-label">Atendimentos</div>
              <div class="card-value">${d(r.receitaAtendimentos)}</div>
            </div>

            <div class="card">
              <div class="card-label">Assinaturas</div>
              <div class="card-value">${d(r.receitaAssinaturas)}</div>
            </div>

            <div class="card">
              <div class="card-label">Receita prevista</div>
              <div class="card-value">${d(r.receitaPrevista)}</div>
            </div>

            <div class="card">
              <div class="card-label">Ticket médio</div>
              <div class="card-value">${d(r.ticketMedio)}</div>
            </div>

            <div class="card">
              <div class="card-label">Perdas estimadas</div>
              <div class="card-value">${d(r.receitaPerdida)}</div>
            </div>
          </div>
        </section>

        <section>
          <h2>Resumo por dia</h2>

          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Atend.</th>
                <th>Assin.</th>
                <th>Realizado</th>
                <th>Previsto</th>
                <th>Perdido</th>
              </tr>
            </thead>

            <tbody>
              ${p}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Formas de pagamento</h2>

          <table>
            <thead>
              <tr>
                <th>Forma</th>
                <th>Qtd.</th>
                <th>Valor</th>
              </tr>
            </thead>

            <tbody>
              ${N||'<tr><td colspan="3">Nenhum pagamento registrado.</td></tr>'}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Recebimentos do período</h2>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Pagamento</th>
                <th>Valor</th>
              </tr>
            </thead>

            <tbody>
              ${O||'<tr><td colspan="6">Nenhum recebimento registrado.</td></tr>'}
            </tbody>
          </table>
        </section>

        <section class="observacao">
          <strong>Regra do relatório:</strong><br />
          Atendimentos concluídos entram pelo valor recebido. Assinaturas entram no dia do pagamento.
          Solicitações e confirmações aparecem como receita prevista. Cancelamentos, recusas e faltas
          aparecem como perda estimada.
        </section>

        <footer class="rodape">
          Relatório gerado pelo sistema Studio RD.
        </footer>

        <script>
          window.addEventListener("load", () => {
            window.print();
          });
        <\/script>
      </body>
    </html>
  `,A=window.open("","_blank");if(!A){alert("Não foi possível abrir o relatório. Verifique se o navegador bloqueou pop-ups.");return}A.document.open(),A.document.write($),A.document.close()}export{We as component};
