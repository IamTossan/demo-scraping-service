#!/bin/sh

curl -XPOST -H "Content-Type: application/json" -d '{"targetDomain": "https://news.ycombinator.com/"}' localhost:3000/scraping-task
