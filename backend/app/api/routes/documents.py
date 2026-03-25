import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from app.services.gemini_service import analyze_document
from app.models.schemas import AnalysisResponse

logger = logging.getLogger(__name__)
router = APIRouter()

SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB limit for Gemini

@router.post("/analyze", response_model=AnalysisResponse)
async def upload_and_analyze(
    file: UploadFile = File(...),
    prompt: str = Form("Please summarize this document comprehensively.")
):
    if not file:
        raise HTTPException(status_code=400, detail="No file was uploaded.")

    if file.content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Please upload a PDF or DOCX file."
        )

    try:
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
            
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum allowed size is 15MB. (Your file: {len(file_bytes) // (1024*1024)}MB)"
            )
        
        logger.info(f"Analyzing {file.filename} ({len(file_bytes)} bytes) with prompt: {prompt}")
        
        # Analyze the document
        summary = await analyze_document(
            file_bytes=file_bytes,
            mime_type=file.content_type,
            prompt=prompt
        )
        
        logger.info(f"Successfully analyzed {file.filename}")
        
        return AnalysisResponse(
            summary=summary,
            metadata={
                "filename": file.filename,
                "content_type": file.content_type,
                "size_bytes": len(file_bytes)
            }
        )
    except HTTPException:
        # Re-raise HTTP exceptions to be handled by FastAPI
        raise
    except ValueError as e:
        logger.warning(f"Validation error during analysis: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Gemini Analysis failed for {file.filename}: {error_msg}", exc_info=True)
        
        if "API_KEY_INVALID" in error_msg or "API key not valid" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid Gemini API Key. Please update the .env file in your backend folder with a real API key.")
        
        raise HTTPException(status_code=502, detail="Failed to analyze document with the AI service. The document may be corrupted, too large, or the service is temporarily unavailable.")
