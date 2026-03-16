import os
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import mysql.connector
from fastapi import UploadFile
from mysql.connector.abstracts import MySQLConnectionAbstract

from app.models.schemas import (
    CandidateProfileResponse,
    CandidateProfileUpdateRequest,
    StoredResumeDetail,
    StoredResumeSummary,
)
from app.services.ats_service import ATSService
from app.services.storage_service import ResumeStorageService


class ProfileResumeService:
    MAX_RESUMES_PER_USER = 5

    def __init__(self) -> None:
        self.db_config = self._resolve_db_config()
        self.ats_service = ATSService()
        self.storage_service = ResumeStorageService()

    def get_profile(self, user_id: int) -> CandidateProfileResponse:
        query = """
            SELECT
                u.id AS user_id,
                u.full_name,
                u.email,
                u.profile_image_url,
                p.dob,
                p.current_organization,
                p.current_role,
                p.experience_years,
                p.linkedin_url,
                p.github_url,
                p.twitter_url
            FROM users u
            LEFT JOIN user_profiles p ON p.user_id = u.id
            WHERE u.id = %s
            LIMIT 1
        """

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, (user_id,))
            row = cursor.fetchone()

        if row is None:
            raise ValueError("User not found")

        return CandidateProfileResponse(**row)

    def upsert_profile(self, user_id: int, payload: CandidateProfileUpdateRequest) -> CandidateProfileResponse:
        with closing(self._get_connection()) as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET full_name = %s WHERE id = %s", (payload.full_name.strip(), user_id))

            cursor.execute(
                """
                INSERT INTO user_profiles (
                    user_id, dob, current_organization, `current_role`, experience_years,
                    linkedin_url, github_url, twitter_url, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    dob = VALUES(dob),
                    current_organization = VALUES(current_organization),
                    `current_role` = VALUES(`current_role`),
                    experience_years = VALUES(experience_years),
                    linkedin_url = VALUES(linkedin_url),
                    github_url = VALUES(github_url),
                    twitter_url = VALUES(twitter_url),
                    updated_at = VALUES(updated_at)
                """,
                (
                    user_id,
                    payload.dob,
                    self._normalize_optional_text(payload.current_organization),
                    self._normalize_optional_text(payload.current_role),
                    payload.experience_years,
                    self._normalize_optional_text(payload.linkedin_url),
                    self._normalize_optional_text(payload.github_url),
                    self._normalize_optional_text(payload.twitter_url),
                    self._now_utc(),
                ),
            )
            conn.commit()

        return self.get_profile(user_id)

    def list_resumes(self, user_id: int) -> list[StoredResumeSummary]:
        query = """
            SELECT
                id AS resume_id,
                original_filename AS file_name,
                file_type,
                character_count,
                created_at
            FROM user_resumes
            WHERE user_id = %s
            ORDER BY created_at DESC
        """

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, (user_id,))
            rows = cursor.fetchall()

        return [StoredResumeSummary(**row) for row in rows]

    def get_resume(self, user_id: int, resume_id: int) -> StoredResumeDetail:
        query = """
            SELECT
                id AS resume_id,
                original_filename AS file_name,
                file_type,
                character_count,
                created_at,
                extracted_text,
                storage_provider,
                file_url
            FROM user_resumes
            WHERE user_id = %s AND id = %s
            LIMIT 1
        """

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, (user_id, resume_id))
            row = cursor.fetchone()

        if row is None:
            raise ValueError("Resume not found")

        return StoredResumeDetail(**row)

    async def upload_resume(self, user_id: int, file: UploadFile) -> StoredResumeDetail:
        if not file.filename:
            raise ValueError("File name is required")

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT COUNT(*) AS total FROM user_resumes WHERE user_id = %s", (user_id,))
            row = cursor.fetchone() or {"total": 0}
            if int(row["total"]) >= self.MAX_RESUMES_PER_USER:
                raise ValueError(f"You can upload up to {self.MAX_RESUMES_PER_USER} resumes")

        file_bytes = await file.read()
        extracted = self.ats_service.extract_resume_text_from_bytes(file.filename, file_bytes)
        storage_info = self.storage_service.save_resume(user_id, file.filename, file_bytes)
        original_filename = self._ensure_file_name_extension(file.filename, extracted.file_type)

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO user_resumes (
                    user_id, original_filename, file_type, storage_provider,
                    storage_key, file_url, extracted_text, character_count, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    original_filename,
                    extracted.file_type,
                    storage_info["storage_provider"],
                    storage_info["storage_key"],
                    storage_info["file_url"],
                    extracted.extracted_text,
                    extracted.character_count,
                    self._now_utc(),
                ),
            )
            conn.commit()
            resume_id = int(cursor.lastrowid)

        return self.get_resume(user_id, resume_id)

    def delete_resume(self, user_id: int, resume_id: int) -> None:
        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT storage_key FROM user_resumes WHERE id = %s AND user_id = %s LIMIT 1",
                (resume_id, user_id),
            )
            row = cursor.fetchone()
            if row is None:
                raise ValueError("Resume not found")

            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_resumes WHERE id = %s AND user_id = %s", (resume_id, user_id))
            conn.commit()

        self.storage_service.delete_resume(row["storage_key"])

    def get_local_resume_download(self, user_id: int, resume_id: int) -> tuple[Path, str]:
        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT original_filename, storage_provider, storage_key
                FROM user_resumes
                WHERE id = %s AND user_id = %s
                LIMIT 1
                """,
                (resume_id, user_id),
            )
            row = cursor.fetchone()

        if row is None:
            raise ValueError("Resume not found")

        if row["storage_provider"] != "local":
            raise ValueError("Direct download endpoint is available only for local storage")

        file_path = self.storage_service.local_base_dir / row["storage_key"]
        if not file_path.exists():
            raise ValueError("Stored file is missing")

        return file_path, row["original_filename"]

    def get_resume_file(self, user_id: int, resume_id: int) -> tuple[bytes, str, str]:
        query = """
            SELECT original_filename, storage_provider, storage_key
            FROM user_resumes
            WHERE id = %s AND user_id = %s
            LIMIT 1
        """

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, (resume_id, user_id))
            row = cursor.fetchone()

        if row is None:
            raise ValueError("Resume not found")

        content = self.storage_service.read_resume(
            storage_provider=row["storage_provider"],
            storage_key=row["storage_key"],
        )

        file_name = row["original_filename"]
        content_type = self.storage_service.guess_content_type(file_name)
        return content, file_name, content_type

    def _get_connection(self, include_database: bool = True) -> MySQLConnectionAbstract:
        config = {
            "host": self.db_config["host"],
            "port": self.db_config["port"],
            "user": self.db_config["user"],
            "password": self.db_config["password"],
        }

        if include_database:
            config["database"] = self.db_config["database"]

        return mysql.connector.connect(**config)

    @staticmethod
    def _resolve_db_config() -> dict[str, Any]:
        host = os.getenv("MYSQL_HOST", "localhost")
        port = int(os.getenv("MYSQL_PORT", "3306"))
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "talent_probe")

        return {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "database": database,
        }

    @staticmethod
    def _normalize_optional_text(value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @staticmethod
    def _ensure_file_name_extension(file_name: str, file_type: str) -> str:
        trimmed = (file_name or "resume").strip()
        if not trimmed:
            trimmed = "resume"

        extension = file_type.lower().lstrip('.')
        if not extension:
            return trimmed

        if trimmed.lower().endswith(f".{extension}"):
            return trimmed
        return f"{trimmed}.{extension}"

    @staticmethod
    def _now_utc() -> datetime:
        return datetime.now(timezone.utc).replace(tzinfo=None)
