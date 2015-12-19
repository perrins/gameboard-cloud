#!/bin/bash
# bulk.sh
UIDPW=
AUTH="$(python -c 'import base64; print base64.urlsafe_b64encode("3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix:e0b50b46bf05eafef6ada3754f1b80b4aba9f1787a93be114946b9e2679125cb")')"
ACURL="curl -s --proto '=https' -iv -g -H 'Authorization: Basic ${AUTH}'"
HOST="https://3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix.cloudant.com"

# gb_videos
eval ${ACURL} -X DELETE '${HOST}/gb_videos'
eval ${ACURL} -X PUT '${HOST}/gb_videos'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_videos/_security'

# gb_members
eval ${ACURL} -X DELETE '${HOST}/gb_members'
eval ${ACURL} -X PUT '${HOST}/gb_members'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_members/_security'

# gb_favourites
eval ${ACURL} -X DELETE '${HOST}/gb_favourites'
eval ${ACURL} -X PUT '${HOST}/gb_favourites'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_favourites/_security'

# gb_notifications
eval ${ACURL} -X DELETE '${HOST}/gb_notifications'
eval ${ACURL} -X PUT '${HOST}/gb_notifications'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_notifications/_security'

# gb_bookmarks
eval ${ACURL} -X DELETE '${HOST}/gb_bookmarks'
eval ${ACURL} -X PUT '${HOST}/gb_bookmarks'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_bookmarks/_security'

# gb_genres
eval ${ACURL} -X DELETE '${HOST}/gb_genres'
eval ${ACURL} -X PUT '${HOST}/gb_genres'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_genres.json -vX POST '${HOST}/gb_genres/_bulk_docs'
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