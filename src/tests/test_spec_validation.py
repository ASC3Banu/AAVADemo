import pytest
from src.services.spec_validation_service import SpecificationValidationService

def test_validate_valid_spec():
    spec = {"endpoints": ["/foo"]}
    result = SpecificationValidationService.validate(spec)
    assert result["isValid"] is True
    assert result["errors"] == []

def test_validate_invalid_spec():
    spec = {"foo": "bar"}
    result = SpecificationValidationService.validate(spec)
    assert result["isValid"] is False
    assert "Missing 'endpoints' definition." in result["errors"]
