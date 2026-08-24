import { Shield } from "lucide-react";
import type { Assessment } from "../types";
import { ScoreBar } from "../ScoreBar";
import { TrendIcon } from "../TrendIcon";

export function AssessmentTab({ assessments }: { assessments: Assessment[] }) {
  return (
    <div className="p-5">
      <h2 className="text-[15px] font-semibold mb-3">심리평가 / 임상 척도</h2>
      {assessments.length === 0 ? (
        <p className="text-[13px] text-muted-foreground py-8 text-center">평가 기록이 없습니다.</p>
      ) : (
        <div className="space-y-1.5">
          <div className="grid grid-cols-[110px_1fr_180px_80px] gap-4 px-4 py-2 border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            <span>검사일</span><span>척도 / 검사명</span><span>점수</span><span>추세</span>
          </div>
          {assessments.map((a, i) => (
            <div key={i} className="grid grid-cols-[110px_1fr_180px_80px] gap-4 px-4 py-3 border border-border hover:bg-muted/40 transition-colors items-center">
              <span className="font-mono text-[12px] text-muted-foreground">{a.date}</span>
              <div>
                <p className="text-[13px] font-medium">{a.scale}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.interpretation}</p>
              </div>
              <div><ScoreBar score={a.score} max={a.max} /></div>
              <div className="flex items-center gap-1">
                <TrendIcon trend={a.trend} />
                <span className="text-[12px] text-muted-foreground font-mono">{a.trend === "up" ? "악화" : a.trend === "down" ? "개선" : "유지"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-start gap-2 border border-amber-200 bg-amber-50 rounded px-3 py-2.5">
        <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-800 leading-relaxed">평가 척도는 임상적 판단을 보조하는 도구입니다. Columbia 자살위험평가 결과는 매 방문 시 갱신이 권장됩니다.</p>
      </div>
    </div>
  );
}
