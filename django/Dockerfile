FROM python:3.13-alpine

COPY --from=ghcr.io/astral-sh/uv:0.9.9 /uv /uvx /bin/

# Install system dependencies for psycopg and other C extensions
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libpq

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project configuration
COPY django/pyproject.toml django/uv.lock /app/

# Install dependencies (using --no-install-project because the source isn't copied yet)
RUN uv sync --frozen --no-install-project --no-dev

# Copy the source code
COPY ./django /app

# Expose port 8000
EXPOSE 8000

# Use uv run to execute manage.py
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
