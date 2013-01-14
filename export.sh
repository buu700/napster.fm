#!/bin/bash


cd js

echo -e "goog.provide('exports');" > exports.js

echo -e '/** @preserve EXPORT */' >> exports.js


echo -e "goog.require('require');" >> exports.js
for namespace in ${@} ; do
	echo "goog.require('${namespace}');" >> exports.js
done


echo -e 'window["exports"] = {' >> exports.js


for namespace in ${@} ; do
	cat ../*.html | grep -oP "${namespace}\.[^ ].*?[()'\",};]" | while read member ; do
		member="${member:0:${#member}-1}"
		echo "\"${member}\": ${member}," >> exports.js

		cat ../*.html | grep -oP "[\"'].*? in ${member}" | while read repeat ; do
			repeat="${repeat:1}"
			var="`echo "${repeat}" | awk '{print $1}'`"

			cat ../*.html | grep -oP "${var}\.[^ ].*?[()'\",};]" | while read repeatMember ; do
				suffix="${repeatMember:${#var}}"
				newMember="${member}[0]${suffix}"
				echo "\"${repeatMember}\": ${newMember}," >> exports.js
			done
		done
	done
done


echo -e '"EXPORT.END": "EXPORT.END" };' >> exports.js
