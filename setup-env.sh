#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
SERVER_ENV_FILE="$ROOT_DIR/packages/demo-server/.env.local"
REACT_ENV_FILE="$ROOT_DIR/packages/demo-react/.env.local"

read_env_value() {
  local file="$1"
  local key="$2"
  local line value

  [[ -f "$file" ]] || return 0

  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  [[ -n "$line" ]] || return 0

  value="${line#*=}"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
    value="${value//\\\"/\"}"
    value="${value//\\\\/\\}"
  fi

  printf '%s' "$value"
}

escape_env_value() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

mask_value() {
  local value="$1"
  local length="${#value}"

  if (( length == 0 )); then
    printf '<not set>'
  elif (( length <= 4 )); then
    printf '****'
  else
    printf '%s****%s' "${value:0:2}" "${value: -2}"
  fi
}

prompt_required() {
  local var_name="$1"
  local prompt_text="$2"
  local secret="${3:-false}"
  local current="${4:-}"
  local value=""
  local current_text=""

  if [[ -n "$current" ]]; then
    if [[ "$secret" == "true" ]]; then
      current_text="$(mask_value "$current")"
    else
      current_text="$current"
    fi
  fi

  while true; do
    local prompt="$prompt_text"
    if [[ -n "$current" ]]; then
      prompt="$prompt [current: $current_text, press Enter to keep]"
    fi

    if [[ "$secret" == "true" ]]; then
      read -r -s -p "$prompt: " value
      printf '\n' >&2
    else
      read -r -p "$prompt: " value
    fi

    if [[ -n "$value" ]]; then
      printf '%s' "$value"
      return 0
    fi

    if [[ -n "$current" ]]; then
      printf '%s' "$current"
      return 0
    fi

    echo "$var_name cannot be empty." >&2
  done
}

prompt_update_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local response
    read -r -p "$file already exists. Update values? [Y/n]: " response
    case "$response" in
      n|N|no|NO) echo "Skipped $file"; return 1 ;;
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

mkdir -p "$(dirname "$SERVER_ENV_FILE")" "$(dirname "$REACT_ENV_FILE")"

if prompt_update_file "$SERVER_ENV_FILE"; then
  CURRENT_EX_CP_CLIENT_ID="$(read_env_value "$SERVER_ENV_FILE" "EX_CP_CLIENT_ID")"
  CURRENT_EX_CP_LICENSE_KEY="$(read_env_value "$SERVER_ENV_FILE" "EX_CP_LICENSE_KEY")"
  CURRENT_EX_CP_MID="$(read_env_value "$SERVER_ENV_FILE" "EX_CP_MID")"

  EX_CP_CLIENT_ID="$(prompt_required "EX_CP_CLIENT_ID" "Client ID" false "$CURRENT_EX_CP_CLIENT_ID")"
  EX_CP_LICENSE_KEY="$(prompt_required "EX_CP_LICENSE_KEY" "Licence key" true "$CURRENT_EX_CP_LICENSE_KEY")"
  EX_CP_MID="$(prompt_required "EX_CP_MID" "Merchant ID" false "$CURRENT_EX_CP_MID")"

  cat > "$SERVER_ENV_FILE" <<EOF
EX_CP_CLIENT_ID=$(escape_env_value "$EX_CP_CLIENT_ID")
EX_CP_LICENSE_KEY=$(escape_env_value "$EX_CP_LICENSE_KEY")
EX_CP_MID=$(escape_env_value "$EX_CP_MID")
EOF
  echo "Wrote $SERVER_ENV_FILE"
fi

if prompt_update_file "$REACT_ENV_FILE"; then
  CURRENT_NEXT_PUBLIC_EX_CP_PUBLIC_KEY="$(read_env_value "$REACT_ENV_FILE" "NEXT_PUBLIC_EX_CP_PUBLIC_KEY")"

  NEXT_PUBLIC_EX_CP_PUBLIC_KEY="$(prompt_required "NEXT_PUBLIC_EX_CP_PUBLIC_KEY" "Public key" false "$CURRENT_NEXT_PUBLIC_EX_CP_PUBLIC_KEY")"

  cat > "$REACT_ENV_FILE" <<EOF
NEXT_PUBLIC_EX_CP_PUBLIC_KEY=$(escape_env_value "$NEXT_PUBLIC_EX_CP_PUBLIC_KEY")
EOF
  echo "Wrote $REACT_ENV_FILE"
fi

echo
echo "Environment files created."
