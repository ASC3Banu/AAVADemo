import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from src.models.api_models import GenerateAPIRequest, GenerateAPIResponse, ErrorResponse
from src.services.code_generation_service import CodeGenerationService
from src.configs.security import get_current_user, RBACRoles
from src.resources.audit import log_action

router = APIRouter()

@router.post("/generate-api", response_model=GenerateAPIResponse, responses={400: {"model": ErrorResponse}, 401: {"model": ErrorResponse}, 409: {"model": ErrorResponse}})
def generate_api(request: GenerateAPIRequest, user=Depends(get_current_user)):
    log_action(user, "generate-api-request")
    if not RBACRoles.has_access(user, "developer"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    try:
        archive_url, metadata = CodeGenerationService.generate_code(request, user)
        log_action(user, "generate-api-success")
        return GenerateAPIResponse(codeArchiveUrl=archive_url, metadata=metadata)
    except ValueError as ve:
        log_action(user, "generate-api-failure", str(ve))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        log_action(user, "generate-api-error", str(e))
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.post("/specifications/validate", response_model=dict, responses={400: {"model": ErrorResponse}, 401: {"model": ErrorResponse}})
def validate_specification(request: dict, user=Depends(get_current_user)):
    log_action(user, "validate-specification-request")
    if not RBACRoles.has_access(user, "developer"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    from src.services.spec_validation_service import SpecificationValidationService
    try:
        result = SpecificationValidationService.validate(request["specification"])
        log_action(user, "validate-specification-success")
        return result
    except ValueError as ve:
        log_action(user, "validate-specification-failure", str(ve))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

@router.get("/audit/logs", response_model=dict, responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}})
def get_audit_logs(user=Depends(get_current_user)):
    log_action(user, "get-audit-logs-request")
    if not RBACRoles.has_access(user, "auditor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    from src.resources.audit import retrieve_logs
    logs = retrieve_logs(user)
    log_action(user, "get-audit-logs-success")
    return {"logs": logs}
