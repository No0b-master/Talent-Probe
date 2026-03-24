from app.models.schemas import CurrentSubscription, RegisteredUser, SubscribePlanRequest, SubscriptionPlan
from app.services.package_service import PackageService
from app.views.response_view import success_response


class PackageController:
    def __init__(self) -> None:
        self.service = PackageService()

    def list_plans(self):
        items = [SubscriptionPlan(**item) for item in self.service.list_plans()]
        return success_response([item.model_dump() for item in items])

    def current_subscription(self, current_user: RegisteredUser):
        current = CurrentSubscription(**self.service.get_current_subscription(current_user.user_id))
        return success_response(current.model_dump())

    def subscribe(self, current_user: RegisteredUser, payload: SubscribePlanRequest):
        # Gateway integration will replace this mock-success activation flow.
        current = CurrentSubscription(**self.service.subscribe_plan(current_user.user_id, payload.plan_code))
        return success_response(current.model_dump())
