#!/usr/bin/env bash
# Drops application tables and DbUp migration history after password confirmation.
# Development-only helper: the API will recreate the schema on next startup.
set -euo pipefail

RESET_PASSWORD="playpiso-reset-schema"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SETTINGS="$PROJECT_DIR/PlaypisoIntranet/appsettings.Development.json"
[[ -f "$SETTINGS" ]] || SETTINGS="$PROJECT_DIR/PlaypisoIntranet/appsettings.json"

CONN=$(python3 -c "
import json
data = json.load(open('$SETTINGS'))
print(data['ConnectionStrings']['Default'])
")

parse_conn() {
  python3 -c "
import re
conn = '$CONN'
def get(key, default=''):
    m = re.search(rf'(?i)(?:^|;){key}=([^;]+)', conn)
    return m.group(1).strip() if m else default
print(get('Host','localhost'), get('Port','5432'), get('Database'), get('Username','postgres'), get('Password',''))
"
}

read -r DB_HOST DB_PORT DB_NAME DB_USER DB_PASS <<< "$(parse_conn)"
export PGPASSWORD="$DB_PASS"

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"

echo "==========================================="
echo "  WARNING: This will DROP application tables"
echo "  and DbUp migration history from:"
echo "  database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "==========================================="
echo ""
read -rsp "Enter schema reset password to continue: " INPUT_PASS
echo ""

if [[ "$INPUT_PASS" != "$RESET_PASSWORD" ]]; then
    echo "Incorrect password. Aborting."
    exit 1
fi

echo ""
echo "==> Dropping schema objects..."

$PSQL -c "
BEGIN;
DROP TABLE IF EXISTS proposal_product_groups;
DROP TABLE IF EXISTS proposals;
DROP TABLE IF EXISTS schemaversions;
COMMIT;
"

echo "==> Done. Schema objects removed."
echo "    Start the API to recreate the database schema via DbUp."
