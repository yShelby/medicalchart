import { AlertTriangle, FileText, Pill, TestTube, User } from "lucide-react";
import type { Patient, Tab } from "./types";

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "info", label: "기본정보", icon: User },
  { id: "chart", label: "진료기록", icon: FileText },
  { id: "rx", label: "처방전", icon: Pill },
  { id: "lab", label: "심리평가", icon: TestTube },
];

export function PatientHeader({
  patient,
  activeTab,
  onTabChange,
  onToggleStatus,
}: {
  patient: Patient;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onToggleStatus: (id: string) => void;
}) {
  const isDone = patient.status === "done";

  return (
    <header className="border-b border-border bg-background shrink-0">
      <div className="px-5 pt-3 pb-0">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[13px] font-semibold text-primary">{patient.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[15px] font-semibold">{patient.name}</h1>
              <span className="font-mono text-[12px] text-muted-foreground">{patient.id}</span>
              <span className="font-mono text-[12px] text-muted-foreground">생년월일 {patient.dob}</span>
              <span className={`text-[12px] font-mono px-2 py-0.5 rounded-full border ${patient.gender === "남" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-pink-200 text-pink-700 bg-pink-50"}`}>
                {patient.gender} · {patient.age}세
              </span>
              {patient.allergies.length > 0 && (
                <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-[12px] text-red-600 font-medium">{patient.allergies.join(" / ")}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-[12px] text-muted-foreground">{patient.phone}</span>
              <span className="text-[12px] text-muted-foreground">{patient.insurance}</span>
              <span className="text-[12px] text-muted-foreground">보호자 {patient.guardian}</span>
              <span className="text-[12px] text-muted-foreground">최근 방문 {patient.lastVisit}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleStatus(patient.id)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded border shrink-0 transition-all duration-150 ${
              isDone
                ? "bg-muted-foreground/25 border-muted-foreground/40 text-foreground shadow-inner"
                : "bg-muted border-border text-foreground shadow-md active:shadow-inner"
            }`}
          >
            {isDone ? "진료대기" : "진료완료"}
          </button>
        </div>
        {/* Tabs */}
        <div className="flex items-center">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
