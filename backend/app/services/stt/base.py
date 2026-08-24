from collections.abc import AsyncIterator
from typing import Protocol

from app.schemas.chart import STTResult


class StreamingSTTEngine(Protocol):
    """Streaming speech-to-text interface.

    A real engine (future: a local Whisper-family model) buffers pushed audio
    chunks and yields partial transcripts as it recognizes more speech, in
    chunked pseudo-real-time (not true token-level streaming). `finalize()`
    stops recognition and returns the final result.
    """

    def push_chunk(self, chunk: bytes) -> None: ...

    def partials(self) -> AsyncIterator[str]: ...

    def request_stop(self) -> None: ...

    async def finalize(self) -> STTResult: ...
