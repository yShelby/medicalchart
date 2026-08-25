import asyncio
from collections.abc import AsyncIterator

from app.schemas.chart import MockScenario, STTResult

# Medical-example (mock) sample scripts only, used to validate pipeline wiring.
# Each entry is the cumulative transcript so far (simulating incremental streaming
# ASR output), alternating between patient and doctor turns separated by "\n".
# No speaker labels ("환자:"/"의사:") — real STT output has no diarization, so the
# mock must not fabricate a capability the real pipeline won't have.
_SCRIPTS: dict[MockScenario, list[str]] = {
    "default": [
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.",
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.\n힘드시겠군요. 언제부터 그러셨나요?",
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.\n힘드시겠군요. 언제부터 그러셨나요?\n한 2주 정도 됐어요. 계속 피곤하고 아무것도 하기 싫어요.",
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.\n힘드시겠군요. 언제부터 그러셨나요?\n한 2주 정도 됐어요. 계속 피곤하고 아무것도 하기 싫어요.\n알겠습니다. 그 부분 좀 더 자세히 여쭤볼게요.",
    ],
    "risk_mentioned": [
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.",
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.\n힘드시겠군요. 언제부터 그러셨나요?",
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.\n힘드시겠군요. 언제부터 그러셨나요?\n한 2주 정도 됐어요. 요즘엔 가끔 죽고 싶다는 생각도 들어요.",
        "요즘 잠을 잘 못 이루고 식욕이 줄었어요.\n힘드시겠군요. 언제부터 그러셨나요?\n한 2주 정도 됐어요. 요즘엔 가끔 죽고 싶다는 생각도 들어요.\n그런 생각이 드실 때 많이 힘드셨겠어요. 좀 더 자세히 말씀해주시겠어요?",
    ],
}


class MockStreamingSTTEngine:
    """Ignores actual audio content; plays back a canned script on a timer
    to validate the streaming pipeline/UI before a real local model is wired in.
    """

    def __init__(self, scenario: MockScenario = "default", interval_sec: float = 0.8) -> None:
        self._script = _SCRIPTS.get(scenario, _SCRIPTS["default"])
        self._interval = interval_sec
        self._stopped = asyncio.Event()
        self._final_text = ""

    def push_chunk(self, chunk: bytes) -> None:
        pass  # mock: real audio content is ignored

    async def partials(self) -> AsyncIterator[str]:
        for text in self._script:
            if self._stopped.is_set():
                break
            await asyncio.sleep(self._interval)
            if self._stopped.is_set():
                break
            self._final_text = text
            yield text

    def request_stop(self) -> None:
        self._stopped.set()

    async def finalize(self) -> STTResult:
        self._stopped.set()
        final_text = self._final_text or self._script[-1]
        return STTResult(transcript=final_text, confidence=0.0, language="ko")
