#!/bin/sh
# Build and run the API in Docker with secrets passed at runtime, never baked
# into the image. Usage: scripts/api-docker.sh [serve|check]
#   serve (default)  run the API on http://localhost:8000
#   check            run `pnpm check:setup` inside the container
set -e
cd "$(dirname "$0")/.."

ENV_FILE=apps/api/.env
KEY_FILE=apps/api/gcp-key.json

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Get it from a teammate (privately) or copy apps/api/.env.example." >&2
  exit 1
fi

docker build -q -t stuffaroo-api apps/api >/dev/null

set -- "${1:-serve}"
RUN_ARGS="--rm --env-file $ENV_FILE -e STUFFAROO_CONTAINER=1 --user $(id -u):$(id -g)"
if [ -f "$KEY_FILE" ]; then
  # Vertex AI with the service-account key, mounted read-only.
  RUN_ARGS="$RUN_ARGS -v $(pwd)/$KEY_FILE:/app/gcp-key.json:ro -e GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json"
else
  # No key file: a container has no Google login, so use GEMINI_API_KEY.
  echo "No $KEY_FILE; Gemini will use GEMINI_API_KEY (or the keyword fallback)." >&2
  RUN_ARGS="$RUN_ARGS -e GOOGLE_GENAI_USE_VERTEXAI=false"
fi

if [ "$1" = "check" ]; then
  # shellcheck disable=SC2086
  exec docker run $RUN_ARGS stuffaroo-api python -W ignore -m app.doctor
fi
# shellcheck disable=SC2086
exec docker run $RUN_ARGS -p 8000:8000 stuffaroo-api
