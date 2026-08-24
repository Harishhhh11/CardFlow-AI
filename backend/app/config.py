import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")

    GOOGLE_CREDENTIALS_PATH = os.getenv(
        "GOOGLE_CREDENTIALS_PATH",
        "credentials/google-service-account.json"
    )


settings = Settings()