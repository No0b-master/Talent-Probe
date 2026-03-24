from contextlib import closing
from datetime import datetime, timedelta, timezone
from typing import Any

import mysql.connector
from mysql.connector.abstracts import MySQLConnectionAbstract

from app.services.migration_service import MigrationService


class PackageService:
    def __init__(self) -> None:
        MigrationService().run_migrations()
        self.db_config = self._resolve_db_config()

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

        with closing(self._get_connection()) as conn:
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

            duration_days = int(plan.get("duration_days") or 30)
            expires_at = now_utc + timedelta(days=duration_days)

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
            conn.commit()

            if update_cursor.rowcount == 0:
                raise ValueError("User not found")

            current_row = self._fetch_user_subscription_row(conn, user_id)

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
