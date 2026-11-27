#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--approved" || $# -ne 1 ]]; then
  echo 'Usage after deployment approval: STAGING_PROJECT=... STUDIO_SECRET_BINDINGS=... backend/staging/deploy.sh --approved' >&2
  exit 2
fi

: "${STAGING_PROJECT:?Set the dedicated staging GCP project ID}"
: "${STUDIO_SECRET_BINDINGS:?Set staging Secret Manager mappings with numeric versions}"
if [[ ! "$STAGING_PROJECT" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]]; then
  echo 'Expected a GCP project ID.' >&2
  exit 2
fi
IFS=, read -r -a bindings <<< "$STUDIO_SECRET_BINDINGS"
declare -A seen=()
for binding in "${bindings[@]}"; do
  if [[ ! "$binding" =~ ^(STUDIO_ACCESS_TOKEN|OPENAI_API_KEY|GMAIL_CLIENT_ID|GMAIL_CLIENT_SECRET|GMAIL_REFRESH_TOKEN|STUDIO_MAIL_FROM|STUDIO_MAIL_TO)=(omar-staging-[a-z0-9-]+):[1-9][0-9]*$ ]]; then
    echo 'Bindings must use supported variables and pinned omar-staging-* secrets in the staging project.' >&2
    exit 2
  fi
  name=${BASH_REMATCH[1]}
  if [[ -v "seen[$name]" ]]; then
    echo 'Duplicate secret binding.' >&2
    exit 2
  fi
  seen[$name]=1
done
if [[ ! -v 'seen[STUDIO_ACCESS_TOKEN]' ]]; then
  echo 'STUDIO_ACCESS_TOKEN is required.' >&2
  exit 2
fi

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
gcloud run deploy omar-studio-staging \
  --project "$STAGING_PROJECT" --region europe-west1 --source "$source_dir" \
  --service-account "omar-studio-runtime@$STAGING_PROJECT.iam.gserviceaccount.com" \
  --build-service-account "projects/$STAGING_PROJECT/serviceAccounts/omar-studio-build@$STAGING_PROJECT.iam.gserviceaccount.com" \
  --no-allow-unauthenticated --invoker-iam-check \
  --min-instances 0 --max-instances 1 --concurrency 4 --memory 512Mi --timeout 180 \
  --set-secrets "$STUDIO_SECRET_BINDINGS"
