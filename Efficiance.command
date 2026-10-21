#!/bin/bash
# Double-click on macOS to start your PERSONAL Efficiance and open it in your browser.
# First run installs dependencies and builds the app (about a minute).
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Efficiance needs Node.js. Install the LTS version from nodejs.org, then double-click this file again." buttons {"OK"}'
  exit 1
fi
[ -d node_modules ] || npm install
[ -d dist ] || npm run build
PORT_NUM="${SERVER_PORT:-3001}"
(sleep 2; open "http://localhost:${PORT_NUM}") &
echo "Efficiance running at http://localhost:${PORT_NUM}  (close this window to stop)"
npm start
