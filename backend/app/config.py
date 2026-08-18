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

    # GitHub repos to ingest — curated set of strongest work; the frontend
    # activity feed shows all public repos regardless of this list.
    github_repos: list[str] = [
        "jiya-singhal/voicequal",
        "jiya-singhal/KV-Cache",
        "jiya-singhal/Distributed-Live-Polling-System",
        "jiya-singhal/agentic-workflow",
        "jiya-singhal/devops-ci-cd",
        "jiya-singhal/singing_detection",
        "jiya-singhal/jiya-persona",
        # search-listings temporarily excluded: its Repo Card needs a Gemini
        # call and the API key's monthly spend cap is currently exhausted.
        # Re-add once the cap resets or the key is swapped.
        # "jiya-singhal/search-listings",
        "jiya-singhal/SingoneSong",
        "jiya-singhal/Social-Network-Friend-Recommendation-System",
        "jiya-singhal/PatientRecordSystem",
        "jiya-singhal/Book-Finder",
        "jiya-singhal/Contact-Manager-App",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
