#!/bin/bash


cd js

echo -e "goog.provide('exports');" > exports.js

echo -e '/** @license EXPORT START */' >> exports.js


echo -e "goog.require('require');" >> exports.js
for namespace in ${@} ; do
	echo "goog.require('${namespace}');" >> exports.js
done


echo -e 'window["exports"] = {' >> exports.js


for namespace in ${@} ; do
	echo "\"${namespace}\": ${namespace}," >> exports.js
	grep '^var .*;' "${namespace}.js" | grep -v '=' | while read var ; do var="${var:4:${#var}-5}" ; var="${var%;}" ; echo "\"${namespace}.${var}\": ${namespace}.${var}," >> exports.js ; done
done


echo "\"datastore.data.group\": datastore.data.group," >> exports.js
echo "\"datastore.data.lastPlayed\": datastore.data.lastPlayed," >> exports.js
echo "\"datastore.data.lastPlayed.processed\": datastore.data.lastPlayed.processed," >> exports.js
echo "\"datastore.data.track\": datastore.data.track," >> exports.js
echo "\"datastore.data.user\": datastore.data.user," >> exports.js
echo "\"datastore.data.user.current\": datastore.data.user.current" >> exports.js


echo -e '};' >> exports.js


echo -e '/** @license EXPORT END */' >> exports.js