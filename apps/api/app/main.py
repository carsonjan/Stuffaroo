from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import close_pool
from app.routers import listings, me, profiles, wanted


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    close_pool()


app = FastAPI(title="Stuffaroo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(me.router)
app.include_router(listings.router)
app.include_router(profiles.router)
app.include_router(wanted.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
