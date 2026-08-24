import type { Visit } from "./types";

export const RISK_LABELS: Record<NonNullable<Visit["risk"]>, string> = {
  low: "낮음",
  moderate: "중등도",
  high: "높음",
};

const RISK_BADGE_CLASSES: Record<NonNullable<Visit["risk"]>, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export function RiskBadge({ level }: { level: NonNullable<Visit["risk"]> }) {
  const label = RISK_LABELS[level];
  const cls = RISK_BADGE_CLASSES[level];
  return (
    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${cls}`}>
      자살위험 {label}
    </span>
  );
}
