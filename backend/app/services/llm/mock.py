from app.schemas.chart import NEREntity, SoapChart

# Medical-example (mock) sample SOAP output only, used to validate pipeline wiring
# and the Visit field mapping - not real clinical output.
#
# Suicidal-ideation handling rule (must also go into any real LLM's system prompt):
# never fabricate suicide/self-harm content (not even a denial phrase like "부인함")
# when the source transcript doesn't actually mention the topic - that is a
# hallucination. Only reflect it when the transcript explicitly references it.
_SUICIDE_KEYWORDS = ("자살", "자해", "죽고 싶")


class MockLLMEngine:
    def generate_soap(self, transcript: str, entities: list[NEREntity]) -> SoapChart:
        mentions_risk = any(keyword in transcript for keyword in _SUICIDE_KEYWORDS)

        s_lines = ["- 수면 개시 어려움 호소", "- 식욕 저하 동반", "- 약 2주간 지속, 피로감 및 무의욕감 호소"]
        if mentions_risk:
            s_lines.append("- 죽고 싶다는 생각이 든다고 직접 호소")

        # Only cc/s/risk are grounded in the (mock) transcript. O/A/P/dx/meds would
        # require clinical judgment the transcript alone doesn't provide, so they're
        # left empty rather than fabricated - same rule as the suicide-risk check below.
        return SoapChart(
            cc="수면 장애, 식욕 저하",
            s="\n".join(s_lines),
            o=[],
            a="",
            p="",
            risk="high" if mentions_risk else None,
            notes="AI 음성 차트로 자동 생성됨 (검토 필요)",
            dx=[],
            meds=[],
        )
