#!/bin/bash


cd js

echo -e "goog.provide('postinit');\n\ngoog.require('init');\n" > postinit.js


for namespace in ${@} ; do
	echo "goog.require('${namespace}');" >> postinit.js
done


for namespace in ${@} ; do
	echo "console.log(${namespace});" >> postinit.js
	grep '^var .*;' "${namespace}.js" | grep -v '=' | while read var ; do var="${var:4:${#var}-5}" ; var="${var%;}" ; echo "console.log(${namespace}.${var});" >> postinit.js ; done
done


echo "console.log(datastore.data.group);" >> postinit.js
echo "console.log(datastore.data.lastPlayed);" >> postinit.js
echo "console.log(datastore.data.lastPlayed.processed);" >> postinit.js
echo "console.log(datastore.data.track);" >> postinit.js
echo "console.log(datastore.data.user);" >> postinit.js
echo "console.log(datastore.data.user.current);" >> postinit.js
