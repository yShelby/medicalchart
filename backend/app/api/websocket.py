import asyncio
import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.schemas.chart import StartMessage
from app.services.orchestrator import StreamingChartPipeline

router = APIRouter()


@router.websocket("/ws/voice-chart")
async def voice_chart_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"type": "ready"})

    try:
        raw_start = await websocket.receive_json()
        start_msg = StartMessage.model_validate(raw_start)
    except Exception:
        await websocket.send_json({"type": "error", "message": "expected a valid 'start' message first"})
        await websocket.close()
        return

    pipeline = StreamingChartPipeline(mock_scenario=start_msg.mock_scenario)
    session_start = time.monotonic()

    async def reader() -> None:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                return
            audio_bytes = message.get("bytes")
            if audio_bytes is not None:
                pipeline.push_chunk(audio_bytes)
                continue
            text = message.get("text")
            if text is not None:
                data = json.loads(text)
                if data.get("type") == "stop":
                    pipeline.stt.request_stop()
                    return

    async def writer() -> None:
        elapsed_start = time.monotonic()
        async for text in pipeline.partials():
            await websocket.send_json(
                {
                    "type": "partial_transcript",
                    "text": text,
                    "is_final": False,
                    "elapsed_ms": int((time.monotonic() - elapsed_start) * 1000),
                }
            )

    try:
        await asyncio.gather(reader(), writer())
    except WebSocketDisconnect:
        return

    stt_result, ner_result, chart = await pipeline.finalize()

    await websocket.send_json({"type": "final_transcript", "text": stt_result.transcript})
    await websocket.send_json(
        {
            "type": "chart_result",
            "stt": stt_result.model_dump(),
            "ner": ner_result.model_dump(),
            "chart": chart.model_dump(),
            "meta": {
                "pipeline_mode": "mock",
                "processing_time_ms": int((time.monotonic() - session_start) * 1000),
            },
        }
    )
    await websocket.close()
