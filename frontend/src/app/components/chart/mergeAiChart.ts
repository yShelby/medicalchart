import type { AiChartResult, ObjectiveEntry, Visit } from "./types";

export interface VisitFormState {
  cc: string;
  s: string;
  o: ObjectiveEntry[];
  a: string;
  p: string;
  risk: Visit["risk"];
  notes: string;
  dx: string;
  meds: string;
}

const AI_SEPARATOR = "\n\n--- [AI 음성 분석] ---\n";

function appendText(existing: string, incoming: string): string {
  if (!incoming.trim()) return existing;
  return existing.trim() ? `${existing}${AI_SEPARATOR}${incoming}` : incoming;
}

function appendLines(existing: string, incoming: string[]): string {
  if (incoming.length === 0) return existing;
  const joined = incoming.join("\n");
  return existing.trim() ? `${existing}\n${joined}` : joined;
}

// 기존 사용자 입력은 절대 덮어쓰지 않고, 항상 기존 내용 아래에 AI 결과를 추가한다.
export function mergeAiChartIntoForm(form: VisitFormState, ai: AiChartResult): VisitFormState {
  return {
    ...form,
    cc: form.cc.trim() ? (ai.cc.trim() ? `${form.cc}, ${ai.cc}` : form.cc) : ai.cc,
    s: appendText(form.s, ai.s),
    a: appendText(form.a, ai.a),
    p: appendText(form.p, ai.p),
    notes: appendText(form.notes, ai.notes),
    o: [...form.o, ...ai.o],
    dx: appendLines(form.dx, ai.dx),
    meds: appendLines(form.meds, ai.meds),
    risk: form.risk ?? ai.risk,
  };
}
