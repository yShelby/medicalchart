"""Pydantic models for the STT -> NER -> LLM voice-chart pipeline.

All sample values referenced in docstrings/comments elsewhere in this pipeline are
medical-example (mock) data only, used to validate the pipeline wiring - not real
clinical output.
"""

from typing import Literal, Optional

from pydantic import BaseModel

MockScenario = Literal["default", "risk_mentioned"]


class ObjectiveEntry(BaseModel):
    category: str
    value: str


class STTResult(BaseModel):
    transcript: str
    confidence: float
    language: str


class NEREntity(BaseModel):
    text: str
    label: str
    start: int
    end: int


class NERResult(BaseModel):
    entities: list[NEREntity]


class SoapChart(BaseModel):
    """Matches the frontend `Visit`/`NewVisitForm` field names 1:1."""

    cc: str
    s: str
    o: list[ObjectiveEntry]
    a: str
    p: str
    risk: Optional[Literal["low", "moderate", "high"]] = None
    notes: str
    dx: list[str]
    meds: list[str]


class ChartResultMeta(BaseModel):
    pipeline_mode: str
    processing_time_ms: int


# --- Client -> Server WS messages ---


class StartMessage(BaseModel):
    type: Literal["start"] = "start"
    patient_id: str
    mock_scenario: MockScenario = "default"


class StopMessage(BaseModel):
    type: Literal["stop"] = "stop"


# --- Server -> Client WS messages ---


class ReadyMessage(BaseModel):
    type: Literal["ready"] = "ready"


class PartialTranscriptMessage(BaseModel):
    type: Literal["partial_transcript"] = "partial_transcript"
    text: str
    is_final: bool = False
    elapsed_ms: int


class FinalTranscriptMessage(BaseModel):
    type: Literal["final_transcript"] = "final_transcript"
    text: str


class ChartResultMessage(BaseModel):
    type: Literal["chart_result"] = "chart_result"
    stt: STTResult
    ner: NERResult
    chart: SoapChart
    meta: ChartResultMeta


class ErrorMessage(BaseModel):
    type: Literal["error"] = "error"
    message: str
