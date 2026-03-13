FROM python:3.10-alpine

COPY --from=ghcr.io/astral-sh/uv:0.9.9 /uv /uvx /bin/

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libpq \
    tzdata

ENV TZ Asia/Ho_Chi_Minh

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project configuration
COPY pyproject.toml uv.lock /app/

# Install dependencies (using --no-install-project because the source isn't copied yet)
RUN uv sync --frozen --no-install-project --no-dev

# Copy scripts and related files
COPY send_reminder.py .
COPY no_reminder_email_list.txt .
COPY send_report.py .
COPY template /app/template
