from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class GenerateAPIRequest(BaseModel):
    specification: Dict[str, Any]
    language: str = Field(..., example="python")
    options: Optional[Dict[str, Any]] = None

class GenerateAPIResponse(BaseModel):
    codeArchiveUrl: str
    metadata: Dict[str, Any]

class ErrorResponse(BaseModel):
    error: Dict[str, Any]
