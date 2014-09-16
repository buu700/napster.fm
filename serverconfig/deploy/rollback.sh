#!/bin/bash

printf 'Content-type: text/html\n\n'

cd /var/www
mv napsterfm napsterfm.new
mv napsterfm.old napsterfm
mv napsterfm.new napsterfm.old

echo 'rollback complete'
