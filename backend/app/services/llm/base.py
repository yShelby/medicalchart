from typing import Protocol

from app.schemas.chart import NEREntity, SoapChart


class LLMEngine(Protocol):
    def generate_soap(self, transcript: str, entities: list[NEREntity]) -> SoapChart: ...
