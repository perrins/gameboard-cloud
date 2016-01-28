#!/bin/bash
# bulk.sh
UIDPW=
AUTH="$(python -c 'import base64; print base64.urlsafe_b64encode("de29b333-01b3-422e-ba41-187222b73313-bluemix:5bcd345391613eee9a199760dbe22cedc9cfbd9d37b90a914894a4e71a4ed37f")')"
ACURL="curl -s --proto '=https' -iv -g -H 'Authorization: Basic ${AUTH}'"
HOST="https://de29b333-01b3-422e-ba41-187222b73313-bluemix.cloudant.com"

# gb_genres
eval ${ACURL} -X DELETE '${HOST}/gb_genres'
eval ${ACURL} -X PUT '${HOST}/gb_genres'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_genres_master.json -vX POST '${HOST}/gb_genres/_bulk_docs'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_genres/_security'

# gb_games
eval ${ACURL} -X DELETE '${HOST}/gb_games'
eval ${ACURL} -X PUT '${HOST}/gb_games'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_games.json -vX POST '${HOST}/gb_games/_bulk_docs'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_games/_security'

# gb_categories
eval ${ACURL} -X DELETE '${HOST}/gb_categories'
eval ${ACURL} -X PUT '${HOST}/gb_categories'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_categories.json -vX POST '${HOST}/gb_categories/_bulk_docs'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_categories/_security'
