#!/bin/bash
# bulk.sh
UIDPW=
AUTH="$(python -c 'import base64; print base64.urlsafe_b64encode("3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix:e0b50b46bf05eafef6ada3754f1b80b4aba9f1787a93be114946b9e2679125cb")')"
ACURL="curl -s --proto '=https' -iv -g -H 'Authorization: Basic ${AUTH}'"
HOST="https://3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix.cloudant.com"

# gb_boards
eval ${ACURL} -H "Content-Type:application/json" -d @gb_boards.json -vX POST '${HOST}/gb_boards/_bulk_docs'

