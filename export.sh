#!/bin/bash


cd js

echo -e "goog.provide('exports');\n\n" > exports.js


for namespace in ${@} ; do
	echo "goog.require('${namespace}');" >> exports.js
	echo "window['${namespace}'] = ${namespace};" >> exports.js
	grep '^var .*;' "${namespace}.js" | grep -v '=' | while read var ; do var="${var:4:${#var}-5}" ; var="${var%;}" ; echo "window['${namespace}']['${var}'] = ${namespace}.${var};" >> exports.js ; done
done

echo "window['goog']['dom'] = goog.dom;" >> exports.js
