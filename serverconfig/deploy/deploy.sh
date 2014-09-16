#!/bin/bash

printf 'Content-type: text/html\n\n'

cd /var/www
wget https://github.com/buu700/napster.fm/archive/gh-pages.zip > /dev/null
unzip gh-pages.zip > /dev/null
rm -rf gh-pages.zip napsterfm.old
mv napsterfm napsterfm.old
mv napster* napsterfm

echo 'deployment complete'
