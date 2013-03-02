#!/bin/bash


cd js

echo -e "goog.provide('napster.exports');" > exports.js

echo -e "goog.require('napster.require');" >> exports.js


for namespace in "${@}" ; do
	echo "goog.require('napster.${namespace}');" >> exports.js

	# Expose $ instead of closurequery for closurequery
	test "${namespace}" == 'closurequery' && namespace='$'
	
	echo -e "/** @expose */\n${namespace};" >> exports.js
done
