#!/bin/sh
set -eu

DOMAIN="${DOMAIN:-}"
TEMPLATE_DIR=/etc/nginx/templates
CONF=/etc/nginx/conf.d/default.conf

if [ -n "$DOMAIN" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  echo "[nginx-entrypoint] Certificate found for $DOMAIN — serving HTTPS config."
  sed "s/__DOMAIN__/$DOMAIN/g" "$TEMPLATE_DIR/https.conf.template" > "$CONF"
else
  echo "[nginx-entrypoint] No certificate yet — serving HTTP-only config."
  cp "$TEMPLATE_DIR/http.conf.template" "$CONF"
fi

exec nginx -g 'daemon off;'
