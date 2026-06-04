import os
import uuid
import zipfile
from src.configs.security import encrypt_data

class CodeRepository:
    @staticmethod
    def create_code_archive(specification, language, options):
        # Generate code files based on spec (placeholder)
        code_dir = f"/tmp/codegen_{uuid.uuid4()}"
        os.makedirs(code_dir, exist_ok=True)
        with open(f"{code_dir}/README.md", "w") as f:
            f.write(f"# Generated API Code ({language})\n")
        # Encrypt files before archiving
        for fname in os.listdir(code_dir):
            with open(f"{code_dir}/{fname}", "rb") as f:
                data = f.read()
            encrypted = encrypt_data(data)
            with open(f"{code_dir}/{fname}", "wb") as f:
                f.write(encrypted)
        archive_path = f"{code_dir}.zip"
        with zipfile.ZipFile(archive_path, 'w') as zipf:
            for fname in os.listdir(code_dir):
                zipf.write(f"{code_dir}/{fname}", fname)
        # Simulate URL
        archive_url = f"https://api.example.com/generated/{os.path.basename(archive_path)}"
        return archive_url
