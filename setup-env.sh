#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
SERVER_ENV_FILE="$ROOT_DIR/packages/demo-server/.env.local"
REACT_ENV_FILE="$ROOT_DIR/packages/demo-react/.env.local"

escape_env_value() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

prompt_required() {
  local var_name="$1"
  local prompt_text="$2"
  local secret="${3:-false}"
  local value=""

  while [[ -z "$value" ]]; do
    if [[ "$secret" == "true" ]]; then
      read -r -s -p "$prompt_text: " value
      echo
    else
      read -r -p "$prompt_text: " value
    fi

    [[ -n "$value" ]] || echo "$var_name cannot be empty."
  done

  printf '%s' "$value"
}

confirm_overwrite() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local response
    read -r -p "$file already exists. Overwrite? [y/N]: " response
    case "$response" in
      y|Y|yes|YES) return 0 ;;
      *) echo "Skipped $file"; return 1 ;;
    esac
  fi
  return 0
}

if [[ ! -d "$ROOT_DIR/packages/demo-server" || ! -d "$ROOT_DIR/packages/demo-react" ]]; then
  echo "Error: run this script from the repository root."
  exit 1
fi

echo "CityPay demo environment setup"
echo

EX_CP_CLIENT_ID="$(prompt_required "EX_CP_CLIENT_ID" "Client ID")"
EX_CP_LICENSE_KEY="$(prompt_required "EX_CP_LICENSE_KEY" "License key" true)"
EX_CP_MID="$(prompt_required "EX_CP_MID" "Merchant ID")"
NEXT_PUBLIC_EX_CP_PUBLIC_KEY="$(prompt_required "NEXT_PUBLIC_EX_CP_PUBLIC_KEY" "Public key")"

mkdir -p "$(dirname "$SERVER_ENV_FILE")" "$(dirname "$REACT_ENV_FILE")"

if confirm_overwrite "$SERVER_ENV_FILE"; then
  cat > "$SERVER_ENV_FILE" <<EOF
EX_CP_CLIENT_ID=$(escape_env_value "$EX_CP_CLIENT_ID")
EX_CP_LICENSE_KEY=$(escape_env_value "$EX_CP_LICENSE_KEY")
EX_CP_MID=$(escape_env_value "$EX_CP_MID")
EOF
  echo "Wrote $SERVER_ENV_FILE"
fi

if confirm_overwrite "$REACT_ENV_FILE"; then
  cat > "$REACT_ENV_FILE" <<EOF
NEXT_PUBLIC_EX_CP_PUBLIC_KEY=$(escape_env_value "$NEXT_PUBLIC_EX_CP_PUBLIC_KEY")
EOF
  echo "Wrote $REACT_ENV_FILE"
fi

echo
echo "Environment files created."