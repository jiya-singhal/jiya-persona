"""Fetch GitHub repo metadata and representative files for auto-summarization."""

import base64
import logging
from dataclasses import dataclass, field
from github import Github, GithubException
from github.Repository import Repository
from github.ContentFile import ContentFile

logger = logging.getLogger(__name__)

SKIP_DIRS = {
    "node_modules", "dist", "build", ".next", "__pycache__",
    ".git", ".idea", ".vscode", "vendor", "target", ".gradle",
    "coverage", ".nyc_output", "egg-info", ".pytest_cache",
    "out", ".cache", ".turbo", ".parcel-cache",
}

SKIP_EXTENSIONS = {
    ".lock", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".wav", ".ogg",
    ".flac", ".m4a", ".avi", ".mov", ".mkv",
    ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
    ".exe", ".dll", ".so", ".dylib", ".pyc", ".pyo", ".class", ".jar",
    ".min.js", ".min.css", ".map", ".bundle.js", ".chunk.js",
    ".pdf", ".docx", ".xlsx", ".pptx",
    ".sqlite", ".db", ".bin", ".dat",
}

SKIP_FILENAMES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "poetry.lock", "uv.lock", "Pipfile.lock", "Cargo.lock",
    "composer.lock", "Gemfile.lock", "go.sum",
    ".DS_Store", "Thumbs.db",
}

MAX_FILE_BYTES = 100_000

PRIORITY_NAMES = {
    "README", "README.md", "readme.md", "LICENSE",
    "package.json", "requirements.txt", "pyproject.toml", "pom.xml",
    "Gemfile", "go.mod", "Cargo.toml",
    "next.config.js", "next.config.mjs", "vite.config.js", "vite.config.ts",
    "tsconfig.json", "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
}

PRIORITY_PATTERNS = {"main.", "index.", "app.", "server.", "routes/", "controllers/"}

MAX_FILES_PER_REPO = 20
MAX_BYTES_PER_REPO = 100_000


@dataclass
class RepoData:
    name: str
    full_name: str
    description: str | None
    languages: dict[str, int]
    stars: int
    last_commit_date: str
    total_commits: int
    created_at: str
    default_branch: str
    file_tree: list[str]
    selected_files: dict[str, str] = field(default_factory=dict)


def _should_skip_path(path: str) -> bool:
    parts = path.split("/")
    name = parts[-1]
    if name in SKIP_FILENAMES:
        return True
    for part in parts:
        if part in SKIP_DIRS:
            return True
    lower = path.lower()
    for ext in SKIP_EXTENSIONS:
        if lower.endswith(ext):
            return True
    return False


def _priority_score(path: str) -> int:
    name = path.split("/")[-1]
    if name in PRIORITY_NAMES:
        return 0
    for pattern in PRIORITY_PATTERNS:
        if pattern in path:
            return 1
    # Config files
    if name.endswith((".json", ".toml", ".yaml", ".yml")) and "/" not in path:
        return 2
    # Source files
    if name.endswith((".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rs")):
        return 3
    return 4


def _get_file_tree(repo: Repository) -> list[str]:
    try:
        tree = repo.get_git_tree(sha=repo.default_branch, recursive=True)
        return [item.path for item in tree.tree if item.type == "blob"]
    except GithubException:
        logger.warning(f"Could not get tree for {repo.full_name}")
        return []


def _select_files(file_tree: list[str]) -> list[str]:
    candidates = [f for f in file_tree if not _should_skip_path(f)]
    candidates.sort(key=_priority_score)
    return candidates[:MAX_FILES_PER_REPO]


def _fetch_file_content(repo: Repository, path: str) -> str | None:
    try:
        content_file: ContentFile = repo.get_contents(path)
        if content_file.size and content_file.size > MAX_FILE_BYTES:
            return None
        if content_file.encoding == "base64" and content_file.content:
            decoded = base64.b64decode(content_file.content).decode("utf-8", errors="replace")
            return decoded
        return None
    except (GithubException, UnicodeDecodeError):
        return None


def fetch_repo(github_token: str, repo_full_name: str) -> RepoData:
    g = Github(github_token)
    repo = g.get_repo(repo_full_name)

    languages = repo.get_languages()

    try:
        commits = repo.get_commits()
        total_commits = commits.totalCount
        last_commit_date = commits[0].commit.committer.date.isoformat() if total_commits > 0 else ""
    except GithubException:
        total_commits = 0
        last_commit_date = ""

    file_tree = _get_file_tree(repo)
    selected_paths = _select_files(file_tree)

    selected_files = {}
    total_bytes = 0
    for path in selected_paths:
        if total_bytes >= MAX_BYTES_PER_REPO:
            break
        content = _fetch_file_content(repo, path)
        if content:
            total_bytes += len(content.encode("utf-8"))
            selected_files[path] = content

    return RepoData(
        name=repo.name,
        full_name=repo.full_name,
        description=repo.description,
        languages=dict(languages),
        stars=repo.stargazers_count,
        last_commit_date=last_commit_date,
        total_commits=total_commits,
        created_at=repo.created_at.isoformat() if repo.created_at else "",
        default_branch=repo.default_branch,
        file_tree=file_tree,
        selected_files=selected_files,
    )
