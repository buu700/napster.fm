#!/bin/bash


cd js

echo -e "goog.provide('exports');\n\n/** @license HALLO GUIZ */" > exports.js


for namespace in ${@} ; do
	echo "goog.require('${namespace}');" >> exports.js
done


for namespace in ${@} ; do
	echo "window['${namespace}'] = ${namespace};" >> exports.js
	grep '^var .*;' "${namespace}.js" | grep -v '=' | while read var ; do var="${var:4:${#var}-5}" ; var="${var%;}" ; echo "window['${namespace}']['${var}'] = ${namespace}.${var};" >> exports.js ; done
done


echo "window['datastore']['data']['group'] = datastore.data.group;" >> exports.js
echo "window['datastore']['data']['lastPlayed'] = datastore.data.lastPlayed;" >> exports.js
echo "window['datastore']['data']['lastPlayed']['processed'] = datastore.data.lastPlayed.processed;" >> exports.js
echo "window['datastore']['data']['track'] = datastore.data.track;" >> exports.js
echo "window['datastore']['data']['user'] = datastore.data.user;" >> exports.js
echo "window['datastore']['data']['user']['current'] = datastore.data.user.current;" >> exports.js
