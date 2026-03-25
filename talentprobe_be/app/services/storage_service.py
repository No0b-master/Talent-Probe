import os
from pathlib import Path
from uuid import uuid4


class ResumeStorageService:
    def __init__(self) -> None:
        self.storage_backend = os.getenv("STORAGE_BACKEND", "local").strip().lower() or "local"
        self.local_base_dir = Path(__file__).resolve().parents[2] / "data" / "resumes"

        self.spaces_bucket = os.getenv("SPACES_BUCKET", "").strip()
        self.spaces_region = os.getenv("SPACES_REGION", "").strip()
        self.spaces_endpoint = os.getenv("SPACES_ENDPOINT", "").strip()
        self.spaces_key = os.getenv("SPACES_KEY", "").strip()
        self.spaces_secret = os.getenv("SPACES_SECRET", "").strip()
        self.spaces_cdn_url = os.getenv("SPACES_CDN_URL", "").strip()

        self._spaces_client = None

        if self.storage_backend == "spaces":
            self._spaces_client = self._build_spaces_client()

    def save_resume(self, user_id: int, original_filename: str, file_bytes: bytes) -> dict[str, str | None]:
        safe_name = self._sanitize_file_name(original_filename)
        storage_key = f"{user_id}/{uuid4().hex}_{safe_name}"

        if self.storage_backend == "spaces":
            assert self._spaces_client is not None
            self._spaces_client.put_object(
                Bucket=self.spaces_bucket,
                Key=storage_key,
                Body=file_bytes,
                ACL="private",
                ContentType=self._guess_content_type(original_filename),
            )
            return {
                "storage_provider": "spaces",
                "storage_key": storage_key,
                "file_url": self._build_spaces_file_url(storage_key),
            }

        target_path = self.local_base_dir / storage_key
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(file_bytes)

        return {
            "storage_provider": "local",
            "storage_key": storage_key,
            "file_url": str(target_path),
        }

    def delete_resume(self, storage_key: str) -> None:
        if not storage_key:
            return

        if self.storage_backend == "spaces":
            if self._spaces_client is None:
                return
            try:
                self._spaces_client.delete_object(Bucket=self.spaces_bucket, Key=storage_key)
            except Exception:
                return
            return

        local_path = self.local_base_dir / storage_key
        if local_path.exists():
            local_path.unlink(missing_ok=True)

    def read_resume(self, storage_provider: str, storage_key: str) -> bytes:
        if storage_provider == "spaces":
            if self._spaces_client is None:
                self._spaces_client = self._build_spaces_client()

            response = self._spaces_client.get_object(Bucket=self.spaces_bucket, Key=storage_key)
            return response["Body"].read()

        local_path = self.local_base_dir / storage_key
        if not local_path.exists():
            raise ValueError("Stored file not found")
        return local_path.read_bytes()

    @staticmethod
    def guess_content_type(file_name: str) -> str:
        return ResumeStorageService._guess_content_type(file_name)

    @staticmethod
    def _sanitize_file_name(file_name: str) -> str:
        cleaned = file_name.strip().replace("\\", "_").replace("/", "_")
        return cleaned or "resume.pdf"

    @staticmethod
    def _guess_content_type(file_name: str) -> str:
        lower_name = file_name.lower()
        if lower_name.endswith(".pdf"):
            return "application/pdf"
        if lower_name.endswith(".docx"):
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        return "application/octet-stream"

    def _build_spaces_client(self):
        self._validate_spaces_config()

        try:
            import boto3
        except Exception as exc:
            raise ValueError("boto3 is required when STORAGE_BACKEND=spaces") from exc

        return boto3.client(
            "s3",
            region_name=self.spaces_region,
            endpoint_url=self.spaces_endpoint,
            aws_access_key_id=self.spaces_key,
            aws_secret_access_key=self.spaces_secret,
        )

    def _validate_spaces_config(self) -> None:
        missing = []
        if not self.spaces_bucket:
            missing.append("SPACES_BUCKET")
        if not self.spaces_region:
            missing.append("SPACES_REGION")
        if not self.spaces_endpoint:
            missing.append("SPACES_ENDPOINT")
        if not self.spaces_key:
            missing.append("SPACES_KEY")
        if not self.spaces_secret:
            missing.append("SPACES_SECRET")

        if missing:
            raise ValueError(f"Missing required Spaces configuration: {', '.join(missing)}")

    def _build_spaces_file_url(self, storage_key: str) -> str:
        if self.spaces_cdn_url:
            return f"{self.spaces_cdn_url.rstrip('/')}/{storage_key}"

        endpoint = self.spaces_endpoint.rstrip("/")
        return f"{endpoint}/{self.spaces_bucket}/{storage_key}"


class InvoiceStorageService:
    def __init__(self) -> None:
        self.storage_backend = os.getenv("STORAGE_BACKEND", "local").strip().lower() or "local"
        self.local_base_dir = Path(__file__).resolve().parents[2] / "data" / "invoices"

        self.spaces_bucket = os.getenv("SPACES_BUCKET", "").strip()
        self.spaces_region = os.getenv("SPACES_REGION", "").strip()
        self.spaces_endpoint = os.getenv("SPACES_ENDPOINT", "").strip()
        self.spaces_key = os.getenv("SPACES_KEY", "").strip()
        self.spaces_secret = os.getenv("SPACES_SECRET", "").strip()
        self.spaces_cdn_url = os.getenv("SPACES_CDN_URL", "").strip()

        self._spaces_client = None

        if self.storage_backend == "spaces":
            self._spaces_client = self._build_spaces_client()

    def save_invoice(self, user_id: int, transaction_ref: str, file_bytes: bytes) -> dict[str, str | None]:
        file_name = f"invoice_{transaction_ref}.pdf"
        safe_name = self._sanitize_file_name(file_name)
        storage_key = f"{user_id}/{uuid4().hex}_{safe_name}"

        if self.storage_backend == "spaces":
            assert self._spaces_client is not None
            self._spaces_client.put_object(
                Bucket=self.spaces_bucket,
                Key=storage_key,
                Body=file_bytes,
                ACL="private",
                ContentType="application/pdf",
            )
            return {
                "storage_provider": "spaces",
                "storage_key": storage_key,
                "file_url": self._build_spaces_file_url(storage_key),
            }

        target_path = self.local_base_dir / storage_key
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(file_bytes)

        return {
            "storage_provider": "local",
            "storage_key": storage_key,
            "file_url": str(target_path),
        }

    @staticmethod
    def _sanitize_file_name(file_name: str) -> str:
        cleaned = file_name.strip().replace("\\", "_").replace("/", "_")
        return cleaned or "invoice.pdf"

    def _build_spaces_client(self):
        self._validate_spaces_config()

        try:
            import boto3
        except Exception as exc:
            raise ValueError("boto3 is required when STORAGE_BACKEND=spaces") from exc

        return boto3.client(
            "s3",
            region_name=self.spaces_region,
            endpoint_url=self.spaces_endpoint,
            aws_access_key_id=self.spaces_key,
            aws_secret_access_key=self.spaces_secret,
        )

    def _validate_spaces_config(self) -> None:
        missing = []
        if not self.spaces_bucket:
            missing.append("SPACES_BUCKET")
        if not self.spaces_region:
            missing.append("SPACES_REGION")
        if not self.spaces_endpoint:
            missing.append("SPACES_ENDPOINT")
        if not self.spaces_key:
            missing.append("SPACES_KEY")
        if not self.spaces_secret:
            missing.append("SPACES_SECRET")

        if missing:
            raise ValueError(f"Missing required Spaces configuration: {', '.join(missing)}")

    def _build_spaces_file_url(self, storage_key: str) -> str:
        if self.spaces_cdn_url:
            return f"{self.spaces_cdn_url.rstrip('/')}/{storage_key}"

        endpoint = self.spaces_endpoint.rstrip("/")
        return f"{endpoint}/{self.spaces_bucket}/{storage_key}"
