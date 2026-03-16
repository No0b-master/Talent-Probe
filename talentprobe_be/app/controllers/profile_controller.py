from app.models.schemas import CandidateProfileUpdateRequest, RegisteredUser
from app.services.profile_resume_service import ProfileResumeService
from app.views.response_view import success_response


class ProfileController:
    def __init__(self) -> None:
        self.service = ProfileResumeService()

    def get_profile(self, current_user: RegisteredUser):
        profile = self.service.get_profile(current_user.user_id)
        return success_response(profile.model_dump())

    def update_profile(self, current_user: RegisteredUser, payload: CandidateProfileUpdateRequest):
        profile = self.service.upsert_profile(current_user.user_id, payload)
        return success_response(profile.model_dump())

    def list_resumes(self, current_user: RegisteredUser):
        resumes = self.service.list_resumes(current_user.user_id)
        return success_response([resume.model_dump() for resume in resumes])

    def get_resume(self, current_user: RegisteredUser, resume_id: int):
        resume = self.service.get_resume(current_user.user_id, resume_id)
        return success_response(resume.model_dump())

    async def upload_resume(self, current_user: RegisteredUser, file):
        resume = await self.service.upload_resume(current_user.user_id, file)
        return success_response(resume.model_dump(), status_code=201)

    def delete_resume(self, current_user: RegisteredUser, resume_id: int):
        self.service.delete_resume(current_user.user_id, resume_id)
        return success_response({"deleted": True, "resume_id": resume_id})

    def get_local_resume_download(self, current_user: RegisteredUser, resume_id: int):
        return self.service.get_local_resume_download(current_user.user_id, resume_id)

    def get_resume_file(self, current_user: RegisteredUser, resume_id: int):
        return self.service.get_resume_file(current_user.user_id, resume_id)
