from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.scan import router as scan_router
from app.api.contacts import router as contacts_router


app = FastAPI(
    title="CardFlow AI",
    description="AI-powered visiting card scanner",
    version="1.0.0"
)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(scan_router)
app.include_router(contacts_router)


@app.get("/")
def root():
    return {
        "message": "CardFlow AI Backend is Running 🚀"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }