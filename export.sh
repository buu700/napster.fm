#!/bin/bash


cd js

echo -e "goog.provide('exports');" > exports.js

echo -e '/** @preserve EXPORT START */' >> exports.js


echo -e "goog.require('require');" >> exports.js
for namespace in ${@} ; do
	echo "goog.require('${namespace}');" >> exports.js
done


echo -e 'window["exports"] = {' >> exports.js


for namespace in ${@} ; do
	cat ../*.html | grep -oP "${namespace}\.[^ ].*?[()'\",};]" | while read member ; do
		member="${member:0:${#member}-1}"
		echo "\"${member}\": ${member}," >> exports.js
	done
done


echo -e '"END": "END" };' >> exports.js


echo -e '/** @preserve EXPORT END */' >> exports.js
