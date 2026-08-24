import { useCallback, useRef, useState } from "react";
import type { AiChartResult } from "../components/chart/types";

const WS_URL = "ws://localhost:8000/ws/voice-chart";

export type MockScenario = "default" | "risk_mentioned";

export function useVoiceChartSocket() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveStopRef = useRef<((chart: AiChartResult | null) => void) | null>(null);

  const teardownMedia = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (patientId: string, mockScenario: MockScenario = "default") => {
      setError(null);
      setTranscript("");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError("마이크 권한이 필요합니다.");
        return;
      }
      streamRef.current = stream;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "start", patient_id: patientId, mock_scenario: mockScenario }));
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };
        recorder.start(500);
        recorderRef.current = recorder;
        setIsRecording(true);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "partial_transcript") {
          setTranscript(msg.text);
        } else if (msg.type === "chart_result") {
          resolveStopRef.current?.(msg.chart as AiChartResult);
          resolveStopRef.current = null;
        } else if (msg.type === "error") {
          setError(msg.message);
        }
      };

      ws.onerror = () => {
        setError("음성 인식 서버에 연결할 수 없습니다.");
      };

      ws.onclose = () => {
        setIsRecording(false);
        resolveStopRef.current?.(null);
        resolveStopRef.current = null;
      };
    },
    []
  );

  const stop = useCallback((): Promise<AiChartResult | null> => {
    return new Promise((resolve) => {
      const ws = wsRef.current;
      teardownMedia();
      setIsRecording(false);

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        resolve(null);
        return;
      }
      resolveStopRef.current = resolve;
      ws.send(JSON.stringify({ type: "stop" }));
    });
  }, [teardownMedia]);

  const cancel = useCallback(() => {
    teardownMedia();
    wsRef.current?.close();
    wsRef.current = null;
    resolveStopRef.current = null;
    setIsRecording(false);
    setTranscript("");
  }, [teardownMedia]);

  return { isRecording, transcript, error, start, stop, cancel };
}
