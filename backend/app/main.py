from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base
from app.db.migrations import run_schema_migration
import app.models  # noqa: F401


# On startup, first apply the safe data-preserving schema migration (if the DB
# already exists), then auto-create any missing tables. This is suitable for
# development and simple setup without a full Alembic migration pipeline.
@asynccontextmanager
async def lifespan(app: FastAPI):
    run_schema_migration(engine)
    Base.metadata.create_all(bind=engine)
    yield


is_dev = settings.ENVIRONMENT == "development"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if is_dev else None,
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "version": settings.VERSION}
