#!/bin/bash
# bulk.sh
#python -c 'import base64; print base64.urlsafe_b64encode("<username>:<password>")' 
alias acurl="curl -s --proto '=https' -g -H 'Authorization: Basic M2MyZDg1ODUtNzY0Mi00OTk1LTk4ZDAtY2NhM2FlNTczMGMxLWJsdWVtaXg6ZTBiNTBiNDZiZjA1ZWFmZWY2YWRhMzc1NGYxYjgwYjRhYmE5ZjE3ODdhOTNiZTExNDk0NmI5ZTI2NzkxMjVjYg=='"
acurl -H "Content-Type:application/json" -d @gb_genres.json -vX POST https://9007f642-5501-4ce2-9d1f-09f1b91ce575-bluemix.cloudant.com/gb_genres/_bulk_docs
