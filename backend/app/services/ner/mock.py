from app.schemas.chart import NEREntity, NERResult

# Medical-example (mock) entity labels/spans only, used to validate pipeline wiring.
# NER is span-extraction (finds text that is actually present), so unlike the LLM
# stage it cannot hallucinate a RISK_FACTOR that isn't in the source text.
_KNOWN_PHRASES: list[tuple[str, str]] = [
    ("잠을 잘 못 이루고", "SYMPTOM"),
    ("식욕이 줄었다", "SYMPTOM"),
    ("죽고 싶다는 생각", "RISK_FACTOR"),
]


class MockNEREngine:
    def extract(self, text: str) -> NERResult:
        entities: list[NEREntity] = []
        for phrase, label in _KNOWN_PHRASES:
            idx = text.find(phrase)
            if idx != -1:
                entities.append(NEREntity(text=phrase, label=label, start=idx, end=idx + len(phrase)))
        return NERResult(entities=entities)
