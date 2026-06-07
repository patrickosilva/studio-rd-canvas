import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/admin/agenda")({ component: Page });

const hours = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
const days = ["Seg","Ter","Qua","Qui","Sex","Sáb"];
const booked: Record<string,string> = { "0-09:00":"Lucas P.","1-10:00":"André S.","2-13:00":"Felipe T.","3-15:00":"Marcos R.","4-17:00":"Diego A.","5-11:00":"João V." };

function Page() {
  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        title="Agenda"
        subtitle="Semana de 09 a 14 de junho"
        actions={
          <>
            <div className="flex bg-surface rounded-full p-1 border border-border">
              <button className="px-4 h-8 rounded-full text-xs text-muted-foreground">Mês</button>
              <button className="px-4 h-8 rounded-full text-xs bg-gold text-gold-foreground font-medium">Semana</button>
              <button className="px-4 h-8 rounded-full text-xs text-muted-foreground">Dia</button>
            </div>
            <button className="h-10 px-5 rounded-full bg-gold text-gold-foreground text-sm font-medium">+ Agendar</button>
          </>
        }
      />
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] text-xs">
          <div className="bg-surface-elevated p-3" />
          {days.map((d,i)=>(<div key={i} className="bg-surface-elevated p-3 text-center font-medium border-l border-border">{d}<div className="text-muted-foreground font-normal">{9+i}</div></div>))}
          {hours.map((h)=>(
            <Fragment key={h}>
              <div className="p-3 text-muted-foreground border-t border-border">{h}</div>
              {days.map((_,d)=>{
                const key = `${d}-${h}`; const ev = booked[key];
                return (
                  <div key={key} className="border-t border-l border-border min-h-14 p-1.5">
                    {ev && <div className="h-full rounded-md bg-gold-soft border border-gold/30 px-2 py-1.5 text-xs"><div className="text-gold font-medium">{ev}</div><div className="text-muted-foreground">Corte + Barba</div></div>}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
