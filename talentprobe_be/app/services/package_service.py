from contextlib import closing
from datetime import datetime, timedelta, timezone
import json
from typing import Any
from uuid import uuid4

import mysql.connector
from mysql.connector.abstracts import MySQLConnectionAbstract

from app.services.invoice_service import InvoiceService
from app.services.migration_service import MigrationService
from app.services.storage_service import InvoiceStorageService


class PackageService:
    def __init__(self) -> None:
        MigrationService().run_migrations()
        self.db_config = self._resolve_db_config()
        self.invoice_service = InvoiceService()
        self.invoice_storage = InvoiceStorageService()

    def list_plans(self) -> list[dict[str, Any]]:
        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT plan_code, plan_name, daily_limit, price_usd, duration_days
                FROM subscription_plans
                WHERE is_active = 1
                ORDER BY sort_order ASC, id ASC
                """
            )
            rows = cursor.fetchall()

        items: list[dict[str, Any]] = []
        for row in rows:
            price = float(row.get("price_usd") or 0)
            items.append(
                {
                    "plan_code": str(row["plan_code"]),
                    "plan_name": str(row["plan_name"]),
                    "daily_limit": int(row["daily_limit"]),
                    "price_usd": price,
                    "duration_days": int(row.get("duration_days") or 30),
                    "is_free": price <= 0,
                }
            )

        return items

    def get_current_subscription(self, user_id: int) -> dict[str, Any]:
        with closing(self._get_connection()) as conn:
            row = self._fetch_user_subscription_row(conn, user_id)

        if row is None:
            raise ValueError("User not found")

        return self._normalize_subscription_row(row)

    def subscribe_plan(self, user_id: int, plan_code: str) -> dict[str, Any]:
        normalized_code = plan_code.strip().lower()
        now_utc = self._now_utc()
        transaction_ref = self._build_transaction_ref(user_id)

        audit_payload: dict[str, Any] = {
            "transaction_ref": transaction_ref,
            "user_id": user_id,
            "plan_code": normalized_code,
            "plan_name": None,
            "amount_usd": None,
            "status": "failed",
            "payment_provider": "internal_mock",
            "payment_method": "platform_wallet",
            "invoice_storage_provider": None,
            "invoice_storage_key": None,
            "invoice_file_url": None,
            "error_message": None,
            "metadata": {"source": "plans.subscribe", "flow": "mock_gateway"},
            "created_at": now_utc,
        }

        with closing(self._get_connection()) as conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute(
                    """
                    SELECT plan_code, plan_name, daily_limit, price_usd, duration_days
                    FROM subscription_plans
                    WHERE plan_code = %s AND is_active = 1
                    LIMIT 1
                    """,
                    (normalized_code,),
                )
                plan = cursor.fetchone()

                if plan is None:
                    raise ValueError("Selected plan is not available")

                billing_profile = self._fetch_user_billing_profile(conn, user_id)
                if billing_profile is None:
                    raise ValueError("User not found")

                duration_days = int(plan.get("duration_days") or 30)
                expires_at = now_utc + timedelta(days=duration_days)
                amount_usd = float(plan.get("price_usd") or 0)

                audit_payload["plan_code"] = str(plan["plan_code"])
                audit_payload["plan_name"] = str(plan["plan_name"])
                audit_payload["amount_usd"] = amount_usd

                invoice_bytes = self.invoice_service.build_subscription_invoice(
                    transaction_ref=transaction_ref,
                    user_full_name=str(billing_profile["full_name"]),
                    user_email=str(billing_profile["email"]),
                    plan_name=str(plan["plan_name"]),
                    plan_code=str(plan["plan_code"]),
                    amount_usd=amount_usd,
                    period_start=now_utc,
                    period_end=expires_at,
                    issued_at=now_utc,
                )

                invoice_result = self.invoice_storage.save_invoice(user_id, transaction_ref, invoice_bytes)

                audit_payload["invoice_storage_provider"] = invoice_result.get("storage_provider")
                audit_payload["invoice_storage_key"] = invoice_result.get("storage_key")
                audit_payload["invoice_file_url"] = invoice_result.get("file_url")
                audit_payload["status"] = "success"
                audit_payload["metadata"] = {
                    "source": "plans.subscribe",
                    "flow": "mock_gateway",
                    "duration_days": duration_days,
                    "issued_at_utc": now_utc.isoformat(),
                }

                update_cursor = conn.cursor()
                update_cursor.execute(
                    """
                    UPDATE users
                    SET
                        current_plan_code = %s,
                        daily_scan_limit = %s,
                        plan_started_at = %s,
                        plan_expires_at = %s
                    WHERE id = %s
                    """,
                    (
                        plan["plan_code"],
                        int(plan["daily_limit"]),
                        now_utc,
                        expires_at,
                        user_id,
                    ),
                )

                if update_cursor.rowcount == 0:
                    raise ValueError("User not found")

                self._insert_payment_audit_log(conn, audit_payload)
                conn.commit()

                current_row = self._fetch_user_subscription_row(conn, user_id)
            except Exception as exc:
                conn.rollback()
                audit_payload["status"] = "failed"
                audit_payload["error_message"] = str(exc)
                self._insert_payment_audit_log_best_effort(audit_payload)
                raise

        if current_row is None:
            raise ValueError("User not found")

        return self._normalize_subscription_row(current_row)

    def reset_expired_subscriptions(self) -> int:
        now_utc = self._now_utc()

        with closing(self._get_connection()) as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT daily_limit
                FROM subscription_plans
                WHERE plan_code = 'basic'
                LIMIT 1
                """
            )
            basic_plan = cursor.fetchone()

            if basic_plan is None:
                return 0

            basic_limit = int(basic_plan.get("daily_limit") or 3)

            update_cursor = conn.cursor()
            update_cursor.execute(
                """
                UPDATE users
                SET
                    current_plan_code = 'basic',
                    daily_scan_limit = %s,
                    plan_started_at = %s,
                    plan_expires_at = NULL
                WHERE
                    plan_expires_at IS NOT NULL
                    AND plan_expires_at <= %s
                    AND current_plan_code <> 'basic'
                """,
                (basic_limit, now_utc, now_utc),
            )
            conn.commit()
            return int(update_cursor.rowcount or 0)

    @staticmethod
    def _normalize_subscription_row(row: dict[str, Any]) -> dict[str, Any]:
        price = float(row.get("price_usd") or 0)
        plan_code = str(row.get("current_plan_code") or "basic")
        return {
            "current_plan_code": plan_code,
            "current_plan_name": str(row.get("plan_name") or plan_code.title()),
            "daily_limit": int(row.get("daily_scan_limit") or 3),
            "price_usd": price,
            "started_at": row.get("plan_started_at"),
            "expires_at": row.get("plan_expires_at"),
            "is_active_paid": plan_code != "basic" and price > 0,
        }

    @staticmethod
    def _fetch_user_subscription_row(conn: MySQLConnectionAbstract, user_id: int) -> dict[str, Any] | None:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                u.current_plan_code,
                u.daily_scan_limit,
                u.plan_started_at,
                u.plan_expires_at,
                sp.plan_name,
                sp.price_usd
            FROM users u
            LEFT JOIN subscription_plans sp ON sp.plan_code = u.current_plan_code
            WHERE u.id = %s
            LIMIT 1
            """,
            (user_id,),
        )
        return cursor.fetchone()

    @staticmethod
    def _fetch_user_billing_profile(conn: MySQLConnectionAbstract, user_id: int) -> dict[str, Any] | None:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, full_name, email
            FROM users
            WHERE id = %s
            LIMIT 1
            """,
            (user_id,),
        )
        return cursor.fetchone()

    def _insert_payment_audit_log(self, conn: MySQLConnectionAbstract, payload: dict[str, Any]) -> None:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO payment_audit_logs (
                transaction_ref,
                user_id,
                plan_code,
                plan_name,
                amount_usd,
                currency,
                status,
                payment_provider,
                payment_method,
                invoice_storage_provider,
                invoice_storage_key,
                invoice_file_url,
                error_message,
                metadata_json,
                created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                payload["transaction_ref"],
                payload["user_id"],
                payload.get("plan_code"),
                payload.get("plan_name"),
                payload.get("amount_usd"),
                "USD",
                payload["status"],
                payload.get("payment_provider") or "internal_mock",
                payload.get("payment_method"),
                payload.get("invoice_storage_provider"),
                payload.get("invoice_storage_key"),
                payload.get("invoice_file_url"),
                payload.get("error_message"),
                json.dumps(payload.get("metadata") or {}, ensure_ascii=True),
                payload["created_at"],
            ),
        )

    def _insert_payment_audit_log_best_effort(self, payload: dict[str, Any]) -> None:
        try:
            with closing(self._get_connection()) as conn:
                self._insert_payment_audit_log(conn, payload)
                conn.commit()
        except Exception:
            return

    @staticmethod
    def _build_transaction_ref(user_id: int) -> str:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        return f"TP-{user_id}-{stamp}-{uuid4().hex[:8].upper()}"

    def _get_connection(self) -> MySQLConnectionAbstract:
        return mysql.connector.connect(
            host=self.db_config["host"],
            port=self.db_config["port"],
            user=self.db_config["user"],
            password=self.db_config["password"],
            database=self.db_config["database"],
        )

    @staticmethod
    def _resolve_db_config() -> dict[str, Any]:
        import os

        return {
            "host": os.getenv("MYSQL_HOST", "localhost"),
            "port": int(os.getenv("MYSQL_PORT", "3306")),
            "user": os.getenv("MYSQL_USER", "root"),
            "password": os.getenv("MYSQL_PASSWORD", ""),
            "database": os.getenv("MYSQL_DATABASE", "talent_probe"),
        }

    @staticmethod
    def _now_utc() -> datetime:
        return datetime.now(timezone.utc).replace(tzinfo=None)
