#!/usr/bin/env python3
#
# Warning: If called with the -f flag, then this script will delete all tags without warning in the standard store.
#
# Example call: delete-all-tags.py  -v 1 -u admin -p admin -l "http://localhost:8080" -f 1
#
# Delete tags with curl in standard store:
# curl -X DELETE -k -u "admin:admin" "http://localhost:8080/alfresco/service/api/tags/workspace/SpacesStore/[tag name]"
#

import sys
import getopt
import json
import urllib
import urllib.request

opts, args = getopt.getopt(sys.argv[1:], "l:u:p:f:v:")

# Default settings for Alfresco installation 
alfresco_url = "http://localhost:8080"
alfresco_login = "admin"
alfresco_password = "admin"
is_forced = False
is_verbose = False

for opt, arg in opts:
    if opt == "-l":
        alfresco_url = arg
    if opt == "-u":
        alfresco_login = arg
    if opt == "-p":
        alfresco_password = arg
    if opt == "-f":
        is_forced = True
    if opt == "-v":
        is_verbose = True

print("Deleting all tags in Alfresco", alfresco_url)

headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=UTF-8'
}

api_url = alfresco_url + "/alfresco/service/api"
tags_url = api_url + "/tags/workspace/SpacesStore"
if is_verbose:
    print("Get all tags from", tags_url)
    
password_mgr = urllib.request.HTTPPasswordMgrWithDefaultRealm()
password_mgr.add_password(None, api_url, alfresco_login, alfresco_password)
auth_handler = urllib.request.HTTPBasicAuthHandler(password_mgr)

opener = urllib.request.build_opener(auth_handler)
urllib.request.install_opener(opener)

request = urllib.request.Request(tags_url)
request.headers = headers

response = urllib.request.urlopen(request)

tags = json.loads(response.readall().decode('utf-8'))
for tag in tags:
    if is_forced:
        tag_uri = api_url + "/tags/workspace/SpacesStore/" + urllib.parse.quote(tag)
        if is_verbose:
            print("Delete tag:", tag, "by URI", tag_uri)
        delete_request = urllib.request.Request(tag_uri)
        delete_request.method = "DELETE"
        urllib.request.urlopen(delete_request)
    else:
        print("Tag not deleted because force flag is not set:", tag)

