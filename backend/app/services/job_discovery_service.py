import httpx

from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.job_discovery import (
    DiscoveredJob,
    JobDiscoveryResponse,
)


ADZUNA_SEARCH_URL = (
    "https://api.adzuna.com/v1/api/jobs/in/search/1"
)


def discover_jobs(
    query: str,
    location: str | None = None,
) -> JobDiscoveryResponse:
    params = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_app_key,
        "results_per_page": 10,
        "what": query,
        "content-type": "application/json",
        "sort_by": "date",
    }

    if location:
        params["where"] = location

    try:
        response = httpx.get(
            ADZUNA_SEARCH_URL,
            params=params,
            timeout=10.0,
        )

        response.raise_for_status()

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to fetch jobs from Adzuna.",
        ) from exc

    data = response.json()

    jobs: list[DiscoveredJob] = []

    for item in data.get("results", []):
        company = item.get("company") or {}
        job_location = item.get("location") or {}
        category = item.get("category") or {}

        redirect_url = item.get("redirect_url")

        if not redirect_url:
            continue

        jobs.append(
            DiscoveredJob(
                external_job_id=str(
                    item.get("id", "")
                ),
                title=item.get(
                    "title",
                    "Untitled role",
                ),
                company=company.get(
                    "display_name",
                    "Unknown company",
                ),
                location=job_location.get(
                    "display_name"
                ),
                description=item.get("description"),
                redirect_url=redirect_url,
                created=item.get("created"),
                contract_time=item.get(
                    "contract_time"
                ),
                category=category.get("label"),
            )
        )

    return JobDiscoveryResponse(
        jobs=jobs,
        total_results=data.get("count", 0),
    )