#!/usr/bin/env bash
# Runs DbUp-compatible migrations via psql without starting the application.
# Reads connection string from appsettings.Development.json (dev) or appsettings.json.
# Tracks applied scripts in the 'schemaversions' table so the app won't re-apply them.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/PropostaComercialApi/Migrations"

# ── Parse connection string ──────────────────────────────────────────────────
SETTINGS="$SCRIPT_DIR/PropostaComercialApi/appsettings.Development.json"
[[ -f "$SETTINGS" ]] || SETTINGS="$SCRIPT_DIR/PropostaComercialApi/appsettings.json"

CONN=$(python3 -c "
import json, sys
data = json.load(open('$SETTINGS'))
print(data['ConnectionStrings']['Default'])
")

parse_conn() {
  python3 -c "
import re, sys
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

echo "==> Target: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

# DbUp prefixes scriptname with the assembly namespace, e.g.:
#   PropostaComercialApi.Migrations.V001__create_proposals.sql
DBUP_NAMESPACE="PropostaComercialApi.Migrations"

# ── Ensure schemaversions table exists (DbUp convention) ────────────────────
$PSQL -c "
CREATE TABLE IF NOT EXISTS schemaversions (
    schemaversionsid SERIAL PRIMARY KEY,
    scriptname       VARCHAR(255) NOT NULL,
    applied          TIMESTAMP    NOT NULL
);
" > /dev/null

# ── Apply pending migration files ────────────────────────────────────────────
shopt -s nullglob
APPLIED=0
for SQL_FILE in "$MIGRATIONS_DIR"/*.sql; do
    BASE_NAME=$(basename "$SQL_FILE")
    FULL_NAME="$DBUP_NAMESPACE.$BASE_NAME"

    ALREADY_APPLIED=$($PSQL -tAc "SELECT COUNT(*) FROM schemaversions WHERE scriptname = '$FULL_NAME';")
    if [[ "$ALREADY_APPLIED" -gt 0 ]]; then
        echo "    SKIP  $BASE_NAME (already applied)"
        continue
    fi

    echo "  APPLY  $BASE_NAME"
    $PSQL -f "$SQL_FILE"
    $PSQL -c "INSERT INTO schemaversions (scriptname, applied) VALUES ('$FULL_NAME', NOW());" > /dev/null
    APPLIED=$((APPLIED + 1))
done

if [[ $APPLIED -eq 0 ]]; then
    echo "==> Database is up to date. No migrations applied."
else
    echo "==> Done. $APPLIED migration(s) applied."
fi
