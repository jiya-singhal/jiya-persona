from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.booking import router as booking_router
from app.routes.chat import router as chat_router
from app.routes.openai_compat import router as openai_compat_router
from app.routes.voice import router as voice_router

app = FastAPI(title="Jiya Persona API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(chat_router)
app.include_router(booking_router)
app.include_router(openai_compat_router)
app.include_router(voice_router)
