import { ChevronDown } from "lucide-react";
import type { Visit } from "./types";
import { RiskBadge } from "./RiskBadge";
import { Section } from "./Section";
import { parseMed } from "./medUtils";

export function VisitCard({ visit, expanded, onToggle }: { visit: Visit; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left"
      >
        <span className="font-mono text-[13px] font-semibold text-foreground w-28 shrink-0">{visit.date}</span>
        <span className="text-[13px] font-medium flex-1">{visit.cc}</span>
        {visit.risk && <RiskBadge level={visit.risk} />}
        <span className="text-[12px] text-muted-foreground font-mono ml-2">{visit.doctor}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Left: S + O */}
            <div className="p-4 space-y-4">
              <Section label="S — 주관적 소견" content={visit.s} />
              {visit.o.length > 0 && (
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">O — 객관적 소견</p>
                  <div className="space-y-1.5">
                    {visit.o.map((entry, i) => (
                      <div key={i} className="border border-border bg-background rounded px-2.5 py-1.5 flex items-start gap-2">
                        {entry.category && <span className="text-[11px] font-mono font-semibold text-foreground shrink-0 pt-0.5">{entry.category}</span>}
                        <span className="text-[13px] text-foreground leading-snug">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: A + P + 처방약물(gray boxes) + 특이사항 */}
            <div className="p-4 space-y-4">
              <Section label="A — 평가 / 진단" content={visit.a} />
              <Section label="P — 치료 계획" content={visit.p} />

              {/* 처방 약물 — gray boxes, vertical list */}
              {visit.meds.length > 0 && (
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">처방 약물</p>
                  <div className="space-y-1.5">
                    {visit.meds.map((m, i) => {
                      const { name, dose } = parseMed(m);
                      return (
                        <div key={i} className="border border-border bg-muted px-2.5 py-1.5 flex items-baseline gap-2">
                          <span className="text-[13px] font-mono font-semibold text-foreground">{name}</span>
                          {dose && <span className="text-[12px] font-mono text-muted-foreground">{dose}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 특이사항 */}
              {visit.notes && <Section label="특이사항" content={visit.notes} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
