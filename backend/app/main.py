from fastapi import FastAPI

from app.api.v1.router import router as api_v1_router


app = FastAPI(
    title="PrepSphere API",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "PrepSphere API is running"}


app.include_router(
    api_v1_router,
    prefix="/api/v1",
)