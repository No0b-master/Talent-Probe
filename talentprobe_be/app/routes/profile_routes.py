from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.controllers.profile_controller import ProfileController
from app.models.schemas import CandidateProfileUpdateRequest, RegisteredUser
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Profile"])
controller = ProfileController()


@router.get("/profile")
def get_profile(current_user: RegisteredUser = Depends(get_current_user)):
    try:
        return controller.get_profile(current_user)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/profile")
def update_profile(
    payload: CandidateProfileUpdateRequest,
    current_user: RegisteredUser = Depends(get_current_user),
):
    try:
        return controller.update_profile(current_user, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/resumes")
def list_resumes(current_user: RegisteredUser = Depends(get_current_user)):
    return controller.list_resumes(current_user)


@router.get("/resumes/{resume_id}")
def get_resume(resume_id: int, current_user: RegisteredUser = Depends(get_current_user)):
    try:
        return controller.get_resume(current_user, resume_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/resumes/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: RegisteredUser = Depends(get_current_user),
):
    try:
        return await controller.upload_resume(current_user, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, current_user: RegisteredUser = Depends(get_current_user)):
    try:
        return controller.delete_resume(current_user, resume_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/resumes/{resume_id}/download")
def download_resume(resume_id: int, current_user: RegisteredUser = Depends(get_current_user)):
    try:
        content, file_name, content_type = controller.get_resume_file(current_user, resume_id)
        encoded_name = quote(file_name)
        headers = {
            "Content-Disposition": f"attachment; filename=\"{file_name}\"; filename*=UTF-8''{encoded_name}"
        }

        return StreamingResponse(
            BytesIO(content),
            media_type=content_type,
            headers=headers,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
