from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    gemini_api_key: str = ""
    voyage_api_key: str = ""
    github_token: str = ""
    calcom_api_key: str = ""
    calcom_event_type_id: str = ""
    vapi_api_key: str = ""

    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # Paths
    base_dir: Path = Path(__file__).resolve().parent.parent
    data_dir: Path = base_dir / "data"
    resume_path: Path = data_dir / "resume.pdf"
    repo_cards_dir: Path = data_dir / "repo_cards"
    chroma_dir: Path = data_dir / "chroma_db"

    # GitHub repos to ingest
    github_repos: list[str] = [
        "jiya-singhal/search-listings",
        "jiya-singhal/SingoneSong",
        "jiya-singhal/Contact-Manager-App",
        "jiya-singhal/PatientRecordSystem",
        "jiya-singhal/Book-Finder",
        "jiya-singhal/Social-Network-Friend-Recommendation-System",
        "jiya-singhal/weather-app",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
