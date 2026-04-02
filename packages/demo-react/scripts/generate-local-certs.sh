#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERTS_DIR="$ROOT_DIR/certs"

CERT_FILE="$CERTS_DIR/localhost.pem"
KEY_FILE="$CERTS_DIR/localhost-key.pem"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "Error: mkcert is not installed or not on PATH." >&2
  echo "" >&2
  echo "Install mkcert, then re-run this script." >&2
  echo "See the official mkcert README for install instructions." >&2
  echo "Common options include:" >&2
  echo "  macOS (Homebrew):  brew install mkcert" >&2
  echo "  Linux: see the mkcert README for your distro" >&2
  exit 1
fi

mkdir -p "$CERTS_DIR"

echo "Installing local mkcert CA if needed..."
mkcert -install

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

pushd "$TMP_DIR" >/dev/null

echo "Generating localhost certificate..."
mkcert \
  -cert-file localhost.pem \
  -key-file localhost-key.pem \
  localhost 127.0.0.1 ::1

popd >/dev/null

mv "$TMP_DIR/localhost.pem" "$CERT_FILE"
mv "$TMP_DIR/localhost-key.pem" "$KEY_FILE"

echo "Done."
echo "Certificate: $CERT_FILE"
echo "Key:         $KEY_FILE"