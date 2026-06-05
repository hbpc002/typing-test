#!/bin/sh
CERT_DIR=/etc/nginx/ssl
if [ ! -f "$CERT_DIR/typing.crt" ] || [ ! -f "$CERT_DIR/typing.key" ]; then
  echo "[generate-cert] Certificates missing at $CERT_DIR, attempting to generate..."
  mkdir -p $CERT_DIR 2>/dev/null || {
    echo "[generate-cert] ERROR: cannot create $CERT_DIR (read-only mount?). Built-in certificates from the image should already exist." >&2
    exit 1
  }
  if ! openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout $CERT_DIR/typing.key \
    -out $CERT_DIR/typing.crt \
    -subj "/CN=typing.local"; then
    echo "[generate-cert] ERROR: openssl failed to generate certificate. Check that $CERT_DIR is writable." >&2
    exit 1
  fi
  echo "[generate-cert] SSL certificate generated."
else
  echo "[generate-cert] Using existing certificates at $CERT_DIR."
fi
