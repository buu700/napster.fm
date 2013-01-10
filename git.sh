#!/bin/bash


while read comment ; do git add . ; git commit -a -m "${comment}" ; git push ; echo "Line count: `cat schema.json *.html css/*.css js/*.js | wc -l`" ; ./deploy.sh ; done
