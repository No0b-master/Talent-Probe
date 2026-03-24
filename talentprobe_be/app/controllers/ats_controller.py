from fastapi import UploadFile

from app.models.schemas import (
    ATSCheckRequest,
    ProfessionATSRequest,
    ProfessionATSResponse,
    ProfessionOption,
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

    def list_professions(self):
        items = [ProfessionOption(**item) for item in self.service.list_professions()]
        return success_response([item.model_dump() for item in items])

    def check_profession_ats(self, current_user: RegisteredUser, payload: ProfessionATSRequest):
        profession_id, profession_name, analysis_basis, analysis = self.service.check_profession_ats(
            payload,
            current_user.user_id,
        )
        response = ProfessionATSResponse(
            profession_id=profession_id,
            profession_name=profession_name,
            analysis_basis=analysis_basis,
            analysis=analysis,
        )
        return success_response(response.model_dump())

    def get_ats_usage(self, current_user: RegisteredUser):
        usage = ATSUsageResponse(**self.service.get_scan_usage(current_user.user_id))
        return success_response(usage.model_dump())

    def list_ats_history(self, current_user: RegisteredUser):
        items = self.service.list_scan_history(current_user.user_id)
        return success_response([item.model_dump() for item in items])

    def delete_ats_history_item(self, current_user: RegisteredUser, scan_id: int):
        self.service.delete_scan_history_item(current_user.user_id, scan_id)
        return success_response({"deleted": True, "scan_id": scan_id})

    def optimize_resume(self, current_user: RegisteredUser, payload: ResumeOptimizeRequest):
        self.service.consume_ai_quota(current_user.user_id)
        result = self.service.optimize_resume(payload)
        return success_response(result.model_dump())

    def keyword_gap(self, current_user: RegisteredUser, payload: KeywordGapRequest):
        self.service.consume_ai_quota(current_user.user_id)
        result = self.service.keyword_gap(payload)
        return success_response(result.model_dump())

    async def extract_resume_text(self, file: UploadFile):
        result = await self.service.extract_resume_text(file)
        return success_response(result.model_dump())
