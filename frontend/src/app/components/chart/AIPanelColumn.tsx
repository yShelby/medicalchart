import { Brain, Sparkles, X } from "lucide-react";
import { AIChatPanel } from "./AIChatPanel";

export function AIPanelColumn({
  open,
  onToggle,
  patientId,
}: {
  open: boolean;
  onToggle: () => void;
  patientId: string | null;
}) {
  return (
    <div className={`flex flex-col shrink-0 border-l border-border transition-all duration-300 ${open ? "w-80" : "w-auto"}`}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2.5 border-b border-border text-[13px] font-medium whitespace-nowrap transition-colors shrink-0 ${open ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-accent"}`}
      >
        <Brain className="w-3.5 h-3.5 shrink-0" />
        {open && (
          <>
            <span className="flex-1">AI 어시스턴트</span>
            <Sparkles className="w-3 h-3 opacity-70" />
            <X className="w-3.5 h-3.5 ml-1 opacity-70" />
          </>
        )}
        {!open && <Sparkles className="w-3 h-3 opacity-70" />}
      </button>

      {open && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <AIChatPanel patientId={patientId} />
        </div>
      )}
    </div>
  );
}
