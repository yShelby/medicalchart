import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import type { ObjectiveEntry, Visit } from "./types";
import { RISK_LABELS } from "./RiskBadge";
import { AutoListTextarea } from "./AutoListTextarea";
import { RealtimeSttPanel } from "./RealtimeSttPanel";
import { markAiContentReviewed, mergeAiChartIntoForm, resetAiReviewNote } from "./mergeAiChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/overlay";
import { useVoiceChartSocket } from "../../lib/useVoiceChartSocket";

const chromeTabTriggerClass =
  "flex-none h-auto rounded-t-lg rounded-b-none px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors border border-b-0 border-transparent data-[state=inactive]:text-white/70 data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-border data-[state=active]:shadow-none";

const emptyForm = {
  cc: "", s: "", o: [] as ObjectiveEntry[],
  a: "", p: "", risk: null as Visit["risk"],
  notes: "", dx: "", meds: "",
};

const OBJECTIVE_CATEGORIES = ["기분", "정동", "사고", "지각/환각", "병식"];

const DOCTOR_NAME = "정소현";
const DOCTOR_LICENSE_NO = "12345";
// 실제 인증 시스템 연동 전 데모용 고정 PIN — 프로젝트 전체가 아직 mock 데이터 단계.
const DEMO_APPROVAL_PIN = "1234";

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
  const [sttTabUnlocked, setSttTabUnlocked] = useState(false);
  const [hasUsedAiScribe, setHasUsedAiScribe] = useState(false);
  const [aiReviewed, setAiReviewed] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalPin, setApprovalPin] = useState("");
  const [approvalPinError, setApprovalPinError] = useState<string | null>(null);
  const voice = useVoiceChartSocket();

  useEffect(() => {
    return () => voice.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 승인(전자서명) 완료 후 의사가 차트 내용을 직접 수정하면 그 서명은 더 이상 유효하지
  // 않으므로, 저장 버튼을 승인 버튼으로 되돌리고 (AI Scribe를 썼다면) AI 검토도 다시
  // 요구한다. handleStartRecording/handleAiReviewConfirm 등 승인 플로우 자체가 만드는
  // 내부 변경에는 적용하지 않고, 의사가 입력 필드를 직접 편집하는 지점에만 사용한다.
  function updateForm(updater: (f: typeof form) => typeof form) {
    const wasSignedOff = signedOff;
    if (wasSignedOff) {
      setSignedOff(false);
      if (hasUsedAiScribe) setAiReviewed(false);
    }
    setForm((f) => {
      const next = updater(f);
      return wasSignedOff && hasUsedAiScribe ? { ...next, notes: resetAiReviewNote(next.notes) } : next;
    });
  }

  function addObjectiveEntry() {
    if (!objValue.trim()) return;
    updateForm((f) => ({ ...f, o: [...f.o, { category: objCategory, value: objValue.trim() }] }));
    setObjCategory("");
    setObjValue("");
  }

  function removeObjectiveEntry(index: number) {
    updateForm((f) => ({ ...f, o: f.o.filter((_, i) => i !== index) }));
  }

  function handleCancel() {
    voice.cancel();
    onCancel();
  }

  async function handleStartRecording() {
    setSttTabUnlocked(true);
    setHasUsedAiScribe(true);
    // 이미 검토·승인을 마친 뒤 추가 녹음을 시작하는 경우, 새로 녹음될 내용에 대해
    // 검토/승인을 다시 받도록 강제한다.
    setAiReviewed(false);
    setSignedOff(false);
    setForm((f) => ({ ...f, notes: resetAiReviewNote(f.notes) }));
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

  function handleAiReviewConfirm() {
    setAiReviewed(true);
    setForm((f) => ({ ...f, notes: markAiContentReviewed(f.notes) }));
  }

  function handleApprovalPinSubmit(e: React.MouseEvent) {
    if (approvalPin !== DEMO_APPROVAL_PIN) {
      e.preventDefault();
      setApprovalPinError("PIN 번호가 일치하지 않습니다.");
      return;
    }
    setSignedOff(true);
  }

  function handleSave() {
    if (!form.cc.trim()) return;
    const dateStr = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");
    const newVisit: Visit = {
      id: `V${Date.now()}`, date: dateStr, doctor: `${DOCTOR_NAME}(의사)`,
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
    setSttTabUnlocked(false);
    setFormTab("soap");
    setHasUsedAiScribe(false);
    setAiReviewed(false);
    setSignedOff(false);
  }

  return (
    <div className="border-2 border-primary mb-4">
      <Tabs value={formTab} onValueChange={(v) => setFormTab(v as "soap" | "stt")}>
        <div className="bg-primary text-primary-foreground">
          <div className="flex items-end justify-between gap-4 px-4 pt-2.5">
            <TabsList className="bg-transparent p-0 h-auto gap-1 rounded-none inline-flex items-end shrink min-w-0">
              <TabsTrigger value="soap" className={chromeTabTriggerClass}>
                <span className="font-mono uppercase tracking-wider">새 진료 기록 — {new Date().toLocaleDateString("ko-KR")}</span>
              </TabsTrigger>
              {sttTabUnlocked && (
                <TabsTrigger value="stt" className={chromeTabTriggerClass}>실시간 기록</TabsTrigger>
              )}
            </TabsList>

            <div className="flex items-center gap-2 pb-2.5 shrink-0">
              {!voice.isRecording ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleStartRecording}
                      className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded border border-primary-foreground/30 hover:bg-primary-foreground/10"
                    >
                      🎙️ AI Scribe
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>음성 인식 AI로 차트 기록하기</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={handleStopRecording}
                  title="녹음을 종료하고 SOAP 차트에 반영합니다"
                  className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded border-2 border-red-500 text-white hover:bg-primary-foreground/10"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="animate-pulse">기록중...</span>
                </button>
              )}
              <button onClick={handleCancel}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
            </div>
          </div>
        </div>

        {sttTabUnlocked && (
          <TabsContent value="stt">
            <RealtimeSttPanel isRecording={voice.isRecording} transcript={voice.transcript} error={voice.error} />
          </TabsContent>
        )}

        <TabsContent value="soap">
          <div className="p-4 space-y-4">
            {/* CC */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">주 호소 (Chief Complaint) *</label>
              <input value={form.cc} onChange={(e) => updateForm((f) => ({ ...f, cc: e.target.value }))} placeholder="예: 우울감 지속, 수면 장애, 환청..." className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-background rounded" />
            </div>

            {/* S + O */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">S — 주관적 소견</label>
                <AutoListTextarea
                  value={form.s}
                  onChange={(v) => updateForm((f) => ({ ...f, s: v }))}
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
                <textarea value={form.a} onChange={(e) => updateForm((f) => ({ ...f, a: e.target.value }))} placeholder="DSM-5 진단, 임상 인상..." rows={3} className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded" />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">P — 치료 계획</label>
                <AutoListTextarea
                  value={form.p}
                  onChange={(v) => updateForm((f) => ({ ...f, p: v }))}
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
                <textarea value={form.meds} onChange={(e) => updateForm((f) => ({ ...f, meds: e.target.value }))} placeholder={"에스시탈로프람 20mg 1T qd\n미르타자핀 15mg 1T qhs"} rows={4} className="w-full border border-border px-2 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded" />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">진단 코드 (줄바꿈으로 구분)</label>
                <textarea value={form.dx} onChange={(e) => updateForm((f) => ({ ...f, dx: e.target.value }))} placeholder={"F33.1 주요우울장애\nF41.1 범불안장애"} rows={4} className="w-full border border-border px-2 py-1.5 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded" />
              </div>
            </div>

            {/* 특이사항 */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">특이사항</label>
              <AutoListTextarea
                value={form.notes}
                onChange={(v) => updateForm((f) => ({ ...f, notes: v }))}
                placeholder={"보호자 면담, 안전계획, 입원 논의, 기타 임상 메모...\n('- ' 입력 시 자동 리스트)"}
                rows={2}
                className="w-full border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background rounded"
              />
            </div>

            {/* Risk */}
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">자살위험도</label>
              {(["low", "moderate", "high"] as const).map((r) => (
                <button key={r} onClick={() => updateForm((f) => ({ ...f, risk: f.risk === r ? null : r }))} className={`text-[13px] px-3 py-1 rounded border font-mono transition-colors ${form.risk === r ? r === "low" ? "bg-green-100 border-green-400 text-green-800" : r === "moderate" ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-red-100 border-red-400 text-red-800" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {RISK_LABELS[r]}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-4 pt-1 border-t border-border">
              {hasUsedAiScribe && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={aiReviewed || !form.cc.trim()}
                      className="text-[13px] px-4 py-1.5 border border-primary text-primary rounded hover:bg-primary/5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      AI 검토 완료
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>AI 음성 분석 검토를 완료하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>완료 후 특이사항이 "검토 완료"로 표시되고, 승인 절차로 진행할 수 있습니다.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>아니요</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAiReviewConfirm}>예</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <div className="flex items-center gap-2">
                <button onClick={handleCancel} className="text-[13px] px-4 py-1.5 border border-border rounded hover:bg-muted">취소</button>

                {signedOff ? (
                  <button onClick={handleSave} disabled={!form.cc.trim()} className="flex items-center gap-1.5 text-[13px] bg-primary text-primary-foreground px-4 py-1.5 rounded hover:bg-primary/90 font-medium disabled:opacity-40">
                    <Save className="w-3.5 h-3.5" />저장
                  </button>
                ) : (
                  <AlertDialog
                    open={approvalDialogOpen}
                    onOpenChange={(open) => {
                      setApprovalDialogOpen(open);
                      if (!open) {
                        setApprovalPin("");
                        setApprovalPinError(null);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={!form.cc.trim() || (hasUsedAiScribe && !aiReviewed)}
                        className="text-[13px] bg-primary text-primary-foreground px-4 py-1.5 rounded hover:bg-primary/90 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        승인
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>전자서명 및 차트 승인</AlertDialogTitle>
                        <AlertDialogDescription>의사의 전자 서명을 위해 PIN 번호를 입력해 주세요.</AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="space-y-1 text-[12px] text-muted-foreground border border-border rounded px-3 py-2 bg-muted/30">
                        <p>서명 의사: <span className="text-foreground font-medium">{DOCTOR_NAME} 원장 / 면허번호: {DOCTOR_LICENSE_NO}</span></p>
                        <p>서명 일시: <span className="text-foreground font-medium">{new Date().toLocaleString("ko-KR")}</span></p>
                      </div>

                      <div>
                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={6}
                          value={approvalPin}
                          onChange={(e) => {
                            setApprovalPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                            setApprovalPinError(null);
                          }}
                          placeholder="PIN 번호 (4~6자리)"
                          className="w-full border border-border px-3 py-2 text-[13px] tracking-[0.4em] text-center focus:outline-none focus:ring-1 focus:ring-primary bg-background rounded"
                        />
                        {approvalPinError && <p className="text-[12px] text-red-600 mt-1.5">{approvalPinError}</p>}
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction disabled={approvalPin.length < 4} onClick={handleApprovalPinSubmit}>
                          서명 및 승인
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
