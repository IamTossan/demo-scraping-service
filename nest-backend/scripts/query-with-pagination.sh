#!/bin/sh

curl -XGET -H "Content-Type: application/json" -s 'localhost:3000/document?skip=3&limit=3' | jq
