import { Mic } from "lucide-react";

interface RealtimeSttPanelProps {
  isRecording: boolean;
  transcript: string;
  error: string | null;
}

export function RealtimeSttPanel({ isRecording, transcript, error }: RealtimeSttPanelProps) {
  return (
    <div className="p-4 space-y-3">
      {error && (
        <div className="border border-red-300 bg-red-50 text-red-700 text-[12px] px-3 py-2 rounded">{error}</div>
      )}

      {!isRecording && !transcript && (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-16">
          <Mic className="w-8 h-8 opacity-20" />
          <p className="text-[13px]">🎙️ AI Scribe 버튼을 눌러 녹음을 시작하세요</p>
        </div>
      )}

      {(isRecording || transcript) && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            {isRecording && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            <label className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              실시간 음성 인식 {isRecording ? "(진행 중)" : "(중지됨)"}
            </label>
          </div>
          <div className="min-h-[160px] border border-border rounded px-3 py-2 text-[13px] leading-relaxed bg-muted/40 whitespace-pre-wrap">
            {transcript || "..."}
          </div>
        </div>
      )}
    </div>
  );
}
