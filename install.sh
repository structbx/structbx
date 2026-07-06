#!/bin/bash
#
# StructBX — Installer
# Usage: curl -fsSL https://github.com/structbx/structbx/releases/latest/download/install.sh | sh
#
set -e

# ── Colors ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { printf "${BLUE}%s${NC}\n" "$*"; }
ok()    { printf "${GREEN}%s${NC}\n" "$*"; }
err()   { printf "${RED}%s${NC}\n" "$*" >&2; exit 1; }

# ─── Defaults ──────────────────────────────────────────────────────
REPO="structbx/structbx"
BIN_DIR="/usr/local/bin"
WEB_DIR="/usr/share/structbx-web"
CONF_DIR="/etc/structbx"
LOG_DIR="/var/log/structbx"
UPLOAD_DIR="/var/www/structbx-web-uploaded"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# ─── Detect platform ────────────────────────────────────────────────
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
    x86_64)  BIN_ARCH="amd64"  ;;
    aarch64|arm64) BIN_ARCH="arm64"  ;;
    *) err "Unsupported architecture: $ARCH" ;;
esac

case "$OS" in
    linux)   BIN_OS="linux"   ;;
    *) err "Unsupported OS: $OS (only Linux is supported)" ;;
esac

BINARY="structbx-server-${BIN_OS}-${BIN_ARCH}"
WEB_TAR="structbx-web.tar.gz"

# ─── GitHub release URL resolution ──────────────────────────────────
if [ -n "${STRUCTBX_VERSION}" ]; then
    RELEASE_TAG="${STRUCTBX_VERSION}"
else
    info "Determining latest release..."
    RELEASE_TAG=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
        | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": "\(.*\)",.*/\1/')
    [ -z "$RELEASE_TAG" ] && err "Could not determine latest release"
fi

BASE_URL="https://github.com/${REPO}/releases/download/${RELEASE_TAG}"
info "Release: ${RELEASE_TAG}"

# ─── Download assets ────────────────────────────────────────────────
download() {
    local url="$1" out="$2"
    info "Downloading ${url##*/}..."
    curl -fsSL "$url" -o "$out"
    [ -s "$out" ] || err "Download failed: $url"
}

download "${BASE_URL}/${BINARY}" "${TMP_DIR}/structbx-server"
download "${BASE_URL}/${WEB_TAR}" "${TMP_DIR}/${WEB_TAR}"

# ─── Install binary ─────────────────────────────────────────────────
info "Installing binary to ${BIN_DIR}/structbx-server"
sudo install -d "$BIN_DIR"
sudo install -m 0755 "${TMP_DIR}/structbx-server" "${BIN_DIR}/structbx-server"

# ─── Install web files ──────────────────────────────────────────────
info "Installing web files to ${WEB_DIR}"
sudo install -d "$WEB_DIR"
sudo tar xzf "${TMP_DIR}/${WEB_TAR}" -C "$WEB_DIR"

# ─── Create config directories and default files ────────────────────
info "Creating configuration directories"
sudo install -d "$CONF_DIR" "$LOG_DIR" "$UPLOAD_DIR"

if [ ! -f "${CONF_DIR}/properties.yaml" ]; then
    info "Generating default config at ${CONF_DIR}/properties.yaml"
    cat > "${CONF_DIR}/properties.yaml" <<-YAML
port: 3001
max_queued: 4096
max_threads: 4096
max_file_size: 5
db_host: "127.0.0.1"
db_port: "3306"
db_name: "db"
db_user: "root"
db_password: "pass"
session_max_age: 2592000
directory_base: "${WEB_DIR}"
directory_for_temp_file: "/tmp"
certificate: "${CONF_DIR}/cert.pem"
key: "${CONF_DIR}/key.pem"
rootcert: ""
logger_output_file: "${LOG_DIR}/structbx.log"
debug: false
directory_for_uploaded_files: "${UPLOAD_DIR}"
database_id_cookie_name: "1f3efd18688d2b844f4fa1e800712c9b5750c0312"
YAML
fi

if [ ! -f "${CONF_DIR}/cert.pem" ]; then
    if command -v openssl >/dev/null 2>&1; then
        info "Generating self-signed certificate at ${CONF_DIR}/cert.pem"
        sudo openssl req -x509 -newkey rsa:4096 \
            -keyout "${CONF_DIR}/key.pem" \
            -out "${CONF_DIR}/cert.pem" \
            -days 3650 -nodes \
            -subj "/CN=structbx.local"
    else
        info "openssl not found — certificate files must be created manually:"
        info "  sudo openssl req -x509 -newkey rsa:4096 -keyout ${CONF_DIR}/key.pem -out ${CONF_DIR}/cert.pem -days 3650 -nodes -subj '/CN=structbx.local'"
    fi
fi

# ─── Done ───────────────────────────────────────────────────────────
ok "StructBX ${RELEASE_TAG} installed successfully!"
echo ""
echo "  Binary:        ${BIN_DIR}/structbx-server"
echo "  Web files:     ${WEB_DIR}"
echo "  Config:        ${CONF_DIR}/properties.yaml"
echo ""
echo "  Start:         sudo structbx-server --config ${CONF_DIR}/properties.yaml"
echo "  Edit config:   ${CONF_DIR}/properties.yaml"
echo ""
echo "  Make sure MySQL/MariaDB is running and accessible, then configure"
echo "  the database settings in ${CONF_DIR}/properties.yaml."
