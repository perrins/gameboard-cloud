#!/bin/bash
# bulk.sh
UIDPW=
AUTH="$(python -c 'import base64; print base64.urlsafe_b64encode("4e7d5e08-b9ca-487e-ab20-44b4481c5b8c-bluemix:3baba86f581b4a9ab11aa22854dbf387a58f08f89df0dd163c3ce52b7171fcc1")')"
ACURL="curl -s --proto '=https' -iv -g -H 'Authorization: Basic ${AUTH}'"
HOST="https://4e7d5e08-b9ca-487e-ab20-44b4481c5b8c-bluemix.cloudant.com"

# gb_categories - categories
eval ${ACURL} -X DELETE '${HOST}/gb_categories'
eval ${ACURL} -X PUT '${HOST}/gb_categories'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_categories.json -vX POST '${HOST}/gb_categories/_bulk_docs'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_categories/_security'

# gb_categories - genres
eval ${ACURL} -H "Content-Type:application/json" -d @gb_genres.json -vX POST '${HOST}/gb_categories/_bulk_docs'

# gb_categories - games
eval ${ACURL} -H "Content-Type:application/json" -d @gb_games.json -vX POST '${HOST}/gb_categories/_bulk_docs'

# gb_boards
eval ${ACURL} -X DELETE '${HOST}/gb_boards'
eval ${ACURL} -X PUT '${HOST}/gb_boards'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_boards/_security'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_boards_design.json -vX PUT '${HOST}/gb_boards/_design/board'

# gb_videos
eval ${ACURL} -X DELETE '${HOST}/gb_videos'
eval ${ACURL} -X PUT '${HOST}/gb_videos'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_videos/_security'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_videos_design.json -vX PUT '${HOST}/gb_videos/_design/videos'

# gb_members
eval ${ACURL} -X DELETE '${HOST}/gb_members'
eval ${ACURL} -X PUT '${HOST}/gb_members'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_members/_security'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_members_design.json -vX PUT '${HOST}/gb_members/_design/members'

# gb_metadata - countries
eval ${ACURL} -X DELETE '${HOST}/gb_metadata'
eval ${ACURL} -X PUT '${HOST}/gb_metadata'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_metadata/_security'
#eval ${ACURL} -H "Content-Type:application/json" -d @gb_countries.json -vX POST '${HOST}/gb_metadata/_bulk_docs'

# gb_metadata - platforms
#eval ${ACURL} -H "Content-Type:application/json" -d @gb_platforms.json -vX POST '${HOST}/gb_metadata/_bulk_docs'
