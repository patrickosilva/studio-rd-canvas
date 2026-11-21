import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Activity, AlertTriangle, CheckCircle2, CircleHelp, RefreshCw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminBuscarMonitoramento } from "@/lib/api/monitoramento.functions";

export const Route = createFileRoute("/admin/monitoramento")({
  component: MonitoramentoPage,
  head: () => ({ meta: [{ title: "Saúde do sistema · Studio RD" }] }),
});

type Estado = "OK" | "ATENCAO" | "FALHA" | "NAO_VERIFICADO";
type Verificacao = {
  id: string;
  nome: string;
  estado: Estado;
  resumo: string;
  detalhe: string;
  duracaoMs: number | null;
};
type Resposta = { verificadoEm: string; verificacoes: Verificacao[] };

const estilo: Record<Estado, string> = {
  OK: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  ATENCAO: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  FALHA: "text-red-400 border-red-500/30 bg-red-500/10",
  NAO_VERIFICADO: "text-muted-foreground border-border bg-muted/40",
};
const titulo: Record<Estado, string> = {
  OK: "Consulta OK",
  ATENCAO: "Atenção",
  FALHA: "Falha",
  NAO_VERIFICADO: "Não verificado",
};
const icones = {
  OK: CheckCircle2,
  ATENCAO: AlertTriangle,
  FALHA: XCircle,
  NAO_VERIFICADO: CircleHelp,
};

function MonitoramentoPage() {
  const buscar = useServerFn(adminBuscarMonitoramento);
  const [dados, setDados] = useState<Resposta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function atualizar() {
    setCarregando(true);
    setErro("");
    try {
      setDados(await buscar());
    } catch (e) {
      console.error("Falha ao carregar monitoramento", e);
      setErro("Não foi possível consultar o monitoramento. Verifique sua conexão e os logs do servidor.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { void atualizar(); }, []);

  const falhas = dados?.verificacoes.filter((v) => v.estado === "FALHA").length ?? 0;
  const atencoes = dados?.verificacoes.filter((v) => v.estado === "ATENCAO").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><Activity className="h-6 w-6 text-gold" /><h1 className="text-2xl font-semibold">Saúde do sistema</h1></div>
          <p className="mt-1 text-sm text-muted-foreground">Verificações de leitura, sem criar agendamentos, cobrar clientes ou alterar o banco.</p>
        </div>
        <Button onClick={() => void atualizar()} disabled={carregando} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${carregando ? "animate-spin" : ""}`} />{carregando ? "Verificando…" : "Verificar agora"}
        </Button>
      </div>
      {erro && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{erro}</p>}
      {dados && <>
        <Card><CardContent className="space-y-2 pt-5">
          <p className="font-medium">{falhas > 0 ? `${falhas} módulo(s) com falha na consulta` : atencoes > 0 ? "Nenhuma falha de consulta; há itens que exigem atenção" : "Nenhuma falha detectada nas consultas"}</p>
          <p className="text-sm text-muted-foreground">Última verificação: {new Date(dados.verificadoEm).toLocaleString("pt-BR")}. Resultados não comprovam que todos os fluxos de negócio funcionam.</p>
        </CardContent></Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dados.verificacoes.map((item) => {
            const Icone = icones[item.estado];
            return <Card key={item.id} className={item.estado === "FALHA" ? "border-red-500/40" : ""}>
              <CardHeader className="space-y-3 pb-2">
                <div className="flex items-start justify-between gap-3"><CardTitle className="text-base">{item.nome}</CardTitle><span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs ${estilo[item.estado]}`}><Icone className="h-3.5 w-3.5" />{titulo[item.estado]}</span></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">{item.resumo}</p>
                <p className="text-sm text-muted-foreground">{item.detalhe}</p>
                {item.duracaoMs !== null && <p className="text-xs text-muted-foreground">Tempo de consulta: {item.duracaoMs} ms</p>}
              </CardContent>
            </Card>;
          })}
        </div>
      </>}
      {!dados && !erro && <p className="text-sm text-muted-foreground">Consultando o estado dos módulos…</p>}
      <p className="text-xs text-muted-foreground">Acesso restrito ao administrador. Este painel é um diagnóstico sob demanda, não um monitor externo 24 horas. Se o servidor ficar totalmente fora do ar, a própria página poderá não abrir.</p>
    </div>
  );
}
