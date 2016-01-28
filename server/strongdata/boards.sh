#!/bin/bash
#!/bin/bash
# bulk.sh
UIDPW=
AUTH="$(python -c 'import base64; print base64.urlsafe_b64encode("de29b333-01b3-422e-ba41-187222b73313-bluemix:5bcd345391613eee9a199760dbe22cedc9cfbd9d37b90a914894a4e71a4ed37f")')"
ACURL="curl -s --proto '=https' -iv -g -H 'Authorization: Basic ${AUTH}'"
HOST="https://de29b333-01b3-422e-ba41-187222b73313-bluemix.cloudant.com"

# gb_boards
eval ${ACURL} -X DELETE '${HOST}/gb_boards'
eval ${ACURL} -X PUT '${HOST}/gb_boards'
eval ${ACURL} -H "Content-Type:application/json" -d @security.json -vX PUT '${HOST}/gb_boards/_security'
eval ${ACURL} -H "Content-Type:application/json" -d @gb_boards_design.json -vX PUT '${HOST}/gb_boards/_design/design-doc'
