FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# Copy source first so hatchling can resolve the `app/` package
# referenced in pyproject.toml's [tool.hatch.build.targets.wheel].
COPY pyproject.toml ./
COPY app ./app

RUN pip install --no-cache-dir .

# Bring in the rest — including the baked RAG corpus
# (data/chroma_db, data/repo_cards, data/resume.pdf).
COPY . .

EXPOSE 8000

# Render injects $PORT; default 8000 for local docker run.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
