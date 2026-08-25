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
const AI_REVIEW_NOTE_PREFIX = "AI 음성 차트로 자동 생성됨";
export const AI_REVIEW_PENDING_NOTE = `${AI_REVIEW_NOTE_PREFIX} (검토 필요)`;
const AI_REVIEW_DONE_NOTE = `${AI_REVIEW_NOTE_PREFIX} (검토 완료)`;

// AI 검토 완료 처리 시 특이사항의 "(검토 필요)" 문구를 "(검토 완료)"로 치환한다.
export function markAiContentReviewed(notes: string): string {
  return notes.split(AI_REVIEW_PENDING_NOTE).join(AI_REVIEW_DONE_NOTE);
}

function appendText(existing: string, incoming: string): string {
  if (!incoming.trim()) return existing;
  return existing.trim() ? `${existing}${AI_SEPARATOR}${incoming}` : incoming;
}

// AI Scribe 시작 시점과 STT 종료 후 병합 시점 둘 다 이 문구를 붙이려 시도하므로,
// 이미 (검토 필요/완료 어느 쪽이든) 붙어 있으면 다시 덧붙이지 않는다.
export function appendAiReviewNote(notes: string, incoming: string): string {
  if (notes.includes(AI_REVIEW_NOTE_PREFIX)) return notes;
  return appendText(notes, incoming);
}

// 재검토가 필요해진 시점(재녹음, 승인 후 수정)에 특이사항 문구를 "(검토 필요)" 상태로
// 되돌린다: 이미 "(검토 완료)"로 표시돼 있다면 되돌리고, 의사가 문구를 통째로 지웠다면
// 다시 추가하며, 이미 "(검토 필요)" 상태라면 그대로 둔다(중복 방지).
export function resetAiReviewNote(notes: string): string {
  if (notes.includes(AI_REVIEW_DONE_NOTE)) {
    return notes.split(AI_REVIEW_DONE_NOTE).join(AI_REVIEW_PENDING_NOTE);
  }
  return appendAiReviewNote(notes, AI_REVIEW_PENDING_NOTE);
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
    notes: appendAiReviewNote(form.notes, ai.notes),
    o: [...form.o, ...ai.o],
    dx: appendLines(form.dx, ai.dx),
    meds: appendLines(form.meds, ai.meds),
    risk: form.risk ?? ai.risk,
  };
}
