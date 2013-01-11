#!/bin/bash


while read comment ; do chmod 777 -R . ; git add . ; git commit -a -m "${comment}" ; git push ; echo -e "Line count: `cat schema.json *.html css/*.css js/*.js | wc -l`\n\n\n" ; ./deploy.sh ; done
