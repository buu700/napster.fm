#!/bin/bash


comment="# `date +%s`\n"

echo -e	'CACHE MANIFEST\n'

echo -e 'NETWORK:\n*\n'

echo 'CACHE:'
cat index.html | grep ".*='//.*'" | grep -v '<a' | grep -v firebase | grep -v youtube | perl -pe "s/.*'(\/\/.*)'.*/${comment}http:\1/g"
find . -type f -name '*.css' -o -name '*.html' -o -name '*.png' | grep -v closure | grep -v .git | while read path ; do echo -e "${comment}${path:2}" ; done
echo -e "${comment}js/napster.js"
