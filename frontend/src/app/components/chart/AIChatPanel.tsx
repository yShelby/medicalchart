import { useEffect, useRef, useState } from "react";
import { Brain, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "./types";
import { AI_INTROS, getAIResponse } from "./data";

function now() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function AIChatPanel({ patientId }: { patientId: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prevId = useRef<string | null>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (patientId && patientId !== prevId.current) {
      prevId.current = patientId;
      setInput("");
      setMessages([{ role: "assistant", content: AI_INTROS[patientId] ?? AI_INTROS["default"], ts: now() }]);
    }
  }, [patientId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text, ts: now() }]);
    setInput("");
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "assistant", content: getAIResponse(text), ts: now() }]);
    }, 800 + Math.random() * 500);
  }

  return (
    <>
      {/* AI info box */}
      <div className="mx-3 mt-3 mb-0 shrink-0">
        <div className="border border-primary/20 bg-accent rounded px-2.5 py-2 flex gap-2">
          <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-accent-foreground leading-relaxed">
            AI 어시스턴트는 참고용입니다. 최종 판단은 전문의가 직접 수행하여야 합니다.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!patientId && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <Brain className="w-8 h-8 opacity-20" />
            <p className="text-[13px] text-center">환자를 선택하면<br />AI 분석이 시작됩니다</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-0.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "assistant" && (
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                  <Brain className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">AI 어시스턴트</span>
              </div>
            )}
            <div className={`max-w-[92%] px-3 py-2 text-[13px] leading-relaxed rounded ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"}`}>
              {msg.content.split("\n").map((line, j, arr) => (
                <span key={j}>
                  {line.startsWith("**") && line.endsWith("**")
                    ? <strong className="font-semibold">{line.slice(2, -2)}</strong>
                    : line.startsWith("• ")
                    ? <span className="block pl-2">{line}</span>
                    : line}
                  {j < arr.length - 1 && <br />}
                </span>
              ))}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{msg.ts}</span>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted border border-border rounded w-fit">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 shrink-0 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="질문을 입력하세요..."
            disabled={!patientId}
            className="flex-1 border border-border px-3 py-1.5 text-[13px] rounded focus:outline-none focus:ring-1 focus:ring-primary bg-background disabled:opacity-50"
          />
          <button onClick={send} disabled={!input.trim() || !patientId} className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-40">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">Enter로 전송 · AI 응답은 참고용입니다</p>
      </div>
    </>
  );
}
