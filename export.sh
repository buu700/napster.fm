#!/bin/bash


cd js

echo -e "goog.provide('exports');\n\n" > exports.js


echo "goog.exportSymbol('Napster', Napster);" >> exports.js

for namespace in ${@} ; do
	"goog.exportSymbol('${namespace}', ${namespace});" >> exports.js
	grep '^var .*;' "${namespace}.js" | grep -v '=' | while read var ; do var="${namespace}.${var:4:${#var}-5}" ; var="${var%;}" ; echo "goog.exportSymbol('${var}', ${var});" >> exports.js ; done
done
