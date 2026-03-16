from fastapi import UploadFile

from app.models.schemas import (
    ATSCheckRequest,
    ATSUsageResponse,
    KeywordGapRequest,
    RegisteredUser,
    ResumeOptimizeRequest,
)
from app.services.ats_service import ATSService
from app.views.response_view import success_response


class ATSController:
    def __init__(self) -> None:
        self.service = ATSService()

    def health(self):
        return success_response({"message": "Talent Probe backend is running"})

    def check_ats(self, current_user: RegisteredUser, payload: ATSCheckRequest):
        result = self.service.check_ats(payload, current_user.user_id)
        return success_response(result.model_dump())

    def get_ats_usage(self, current_user: RegisteredUser):
        usage = ATSUsageResponse(**self.service.get_scan_usage(current_user.user_id))
        return success_response(usage.model_dump())

    def optimize_resume(self, payload: ResumeOptimizeRequest):
        result = self.service.optimize_resume(payload)
        return success_response(result.model_dump())

    def keyword_gap(self, payload: KeywordGapRequest):
        result = self.service.keyword_gap(payload)
        return success_response(result.model_dump())

    async def extract_resume_text(self, file: UploadFile):
        result = await self.service.extract_resume_text(file)
        return success_response(result.model_dump())
