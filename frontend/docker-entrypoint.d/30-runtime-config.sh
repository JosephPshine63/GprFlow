#!/bin/sh
set -eu

: "${API_BASE_URL:=http://localhost:5454}"

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF
