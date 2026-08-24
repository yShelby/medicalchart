from typing import Protocol

from app.schemas.chart import NERResult


class NEREngine(Protocol):
    def extract(self, text: str) -> NERResult: ...
