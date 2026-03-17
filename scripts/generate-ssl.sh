#!/usr/bin/env bash
# Generate self-signed SSL certificates for local development.
# Run this once after cloning the repository.
#
# Usage: bash scripts/generate-ssl.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

SSL_DIRS=(
    "$PROJECT_ROOT/docker/nginx/ssl"
    "$PROJECT_ROOT/docker/pgadmin/ssl"
    "$PROJECT_ROOT/docker_build/proxy/ssl"
)

DAYS_VALID=365
SUBJECT="/C=NL/ST=Gelderland/L=Nijmegen/O=MaskAnyone/CN=localhost"

for dir in "${SSL_DIRS[@]}"; do
    mkdir -p "$dir"
    if [[ -f "$dir/server.key" && -f "$dir/server.cert" ]]; then
        echo "Certificates already exist in $dir — skipping."
        continue
    fi
    echo "Generating self-signed certificate in $dir ..."
    openssl req -x509 -nodes -newkey rsa:2048 \
        -keyout "$dir/server.key" \
        -out "$dir/server.cert" \
        -days "$DAYS_VALID" \
        -subj "$SUBJECT" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
        2>/dev/null
    echo "  -> $dir/server.key"
    echo "  -> $dir/server.cert"
done

echo "Done. SSL certificates generated for local development."
