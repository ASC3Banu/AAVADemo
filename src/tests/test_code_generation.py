import pytest
from src.services.code_generation_service import CodeGenerationService
from src.models.api_models import GenerateAPIRequest

@pytest.fixture
def fake_user():
    class User:
        username = "demo"
        role = "developer"
    return User()

def test_generate_code_success(fake_user):
    req = GenerateAPIRequest(specification={"endpoints": ["/foo"]}, language="python", options={"auth": True, "logging": True})
    archive_url, metadata = CodeGenerationService.generate_code(req, fake_user)
    assert archive_url.startswith("https://api.example.com/generated/")
    assert metadata["language"] == "python"
    assert "generationTime" in metadata

def test_generate_code_invalid(fake_user):
    req = GenerateAPIRequest(specification={}, language="", options={})
    with pytest.raises(ValueError):
        CodeGenerationService.generate_code(req, fake_user)
