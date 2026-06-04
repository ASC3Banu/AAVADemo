import datetime
import json
from src.resources.audit import log_action
from src.configs.security import encrypt_data, filter_sensitive_data
from src.repositories.code_repository import CodeRepository
from src.models.api_models import GenerateAPIRequest

class CodeGenerationService:
    @staticmethod
    def generate_code(request: GenerateAPIRequest, user):
        # Validate input
        if not request.specification or not request.language:
            raise ValueError("Missing specification or language.")
        # Optionally filter PII/PHI/PCI
        spec = filter_sensitive_data(request.specification)
        # Generate code archive
        archive_url = CodeRepository.create_code_archive(spec, request.language, request.options)
        # Audit log
        log_action(user, "code-generated", {"archive_url": archive_url, "language": request.language})
        # Metadata
        metadata = {
            "language": request.language,
            "generationTime": datetime.datetime.utcnow().isoformat()
        }
        return archive_url, metadata
