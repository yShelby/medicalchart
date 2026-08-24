import { Pill } from "lucide-react";
import type { Visit } from "../types";
import { parseMed } from "../medUtils";

export function PrescriptionTab({ visits }: { visits: Visit[] }) {
  const entries = visits.flatMap((v) => v.meds.map((m, i) => ({ v, m, i })));

  return (
    <div className="p-5 max-w-2xl">
      <h2 className="text-[15px] font-semibold mb-3">정신과 처방 내역</h2>
      <div className="space-y-2">
        {entries.map(({ v, m, i }) => {
          const { name, dose } = parseMed(m);
          return (
            <div key={`${v.id}-${i}`} className="border border-border px-4 py-3 flex items-start gap-3 hover:bg-muted/40 transition-colors">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Pill className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-mono font-semibold">{name}</p>
                <p className="text-[12px] font-mono text-muted-foreground">{dose}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{v.date} 처방 · {v.doctor}</p>
              </div>
            </div>
          );
        })}
        {entries.length === 0 && <p className="text-[13px] text-muted-foreground py-8 text-center">처방 내역이 없습니다.</p>}
      </div>
    </div>
  );
}
