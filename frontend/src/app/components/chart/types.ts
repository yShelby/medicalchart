export interface ObjectiveEntry {
  category: string;
  value: string;
}

export interface Visit {
  id: string;
  date: string;
  doctor: string;
  cc: string;
  s: string; // 주관적 소견 (Subjective)
  o: ObjectiveEntry[]; // 객관적 소견 (Objective) — 구조화된 카테고리/값 목록
  a: string; // 평가 / 진단 (Assessment)
  p: string; // 치료 계획 (Plan)
  risk: "low" | "moderate" | "high" | null;
  notes?: string;
  dx: string[];
  meds: string[];
}

export interface Assessment {
  date: string;
  scale: string;
  score: number;
  max: number;
  interpretation: string;
  trend: "up" | "down" | "stable";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

export type PatientStatus = "waiting" | "done";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  phone: string;
  bloodType: string;
  allergies: string[];
  insurance: string;
  primaryDx: string;
  lastVisit: string;
  guardian: string;
  status: PatientStatus;
}

export type Tab = "info" | "chart" | "rx" | "lab";
