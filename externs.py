#!/usr/bin/python2.7

# https://developers.google.com/closure/compiler/docs/api-tutorial3#externs


import httplib, urllib, sys


params	= urllib.urlencode([
	('js_code', sys.argv[2]),
	('compilation_level', 'ADVANCED_OPTIMIZATIONS'),
	('output_format', 'text'),
	('output_info', 'compiled_code'),
	('externs_url', sys.argv[1]),
	('formatting', 'pretty_print')
])

headers		= {'Content-type': 'application/x-www-form-urlencoded'}
conn		= httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response	= conn.getresponse()
data		= response.read()
print data
conn.close
