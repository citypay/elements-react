#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERTS_DIR="$ROOT_DIR/certs"

CERT_FILE="$CERTS_DIR/localhost.pem"
KEY_FILE="$CERTS_DIR/localhost-key.pem"

mkdir -p "$CERTS_DIR"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

pushd "$TMP_DIR" >/dev/null

if command -v mkcert >/dev/null 2>&1; then
  echo "Installing local mkcert CA if needed..."
  mkcert -install

  echo "Generating localhost certificate with mkcert..."
  mkcert \
    -cert-file localhost.pem \
    -key-file localhost-key.pem \
    localhost 127.0.0.1 ::1
elif command -v openssl >/dev/null 2>&1; then
  echo "mkcert is not installed; generating a self-signed localhost certificate with OpenSSL..."

  cat > localhost-openssl.cnf <<'EOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

  openssl req \
    -x509 \
    -nodes \
    -newkey rsa:2048 \
    -days 825 \
    -keyout localhost-key.pem \
    -out localhost.pem \
    -config localhost-openssl.cnf
else
  echo "Error: neither mkcert nor openssl is installed or on PATH." >&2
  echo "" >&2
  echo "Install one of them, then re-run this script." >&2
  echo "Common options include:" >&2
  echo "  macOS (Homebrew):  brew install mkcert" >&2
  echo "  Linux: install mkcert or openssl with your distro package manager" >&2
  exit 1
fi

popd >/dev/null

mv "$TMP_DIR/localhost.pem" "$CERT_FILE"
mv "$TMP_DIR/localhost-key.pem" "$KEY_FILE"

echo "Done."
echo "Certificate: $CERT_FILE"
echo "Key:         $KEY_FILE"
