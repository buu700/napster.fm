#!/bin/bash


echo -e	'CACHE MANIFEST\n'

echo -e "# `date +%s`\n\n"

echo -e 'NETWORK:\n*\n'

echo 'CACHE:'
cat index.html | tr ' ' '\n' | grep ".*='//.*'" | grep -v '<a' | grep -v firebase | grep -v youtube | perl -pe "s/.*'(\/\/.*)'.*/http:\1/g"
find . -type f -name '*.css' -o -name '*.html' -o -name '*.png' | grep -v closure | grep -v .git | while read path ; do echo "${path:2}" ; done
echo 'js/napster.js'
