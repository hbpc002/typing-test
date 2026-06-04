#!/bin/sh
CERT_DIR=/etc/nginx/ssl
if [ ! -f "$CERT_DIR/typing.crt" ] || [ ! -f "$CERT_DIR/typing.key" ]; then
  echo "Generating self-signed SSL certificate..."
  mkdir -p $CERT_DIR
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout $CERT_DIR/typing.key \
    -out $CERT_DIR/typing.crt \
    -subj "/CN=typing.local" 2>/dev/null
  echo "SSL certificate generated."
fi
