import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import type { ObjectiveEntry, Visit } from "./types";
import { RISK_LABELS } from "./RiskBadge";
import { AutoListTextarea } from "./AutoListTextarea";
import { RealtimeSttPanel } from "./RealtimeSttPanel";
import { mergeAiChartIntoForm } from "./mergeAiChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/navigation";
import { useVoiceChartSocket } from "../../lib/useVoiceChartSocket";

const emptyForm = {
  cc: "", s: "", o: [] as ObjectiveEntry[],
  a: "", p: "", risk: null as Visit["risk"],
  notes: "", dx: "", meds: "",
};

const OBJECTIVE_CATEGORIES = ["기분", "정동", "사고", "지각/환각", "병식"];

export function NewVisitForm({
  onSave,
  onCancel,
  patientId,
}: {
  onSave: (visit: Visit) => void;
  onCancel: () => void;
  patientId: string;
}) {
  const [form, setForm] = useState(emptyForm);
  const [objCategory, setObjCategory] = useState("");
  const [objValue, setObjValue] = useState("");
  const [formTab, setFormTab] = useState<"soap" | "stt">("soap");
  const voice = useVoiceChartSocket();

  useEffect(() => {
    return () => voice.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addObjectiveEntry() {
    if (!objValue.trim()) return;
    setForm((f) => ({ ...f, o: [...f.o, { category: objCategory, value: objValue.trim() }] }));
    setObjCategory("");
    setObjValue("");
  }

  function removeObjectiveEntry(index: number) {
    setForm((f) => ({ ...f, o: f.o.filter((_, i) => i !== index) }));
  }

  function handleCancel() {
    voice.cancel();
    onCancel();
  }

  async function handleStartRecording() {
    setFormTab("stt");
    await voice.start(patientId);
  }

  async function handleStopRecording() {
    const chart = await voice.stop();
    if (chart) {
      setForm((f) => mergeAiChartIntoForm(f, chart));
    }
    setFormTab("soap");
  }

  function handleSave() {
    if (!form.cc.trim()) return;
    const dateStr = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");
    const newVisit: Visit = {
      id: `V${Date.now()}`, date: dateStr, doctor: "정소현(의사)",
      cc: form.cc, s: form.s, o: form.o,
      a: form.a, p: form.p, risk: form.risk,
      notes: form.notes || undefined,
      dx: form.dx.split("\n").filter(Boolean),
      meds: form.meds.split("\n").filter(Boolean),
    };
    onSave(newVisit);
    setForm(emptyForm);
    setObjCategory("");
    setObjValue("");
  }

  return (
    <div className="border-2 border-primary mb-4">
      <div className="flex items-center justify-between px-4 py-2.5 bg-primary text-primary-foreground">
        <span className="text-[13px] font-semibold font-mono uppercase tracking-wider">새 진료 기록 — {new Date().toLocaleDateString("ko-KR")}</span>
        <div className="flex items-center gap-2">
          {!voice.isRecording ? (
            <button
              onClick={handleStartRecording}
              title="음성 인식 AI로 차트 기록하기"
              className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded border border-primary-foreground/30 hover:bg-primary-foreground/10"
            >
              🎙️ AI Scribe
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              title="녹음을 종료하고 SOAP 차트에 반영합니다"
              className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded border border-red-400/60 bg-red-500/10 text-red-100 animate-pulse"
            >
              🔴 기록 종료
            </button>
          )}
          <button onClick={handleCancel}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
        </div>
      </div>

      <Tabs value={formTab} onValueChange={(v) => setFormTab(v as "soap" | "stt")}>
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="soap">SOAP 진료 차트</TabsTrigger>
          <TabsTrigger value="stt">실시간 기록</TabsTrigger>
        </TabsList>

        <TabsContent value="stt">
          <RealtimeSttPanel isRecording={voice.isRecording} transcript={voice.transcript} error={voice.error} />
        </TabsContent>

        <TabsContent value="soap">
          <div className="p-4 space-y-4">
            {/* CC */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">주 호소 (Chief Complaint) *</label>
              <input value={form.cc} onChange={(e) => setForm((f) => ({ ...f, cc: e.target.value }))} placeholder="예: 우울감 지속, 수면 장애, 환청..." className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-background rounded" />
            </div>

            {/* S + O */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">S — 주관적 소견</label>
                <AutoListTextarea
                  value={form.s}
                  onChange={(v) => setForm((f) => ({ ...f, s: v }))}
                  placeholder={"기분, 수면, 식욕, 자살사고, 증상 변화...\n('- ' 입력 시 자동 리스트)"}
                  rows={4}
                  className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">O — 객관적 소견</label>
                <div className="flex gap-1.5 mb-2">
                  <select
                    value={objCategory}
                    onChange={(e) => setObjCategory(e.target.value)}
                    className="text-[12px] font-mono border border-border rounded px-1.5 py-1 bg-background hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
                  >
                    <option value="">+ 카테고리</option>
                    {OBJECTIVE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    value={objValue}
                    onChange={(e) => setObjValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addObjectiveEntry(); }
                    }}
                    placeholder="소견 내용 입력..."
                    className="flex-1 min-w-0 border border-border px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-background rounded"
                  />
                  <button
                    type="button"
                    onClick={addObjectiveEntry}
                    className="shrink-0 border border-border rounded px-2 text-foreground hover:bg-muted cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {form.o.map((entry, i) => (
                    <div key={i} className="border border-border bg-background rounded px-2.5 py-1.5 flex items-start gap-2">
                      {entry.category && <span className="text-[11px] font-mono font-semibold text-foreground shrink-0 pt-0.5">{entry.category}</span>}
                      <span className="text-[13px] text-foreground leading-snug flex-1">{entry.value}</span>
                      <button onClick={() => removeObjectiveEntry(i)} className="shrink-0 text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {form.o.length === 0 && <p className="text-[12px] text-muted-foreground py-1">등록된 소견이 없습니다.</p>}
                </div>
              </div>
            </div>

            {/* A + P */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">A — 평가 / 진단</label>
                <textarea value={form.a} onChange={(e) => setForm((f) => ({ ...f, a: e.target.value }))} placeholder="DSM-5 진단, 임상 인상..." rows={3} className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded" />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">P — 치료 계획</label>
                <AutoListTextarea
                  value={form.p}
                  onChange={(v) => setForm((f) => ({ ...f, p: v }))}
                  placeholder={"약물 조정, 심리치료, 추적 계획...\n('- ' 입력 시 자동 리스트)"}
                  rows={3}
                  className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded"
                />
              </div>
            </div>

            {/* 처방약물 + 진단코드 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">처방 약물 (줄바꿈으로 구분)</label>
                <textarea value={form.meds} onChange={(e) => setForm((f) => ({ ...f, meds: e.target.value }))} placeholder={"에스시탈로프람 20mg 1T qd\n미르타자핀 15mg 1T qhs"} rows={4} className="w-full border border-border px-2 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded" />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">진단 코드 (줄바꿈으로 구분)</label>
                <textarea value={form.dx} onChange={(e) => setForm((f) => ({ ...f, dx: e.target.value }))} placeholder={"F33.1 주요우울장애\nF41.1 범불안장애"} rows={4} className="w-full border border-border px-2 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded" />
              </div>
            </div>

            {/* 특이사항 */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">특이사항</label>
              <AutoListTextarea
                value={form.notes}
                onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                placeholder={"보호자 면담, 안전계획, 입원 논의, 기타 임상 메모...\n('- ' 입력 시 자동 리스트)"}
                rows={2}
                className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded"
              />
            </div>

            {/* Risk */}
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">자살위험도</label>
              {(["low", "moderate", "high"] as const).map((r) => (
                <button key={r} onClick={() => setForm((f) => ({ ...f, risk: f.risk === r ? null : r }))} className={`text-[13px] px-3 py-1 rounded border font-mono transition-colors ${form.risk === r ? r === "low" ? "bg-green-100 border-green-400 text-green-800" : r === "moderate" ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-red-100 border-red-400 text-red-800" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {RISK_LABELS[r]}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <button onClick={handleCancel} className="text-[13px] px-4 py-1.5 border border-border rounded hover:bg-muted">취소</button>
              <button onClick={handleSave} disabled={!form.cc.trim()} className="flex items-center gap-1.5 text-[13px] bg-primary text-primary-foreground px-4 py-1.5 rounded hover:bg-primary/90 font-medium disabled:opacity-40">
                <Save className="w-3.5 h-3.5" />저장
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
