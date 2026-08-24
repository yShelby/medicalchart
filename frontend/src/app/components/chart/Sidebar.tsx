import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { Brain, Clock, Search } from "lucide-react";
import type { Patient, PatientStatus } from "./types";

interface SidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  listTab: PatientStatus;
  onListTabChange: (status: PatientStatus) => void;
  waitingCount: number;
  doneCount: number;
  patients: Patient[];
  selectedId: string | null;
  onSelectPatient: (id: string) => void;
}

export function Sidebar({
  search,
  onSearchChange,
  listTab,
  onListTabChange,
  waitingCount,
  doneCount,
  patients,
  selectedId,
  onSelectPatient,
}: SidebarProps) {
  const [calledIds, setCalledIds] = useState<Record<string, boolean>>({});

  function handleToggleCall(id: string, e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setCalledIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSelectKeyDown(id: string, e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectPatient(id);
    }
  }

  return (
    <aside className="w-60 border-r border-border flex flex-col shrink-0 bg-muted">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shrink-0">
            <Brain className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold leading-none text-[15px]">PsyChart</p>
            <p className="text-[11px] text-muted-foreground font-mono leading-tight">정신건강의학과</p>
          </div>
        </div>
        <div className="py-2">
          <p className="text-primary font-medium leading-tight text-[13px]">정소현(의사)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="환자 검색..."
            className="w-full pl-7 pr-3 py-1.5 text-[13px] border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* 진료대기 / 진료완료 tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["waiting", "done"] as PatientStatus[]).map((s) => {
          const label = s === "waiting" ? "진료대기" : "진료완료";
          const count = s === "waiting" ? waitingCount : doneCount;
          return (
            <button
              key={s}
              onClick={() => onListTabChange(s)}
              className={`flex-1 py-2 text-[12px] font-medium transition-colors border-b-2 ${listTab === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {label}
              <span className={`ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded-full ${listTab === s ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto">
        {patients.length === 0 && (
          <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">해당 환자 없음</p>
        )}
        {patients.map((p) => {
          const called = calledIds[p.id] ?? false;
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPatient(p.id)}
              onKeyDown={(e) => handleSelectKeyDown(p.id, e)}
              className={`w-full text-left px-3 py-3 border-b border-border/40 hover:bg-background/60 transition-colors cursor-pointer ${selectedId === p.id ? "bg-background border-l-2 border-l-primary" : ""}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-semibold">{p.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${p.gender === "남" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                    {p.gender} {p.age}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleToggleCall(p.id, e)}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${
                      called
                        ? "bg-muted-foreground/30 border-muted-foreground/40 text-foreground"
                        : "bg-muted border-border text-muted-foreground hover:bg-muted-foreground/10"
                    }`}
                  >
                    {called ? "호출중" : "호출"}
                  </button>
                </div>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">{p.id}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{p.primaryDx}</p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-border">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <Clock className="w-3 h-3" />
          <span>2026.08.06 오전 외래</span>
        </div>
      </div>
    </aside>
  );
}
