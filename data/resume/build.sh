#!/usr/bin/env bash
# Build data/resume/resume.html -> resume.pdf with headless Chrome, then copy
# the PDF to every place the repo reads it (site download + RAG corpus).
#
#   ./data/resume/build.sh
#
# Chrome 150+ sometimes keeps running after --print-to-pdf finishes, so the
# script waits for the file and then kills its own Chrome instance.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="$HERE/resume.pdf"
PROFILE="$(mktemp -d)"
rm -f "$OUT"
"$CHROME" --headless=new --disable-gpu --no-sandbox --user-data-dir="$PROFILE" \
  --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf="$OUT" "file://$HERE/resume.html" >/dev/null 2>&1 &
PID=$!
for _ in $(seq 1 60); do
  if [ -s "$OUT" ]; then sleep 1; break; fi
  sleep 1
done
kill "$PID" 2>/dev/null || true
wait "$PID" 2>/dev/null || true
rm -rf "$PROFILE"
[ -s "$OUT" ] || { echo "resume.pdf was not produced" >&2; exit 1; }
for dest in "$ROOT/data/resume.pdf" "$ROOT/frontend/public/resume.pdf" "$ROOT/backend/data/resume.pdf"; do
  cp "$OUT" "$dest"
done
echo "built $OUT ($(du -h "$OUT" | cut -f1), $(pdfinfo "$OUT" 2>/dev/null | awk '/^Pages/{print $2}') pages) and copied to 3 locations"
