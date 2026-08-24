import { useState } from "react";
import { Brain } from "lucide-react";
import type { Patient, PatientStatus, Tab, Visit } from "./components/chart/types";
import { ASSESSMENTS, PATIENTS, VISITS } from "./components/chart/data";
import { Sidebar } from "./components/chart/Sidebar";
import { PatientHeader } from "./components/chart/PatientHeader";
import { AIPanelColumn } from "./components/chart/AIPanelColumn";
import { PatientInfoTab } from "./components/chart/tabs/PatientInfoTab";
import { ChartTab } from "./components/chart/tabs/ChartTab";
import { PrescriptionTab } from "./components/chart/tabs/PrescriptionTab";
import { AssessmentTab } from "./components/chart/tabs/AssessmentTab";

export default function App() {
  const [search, setSearch] = useState("");
  const [listTab, setListTab] = useState<PatientStatus>("waiting");
  const [selectedId, setSelectedId] = useState<string | null>("PT-240001");
  const [activeTab, setActiveTab] = useState<Tab>("chart");
  const [expandedVisit, setExpandedVisit] = useState<string | null>("V240728-001");
  const [recording, setRecording] = useState(false);
  const [visits, setVisits] = useState(VISITS);
  const [aiOpen, setAiOpen] = useState(true);
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);

  const query = search.toLowerCase();
  const allFiltered = patients.filter(
    (p) => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || p.primaryDx.toLowerCase().includes(query)
  );
  const waitingCount = allFiltered.filter((p) => p.status === "waiting").length;
  const doneCount = allFiltered.filter((p) => p.status === "done").length;
  const filtered = allFiltered.filter((p) => p.status === listTab);

  const patient = patients.find((p) => p.id === selectedId) ?? null;
  const patientVisits = selectedId ? (visits[selectedId] ?? []) : [];
  const assessments = selectedId ? (ASSESSMENTS[selectedId] ?? []) : [];

  function handleSelectPatient(id: string) {
    setSelectedId(id);
    setActiveTab("chart");
    setRecording(false);
    setExpandedVisit(null);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setRecording(false);
  }

  function handleSaveVisit(newVisit: Visit) {
    if (!selectedId) return;
    setVisits((prev) => ({ ...prev, [selectedId]: [newVisit, ...(prev[selectedId] ?? [])] }));
    setRecording(false);
    setExpandedVisit(newVisit.id);
  }

  function handleToggleStatus(id: string) {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "done" ? "waiting" : "done" } : p))
    );
  }

  return (
    <div className="flex h-screen w-full bg-background font-['DM_Sans',sans-serif] overflow-hidden text-foreground">
      <Sidebar
        search={search}
        onSearchChange={setSearch}
        listTab={listTab}
        onListTabChange={setListTab}
        waitingCount={waitingCount}
        doneCount={doneCount}
        patients={filtered}
        selectedId={selectedId}
        onSelectPatient={handleSelectPatient}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {patient ? (
          <>
            <PatientHeader
              patient={patient}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onToggleStatus={handleToggleStatus}
            />

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0">
                {activeTab === "info" && <PatientInfoTab patient={patient} />}

                {activeTab === "chart" && (
                  <ChartTab
                    visits={patientVisits}
                    recording={recording}
                    onStartRecording={() => setRecording(true)}
                    onCancelRecording={() => setRecording(false)}
                    onSaveVisit={handleSaveVisit}
                    expandedVisit={expandedVisit}
                    onToggleVisit={(id) => setExpandedVisit(expandedVisit === id ? null : id)}
                  />
                )}

                {activeTab === "rx" && <PrescriptionTab visits={patientVisits} />}

                {activeTab === "lab" && <AssessmentTab assessments={assessments} />}
              </div>

              <AIPanelColumn
                open={aiOpen}
                onToggle={() => setAiOpen((o) => !o)}
                patientId={selectedId}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Brain className="w-10 h-10 opacity-20" />
            <p className="text-[13px]">환자를 선택하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
