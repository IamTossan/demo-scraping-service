#!/bin/sh

curl -XGET -H "Content-Type: application/json" -s 'localhost:3000/document?domain[]=lol&domain[]=the' | jq
