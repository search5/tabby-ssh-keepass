#!/usr/bin/env bash
set -e

PLUGIN_DIR="$HOME/Library/Application Support/tabby/plugins/node_modules/tabby-keepass-ssh"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -L "$PLUGIN_DIR" ]; then
  echo "Symlink already exists: $PLUGIN_DIR"
elif [ -d "$PLUGIN_DIR" ]; then
  echo "Replacing directory with symlink..."
  rm -rf "$PLUGIN_DIR"
  ln -s "$SRC_DIR" "$PLUGIN_DIR"
  echo "Symlink created: $PLUGIN_DIR -> $SRC_DIR"
else
  ln -s "$SRC_DIR" "$PLUGIN_DIR"
  echo "Symlink created: $PLUGIN_DIR -> $SRC_DIR"
fi

echo "Restart Tabby to load changes."
