#!/bin/bash


cd js

echo -e "goog.provide('exports');" > exports.js

echo -e "goog.require('require');" >> exports.js


for namespace in "${@}" ; do
	echo "goog.require('${namespace}');" >> exports.js
	echo -e "/** @expose */\n${namespace} = ${namespace};" >> exports.js
done
