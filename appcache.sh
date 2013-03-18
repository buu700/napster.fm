#!/bin/bash


comment="# `date +%s`\n"

echo -e	'CACHE MANIFEST\n'

echo -e 'NETWORK:\n*\n'

echo 'CACHE:'
cat index.html | grep ".*='//.*'" | grep -v '<a' | grep -v firebase | grep -v youtube | perl -pe "s/.*'(\/\/.*)'.*/http:\1 ${comment}/g"
find . -type f -name '*.css' -o -name '*.html' -o -name '*.png' | grep -v closure | grep -v .git | while read path ; do echo -e "${path:2} ${comment}" ; done
echo -e "js/napster.js ${comment}"
