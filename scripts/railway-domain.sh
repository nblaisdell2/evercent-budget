#!/usr/bin/env bash
# Generate the Railway domain, or attach a custom domain (Bash).
#   ./scripts/railway-domain.sh                     -> generated *.up.railway.app domain
#   ./scripts/railway-domain.sh app.example.com     -> custom domain
#   ./scripts/railway-domain.sh dev.example.com --environment dev
#                                                   -> custom domain for the dev environment
#
# Without --environment it acts on the linked environment (production) and
# records CUSTOM_DOMAIN; with --environment dev it acts on dev and records
# DEV_DOMAIN instead.
#
# Custom domain: attaches it with `railway domain <domain>` (Railway's IaC can't
# register custom domains), records it as CUSTOM_DOMAIN in .railway/railway.ts,
# and prints the DNS records to add at your DNS provider: a CNAME (where
# traffic goes) AND a TXT (proves you own the domain; without it Railway
# answers 404). Railway issues the Let's Encrypt certificate automatically once
# DNS has propagated.

set -euo pipefail

DOMAIN=""
ENVIRONMENT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --environment) ENVIRONMENT="${2:-}"; shift 2 ;;
    --environment=*) ENVIRONMENT="${1#*=}"; shift ;;
    -*) echo "Unknown arg: $1" >&2; exit 1 ;;
    *) [ -z "$DOMAIN" ] || { echo "Only one domain at a time." >&2; exit 1; }; DOMAIN="$1"; shift ;;
  esac
done

. "$(cd "$(dirname "$0")" && pwd)/lib/common.sh"
cd "$ROOT"

# Extra arguments for every `railway domain ...` call (see lib/common.sh).
RAILWAY_ENV_ARGS=()
CONST_NAME="CUSTOM_DOMAIN"
case "$ENVIRONMENT" in
  "") ;;
  dev) RAILWAY_ENV_ARGS=(--environment dev); CONST_NAME="DEV_DOMAIN"; echo "Environment: dev" ;;
  *) die "Unknown environment '$ENVIRONMENT' (only 'dev' is supported)." ;;
esac

if [ -z "$DOMAIN" ]; then
  TOTAL=2
  step 1 $TOTAL "Checking Railway CLI + linked project"
  assert_railway_cli; assert_railway_login; assert_railway_linked

  step 2 $TOTAL "Railway-provided domain for '$WEB_SERVICE'"
  EXISTING="$(get_railway_domain)"
  if [ -n "$EXISTING" ]; then
    echo "Already has one: https://$EXISTING"
    exit 0
  fi
  railway domain --service "$WEB_SERVICE" ${RAILWAY_ENV_ARGS[@]+"${RAILWAY_ENV_ARGS[@]}"} || die "railway domain failed"
  D="$(get_railway_domain)"
  [ -z "$D" ] || { echo ""; echo "Live at:  https://$D"; }
  exit 0
fi

DOMAIN="$(printf '%s' "$DOMAIN" | tr '[:upper:]' '[:lower:]' | sed -E 's#^https?://##; s#/.*$##')"
printf '%s' "$DOMAIN" | grep -Eq '^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$' \
  || die "'$DOMAIN' doesn't look like a hostname (e.g. app.example.com)."
TOTAL=3

step 1 $TOTAL "Checking Railway CLI + linked project"
assert_railway_cli; assert_railway_login; assert_railway_linked

step 2 $TOTAL "Attaching $DOMAIN to '$WEB_SERVICE'"
add_custom_domain "$DOMAIN"

step 3 $TOTAL "Recording $CONST_NAME in .railway/railway.ts"
PREVIOUS="$(get_railway_const "$CONST_NAME")"
if [ "$PREVIOUS" = "$DOMAIN" ]; then
  echo "Already recorded."
else
  set_railway_const "$CONST_NAME" "$DOMAIN"
  echo "$CONST_NAME = \"$DOMAIN\". Commit .railway/railway.ts so it stays recorded."
  if [ -n "$PREVIOUS" ]; then
    echo "The previous domain '$PREVIOUS' is still attached. To remove it:"
    echo "  railway domain delete $PREVIOUS --service $WEB_SERVICE ${RAILWAY_ENV_ARGS[*]-} --yes"
  fi
fi
