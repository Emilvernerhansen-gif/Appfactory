#!/bin/sh
# Reproducible, idempotent tool setup for Claude Code (cloud/local) and OpenCode.
# Installs the pinned RTK binary into ~/.local/bin after SHA-256 verification.
# Prints one line on success; prints the reason and exits non-zero on failure.
set -eu
RTK_VERSION=0.49.0
BIN_DIR="${RTK_INSTALL_DIR:-$HOME/.local/bin}"
export RTK_TELEMETRY_DISABLED=1

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)  ASSET=rtk-x86_64-unknown-linux-musl.tar.gz; SUM=7278231dfd7e6a730a4ab7f847b195bcf02289c2d57622b0dab75a6411100c8f ;;
  Linux-aarch64|Linux-arm64) ASSET=rtk-aarch64-unknown-linux-gnu.tar.gz; SUM=c8ea4b6560841e73157c134fd4a3293914c6ede42e786ee985cf491fde691ba7 ;;
  Darwin-arm64)  ASSET=rtk-aarch64-apple-darwin.tar.gz; SUM=bbbfebabb22686993a80da731aa4d5d35116fb8ae24abb00608efa028e13ae01 ;;
  Darwin-x86_64) ASSET=rtk-x86_64-apple-darwin.tar.gz; SUM=d297388f4a8a786e79abe5f55b80451725bfe8c5835b4736c05d7cff4d68f627 ;;
  *) echo "setup: RTK skipped, unsupported platform $(uname -sm); commands run unfiltered"; exit 0 ;;
esac

if [ "$("$BIN_DIR/rtk" --version 2>/dev/null)" = "rtk $RTK_VERSION" ]; then
  echo "setup: rtk $RTK_VERSION ready ($BIN_DIR)"; exit 0
fi

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
URL="https://github.com/rtk-ai/rtk/releases/download/v$RTK_VERSION/$ASSET"
curl -fsSL --retry 3 -o "$TMP/rtk.tgz" "$URL" || { echo "setup: download failed: $URL" >&2; exit 1; }
if command -v sha256sum >/dev/null; then ACT=$(sha256sum "$TMP/rtk.tgz" | cut -d' ' -f1); else ACT=$(shasum -a 256 "$TMP/rtk.tgz" | cut -d' ' -f1); fi
[ "$ACT" = "$SUM" ] || { echo "setup: checksum mismatch for $ASSET (got $ACT)" >&2; exit 1; }
tar -xzf "$TMP/rtk.tgz" -C "$TMP" rtk
mkdir -p "$BIN_DIR"; install -m 755 "$TMP/rtk" "$BIN_DIR/rtk"
"$BIN_DIR/rtk" --version >/dev/null
case ":$PATH:" in *":$BIN_DIR:"*) ;; *) echo "setup: add $BIN_DIR to PATH" ;; esac
echo "setup: installed rtk $RTK_VERSION ($BIN_DIR)"
