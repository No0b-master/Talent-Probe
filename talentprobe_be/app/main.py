import os
from datetime import timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.routes.auth_routes import router as auth_router
from app.routes.ats_routes import router as ats_router
from app.routes.package_routes import router as package_router
from app.routes.profile_routes import router as profile_router
from app.services.package_service import PackageService

load_dotenv()

app = FastAPI(
    title="Talent Probe UAE API",
    version="1.0.0",
    description="ATS checker and resume optimizer APIs for UAE market",
)


def _build_allowed_origins() -> list[str]:
    origins_from_env = os.getenv("ALLOWED_ORIGINS", "").strip()
    if origins_from_env:
        return [origin.strip() for origin in origins_from_env.split(",") if origin.strip()]

    return [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ats_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(package_router)


_scheduler: BackgroundScheduler | None = None


def _reset_expired_packages_job() -> None:
    PackageService().reset_expired_subscriptions()


@app.on_event("startup")
def _on_startup() -> None:
    global _scheduler

    # Run once on startup to keep user package state consistent.
    _reset_expired_packages_job()

    _scheduler = BackgroundScheduler(timezone=timezone.utc)
    _scheduler.add_job(
        _reset_expired_packages_job,
        trigger=CronTrigger(hour=0, minute=0),
        id="reset-expired-packages-midnight",
        replace_existing=True,
    )
    _scheduler.start()


@app.on_event("shutdown")
def _on_shutdown() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
