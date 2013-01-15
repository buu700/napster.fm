#!/bin/bash


cd js

echo -e "goog.provide('exports');" > exports.js

echo -e "goog.require('require');" >> exports.js


for namespace in "${@}" ; do
	echo "goog.require('${namespace}');" >> exports.js
	echo "window['${namespace}'] = ${namespace};" >> exports.js
done


function regexInPlace { cat "${2}" | perl -pe "${1}" > ".${2}.tmp" && mv ".${2}.tmp" "${2}"; }
level="\['.*'\]"

function exportMembers {
	namespace="${1}"
	# Just making the modification an arbitrarily high number of levels deep for now because I don't care enough to find a more elegant solution
	for i in {0..100} ; do
		levels="`yes "${level}" | head -n${i} | tr '\n' ' ' | sed 's/ //g'`" # $level * $i
		for file in `ls *.js` ; do
			regexInPlace "s/(?<"'!'"[\.\"'])(${namespace}${levels})\.(.*?)([^A-Za-z0-9$_])/\1\['\2'\]\3/g" "${file}"
		done
	done
}

exportMembers "self"
for namespace in "${@}" ; do exportMembers "${namespace}" ; done
