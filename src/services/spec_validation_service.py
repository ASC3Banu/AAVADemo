from src.configs.security import filter_sensitive_data
from src.resources.audit import log_action

class SpecificationValidationService:
    @staticmethod
    def validate(specification):
        # Basic schema validation
        if not isinstance(specification, dict):
            log_action("system", "spec-validation-failed", {"reason": "Not a dict"})
            return {"isValid": False, "errors": ["Specification must be a dict."]}
        # Filter sensitive data
        specification = filter_sensitive_data(specification)
        # Advanced validation (placeholder)
        errors = []
        if "endpoints" not in specification:
            errors.append("Missing 'endpoints' definition.")
        is_valid = not errors
        log_action("system", "spec-validation", {"isValid": is_valid, "errors": errors})
        return {"isValid": is_valid, "errors": errors}
