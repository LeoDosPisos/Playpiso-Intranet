#!/usr/bin/env bash
# Deletes ALL data from application tables after password confirmation.
# Safe-guards: does NOT drop tables, does NOT touch schemaversions.
set -euo pipefail

RESET_PASSWORD="playpiso-reset"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS="$SCRIPT_DIR/PropostaComercialApi/appsettings.Development.json"
[[ -f "$SETTINGS" ]] || SETTINGS="$SCRIPT_DIR/PropostaComercialApi/appsettings.json"

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
echo "  WARNING: This will DELETE ALL data from"
echo "  database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "==========================================="
echo ""
read -rsp "Enter reset password to continue: " INPUT_PASS
echo ""

if [[ "$INPUT_PASS" != "$RESET_PASSWORD" ]]; then
    echo "Incorrect password. Aborting."
    exit 1
fi

echo ""
echo "==> Deleting data..."

$PSQL -c "
BEGIN;
DELETE FROM proposal_product_groups;
DELETE FROM proposals;
COMMIT;
"

echo "==> Done. All rows removed from proposal_product_groups and proposals."
echo "    Tables and migrations were NOT affected."
