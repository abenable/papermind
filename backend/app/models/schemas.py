from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    summary: str
    metadata: dict | None = None
