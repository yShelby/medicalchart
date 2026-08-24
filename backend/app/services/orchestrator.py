from collections.abc import AsyncIterator

from app.schemas.chart import MockScenario, NERResult, SoapChart, STTResult
from app.services.llm.base import LLMEngine
from app.services.llm.mock import MockLLMEngine
from app.services.ner.base import NEREngine
from app.services.ner.mock import MockNEREngine
from app.services.stt.base import StreamingSTTEngine
from app.services.stt.mock import MockStreamingSTTEngine


class StreamingChartPipeline:
    """Assembles STT -> NER -> LLM for one recording session.

    This is the single place engines are wired together - swapping a mock
    engine for a real one (e.g. a local Whisper-family STT model, a local LLM)
    later means changing the three assignments below to a different class that
    implements the same Protocol.
    """

    def __init__(self, mock_scenario: MockScenario = "default") -> None:
        self.stt: StreamingSTTEngine = MockStreamingSTTEngine(scenario=mock_scenario)
        self.ner: NEREngine = MockNEREngine()
        self.llm: LLMEngine = MockLLMEngine()

    def push_chunk(self, chunk: bytes) -> None:
        self.stt.push_chunk(chunk)

    def partials(self) -> AsyncIterator[str]:
        return self.stt.partials()

    async def finalize(self) -> tuple[STTResult, NERResult, SoapChart]:
        stt_result = await self.stt.finalize()
        ner_result = self.ner.extract(stt_result.transcript)
        chart = self.llm.generate_soap(stt_result.transcript, ner_result.entities)
        return stt_result, ner_result, chart
