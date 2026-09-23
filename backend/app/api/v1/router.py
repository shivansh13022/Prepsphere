from fastapi import APIRouter

from app.api.v1.endpoints import (
    health,
    users,
    auth,
    resumes,
    candidate_profile,
    jobs,
    interviews,
    speech,
)


router = APIRouter()

router.include_router(health.router)

router.include_router(users.router)

router.include_router(auth.router)

router.include_router(resumes.router)

router.include_router(
    candidate_profile.router,
    tags=["Candidate Profile"],
)

router.include_router(
    jobs.router,
    tags=["Jobs"],
)

router.include_router(
    interviews.router,
    tags=["Interviews"],
)

router.include_router(
    speech.router,
    tags=["Speech"],
)