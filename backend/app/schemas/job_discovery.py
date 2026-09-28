from pydantic import BaseModel


class DiscoveredJob(BaseModel):
    external_job_id: str
    title: str
    company: str
    location: str | None = None
    description: str | None = None
    redirect_url: str
    created: str | None = None
    contract_time: str | None = None
    category: str | None = None


class JobDiscoveryResponse(BaseModel):
    jobs: list[DiscoveredJob]
    total_results: int