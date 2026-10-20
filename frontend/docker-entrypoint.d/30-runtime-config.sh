#!/bin/sh
set -eu

: "${API_BASE_URL:=http://localhost:8087}"
: "${STRIPE_TEST_MODE:=false}"
[ "$STRIPE_TEST_MODE" = "true" ] || STRIPE_TEST_MODE=false
# Cloudflare's always-pass test site key
: "${TURNSTILE_SITE_KEY:=1x00000000000000000000AA}"
: "${EMAIL_ENABLED:=false}"
[ "$EMAIL_ENABLED" = "true" ] || EMAIL_ENABLED=false

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}",
  STRIPE_TEST_MODE: "${STRIPE_TEST_MODE}",
  TURNSTILE_SITE_KEY: "${TURNSTILE_SITE_KEY}",
  EMAIL_ENABLED: "${EMAIL_ENABLED}"
};
EOF
