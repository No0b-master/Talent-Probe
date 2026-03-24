from fastapi import APIRouter, Depends, HTTPException

from app.controllers.package_controller import PackageController
from app.models.schemas import RegisteredUser, SubscribePlanRequest
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Packages"])
controller = PackageController()


@router.get("/plans")
def list_plans(_: RegisteredUser = Depends(get_current_user)):
    return controller.list_plans()


@router.get("/plans/current")
def current_plan(current_user: RegisteredUser = Depends(get_current_user)):
    try:
        return controller.current_subscription(current_user)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/plans/subscribe")
def subscribe(payload: SubscribePlanRequest, current_user: RegisteredUser = Depends(get_current_user)):
    try:
        return controller.subscribe(current_user, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
