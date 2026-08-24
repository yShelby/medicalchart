import { Plus } from "lucide-react";
import type { Visit } from "../types";
import { VisitCard } from "../VisitCard";
import { NewVisitForm } from "../NewVisitForm";

interface ChartTabProps {
  patientId: string;
  visits: Visit[];
  recording: boolean;
  onStartRecording: () => void;
  onCancelRecording: () => void;
  onSaveVisit: (visit: Visit) => void;
  expandedVisit: string | null;
  onToggleVisit: (id: string) => void;
}

export function ChartTab({
  patientId,
  visits,
  recording,
  onStartRecording,
  onCancelRecording,
  onSaveVisit,
  expandedVisit,
  onToggleVisit,
}: ChartTabProps) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold">진료기록 ({visits.length}건)</h2>
        {!recording && (
          <button onClick={onStartRecording} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[13px] px-3 py-1.5 rounded hover:bg-primary/90 transition-colors font-medium">
            <Plus className="w-3.5 h-3.5" />새 진료 기록
          </button>
        )}
      </div>

      {recording && <NewVisitForm patientId={patientId} onSave={onSaveVisit} onCancel={onCancelRecording} />}

      <div className="space-y-1">
        {visits.length === 0 && <div className="py-12 text-center text-muted-foreground text-[13px]">진료 기록이 없습니다.</div>}
        {visits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} expanded={expandedVisit === visit.id} onToggle={() => onToggleVisit(visit.id)} />
        ))}
      </div>
    </div>
  );
}
