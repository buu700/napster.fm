#!/bin/bash


namespaces=(`grep -l 'goog.provide' js/*.js | while read namespace ; do echo -n " ${namespace:3:${#namespace}-6} " ; done`)

namespaceArgs=''
for namespace in "${namespaces[@]}" ; do
	namespaceArgs+="-n ${namespace} "
done


git pull
mkdir build
cp -rfa .git build/
cd build
git checkout gh-pages
git pull . gh-pages
git push
rm -rf *
cd ..
cp -rfa `ls --ignore build` build/
cd build


ls *.html | while read file ; do cat "${file}" | tr '\n' ' ' | sed 's/<!-- COMPILE START -->.*<!-- COMPILE END -->/\<script src="js\/napster.js"\>\<\/script\>/' > "${file}.tmp" ; java -jar htmlcompressor.jar -o "${file}" "${file}.tmp" ; rm "${file}.tmp" ; done


cd css
ls *.css | while read file ; do java -jar ../yuicompressor.jar --type css -o "${file}.tmp" "${file}" ; mv "${file}.tmp" "${file}" ; done
cd ..


echo -e "goog.provide('init');\n\ngoog.require('exports');\n\n`cat js/init.js`" > js/init.js
./export.sh "${namespaces[@]}"
js/closure-library/closure/bin/build/closurebuilder.py --root=js $namespaceArgs -n exports -n init --output_mode=compiled --compiler_jar=compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" --compiler_flags="--externs=js/externs.js" --output_file=js/napster.js

# Inject minified member names into html
function jsonify { json="`echo "${1}" | sed 's/ //g' | sed 's/\":/":"/g' | sed 's/,"/","/g'`" && echo "${json:0:${#json}-1}\"}" | python -mjson.tool; }
function jsonval { jsonify "${1}" | grep "${2}" | head -n1 | sed -E 's/.*".*": "(.*)".*/\1/'; }
function jsonkeys { jsonify "${1}" | grep ':' | sed -E 's/.*"(.*)":.*/\1/g' | tr '\n' ' '; }

exports="`cat js/napster.js | sed -E 's/.*EXPORT .*=(.*});.*/\1/'`"
cat js/napster.js | sed -E 's/\/\*.*EXPORT.*};//' > js/napster.js.tmp
mv js/napster.js.tmp js/napster.js

for key in "`jsonkeys "${exports}"`" ; do
	value="`jsonval "${exports}" "${key}"`"
	for file in "`ls *.html`" ; do
		sed -i "s/${key}/${value}/g" "${file}"
	done
done

# java -jar yuicompressor.jar --nomunge --type js -o js/napster.js.tmp js/napster.js
# mv js/napster.js.tmp js/napster.js


git add .
git commit -a -m 'deployment'
git push


cd ..
rm -rf build
