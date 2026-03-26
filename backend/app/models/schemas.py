from pydantic import BaseModel


class AnalysisMetadata(BaseModel):
    filename: str
    content_type: str
    size_bytes: int


class AnalysisResponse(BaseModel):
    summary: str
    metadata: AnalysisMetadata
