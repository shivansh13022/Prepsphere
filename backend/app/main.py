from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router
from app.core.config import settings


app = FastAPI(
    title="PrepSphere API",
    version="0.1.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

allowed_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    settings.frontend_url.rstrip("/"),
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------

@app.get("/")
def root():
    return {"message": "PrepSphere API is running"}


app.include_router(
    api_v1_router,
    prefix="/api/v1",
)